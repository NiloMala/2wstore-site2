import { supabase } from '@/integrations/supabase';
import type { Tables, TablesInsert, TablesUpdate, Enums } from '@/integrations/supabase';

export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type OrderInsert = TablesInsert<'orders'>;
export type OrderItemInsert = TablesInsert<'order_items'>;
export type OrderUpdate = TablesUpdate<'orders'>;
export type OrderStatus = Enums<'order_status'>;

export interface OrderWithItems extends Order {
  items: OrderItem[];
  shipping_address?: Tables<'addresses'>;
}

export interface CreateOrderData {
  items: Omit<OrderItemInsert, 'order_id'>[];
  subtotal: number;
  discount?: number;
  shipping?: number;
  total: number;
  shipping_address_id?: string;
  coupon_id?: string;
  notes?: string;
}

export const ordersService = {
  /**
   * Get orders for current user
   */
  async getMyOrders() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        shipping_address:addresses(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as OrderWithItems[];
  },

  /**
   * Get order by ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        shipping_address:addresses(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as OrderWithItems;
  },

  /**
   * Get all orders (admin)
   */
  async getAllAdmin() {
    // Fetch orders with items and shipping address
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        shipping_address:addresses(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!orders || orders.length === 0) return [];

    // Get unique user IDs
    const userIds = [...new Set(orders.map(o => o.user_id).filter(Boolean))];

    // Fetch user profiles separately
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', userIds);

    // Map profiles to orders
    const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

    return orders.map(order => ({
      ...order,
      user: order.user_id ? profilesMap.get(order.user_id) || null : null
    }));
  },

  /**
   * Get orders by status (admin)
   */
  async getByStatus(status: OrderStatus) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        shipping_address:addresses(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as OrderWithItems[];
  },

  /**
   * Create order
   */
  async create(orderData: CreateOrderData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        subtotal: orderData.subtotal,
        discount: orderData.discount || 0,
        shipping: orderData.shipping || 0,
        total: orderData.total,
        shipping_address_id: orderData.shipping_address_id,
        coupon_id: orderData.coupon_id,
        notes: orderData.notes,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = orderData.items.map(item => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order;
  },

  /**
   * Update order status (admin)
   */
  async updateStatus(id: string, status: OrderStatus, trackingCode?: string) {
    const updateData: OrderUpdate = { status };
    if (trackingCode) {
      updateData.tracking_code = trackingCode;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete order and its items (admin)
   */
  async delete(id: string) {
    // Remove order items first to be safe
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', id);

    if (itemsError) throw itemsError;

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  /**
   * Get order statistics (admin)
   */
  async getStats() {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, total');

    if (error) throw error;

    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      totalRevenue: orders
        .filter(o => o.status === 'confirmed' || o.status === 'shipped' || o.status === 'delivered')
        .reduce((sum, o) => sum + Number(o.total), 0),
    };

    return stats;
  }
};
