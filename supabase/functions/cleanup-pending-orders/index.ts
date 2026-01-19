import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting cleanup of pending orders older than 48 hours...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Calculate 48 hours ago
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - 48);
    const cutoffISO = cutoffDate.toISOString();

    console.log(`Cutoff date: ${cutoffISO}`);

    // Find pending orders older than 48 hours
    const { data: oldOrders, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_number, created_at, status, payment_status')
      .eq('status', 'pending')
      .lt('created_at', cutoffISO);

    if (fetchError) {
      console.error('Error fetching old orders:', fetchError);
      throw new Error(`Error fetching orders: ${fetchError.message}`);
    }

    if (!oldOrders || oldOrders.length === 0) {
      console.log('No pending orders older than 48 hours found');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No orders to cleanup',
          deleted_count: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Found ${oldOrders.length} orders to delete:`, oldOrders.map(o => o.order_number));

    const orderIds = oldOrders.map(o => o.id);

    // Delete order_items first (foreign key constraint)
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .in('order_id', orderIds);

    if (itemsError) {
      console.error('Error deleting order items:', itemsError);
      throw new Error(`Error deleting order items: ${itemsError.message}`);
    }

    console.log('Order items deleted successfully');

    // Delete payments if exists
    const { error: paymentsError } = await supabase
      .from('payments')
      .delete()
      .in('order_id', orderIds);

    if (paymentsError) {
      console.error('Error deleting payments:', paymentsError);
      // Don't throw, payments might not exist for pending orders
    }

    // Delete the orders
    const { error: ordersError } = await supabase
      .from('orders')
      .delete()
      .in('id', orderIds);

    if (ordersError) {
      console.error('Error deleting orders:', ordersError);
      throw new Error(`Error deleting orders: ${ordersError.message}`);
    }

    console.log(`Successfully deleted ${oldOrders.length} pending orders`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Deleted ${oldOrders.length} pending orders older than 48 hours`,
        deleted_count: oldOrders.length,
        deleted_orders: oldOrders.map(o => ({
          id: o.id,
          order_number: o.order_number,
          created_at: o.created_at
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Cleanup error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
