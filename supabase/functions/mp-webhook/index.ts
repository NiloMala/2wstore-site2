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
    console.log('Mercado Pago Webhook received');

    // Mercado Pago envia topic como query parameter
    const url = new URL(req.url);
    const topic = url.searchParams.get('topic');
    const id = url.searchParams.get('id');

    console.log('Webhook topic:', topic, 'id:', id);

    // Processar APENAS payment para evitar duplicatas (MP envia payment + merchant_order)
    if (topic !== 'payment') {
      console.log('Ignoring topic:', topic, '(only processing payment)');
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    if (!id) {
      return new Response(JSON.stringify({ error: 'No ID provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const paymentId = id;

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: config } = await supabaseClient
      .from('payment_settings')
      .select('access_token')
      .eq('gateway', 'mercado_pago')
      .eq('is_active', true)
      .single();

    if (!config?.access_token) {
      throw new Error('Mercado Pago not configured');
    }

    // Buscar o pagamento diretamente (já que só processamos topic=payment)
    console.log('Fetching payment:', paymentId);
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${config.access_token}` }
    });

    if (!mpResponse.ok) {
      throw new Error(`Failed to fetch payment: ${mpResponse.statusText}`);
    }

    const payment = await mpResponse.json();
    const orderId = payment.external_reference;
    console.log('Payment status:', payment.status, 'Order ID:', orderId);

    if (!orderId) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    let newPaymentStatus = 'pending';
    let newStatus = 'pending';

    if (payment.status === 'approved') {
      newPaymentStatus = 'paid';
      newStatus = 'processing';
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      newPaymentStatus = 'failed';
      newStatus = 'cancelled';
    }

    await supabaseClient
      .from('orders')
      .update({
        payment_status: newPaymentStatus,
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    await supabaseClient
      .from('payments')
      .upsert({
        order_id: orderId,
        gateway: 'mercado_pago',
        transaction_id: payment.id.toString(),
        amount: payment.transaction_amount,
        currency: payment.currency_id,
        status: payment.status,
        payment_data: payment,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'transaction_id'
      });

    // Se pagamento aprovado, gerar envio no Melhor Envio
    if (payment.status === 'approved') {
      console.log('Payment approved, creating Melhor Envio shipment for order:', orderId);
      
      try {
        const { data: shipmentData, error: shipmentError } = await supabaseClient.functions.invoke(
          'create-melhor-envio-shipment',
          {
            body: { order_id: orderId }
          }
        );

        if (shipmentError) {
          console.error('Error creating shipment:', shipmentError);
        } else {
          console.log('Shipment created successfully:', shipmentData);
        }
      } catch (shipmentErr) {
        console.error('Failed to create shipment:', shipmentErr);
        // Não falhar o webhook por causa do envio
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
