import { supabase } from '@/integrations/supabase';
import type { Tables, TablesUpdate } from '@/integrations/supabase';

export type PaymentSettings = Tables<'payment_settings'>;
export type Payment = Tables<'payments'>;

export interface CreatePreferenceData {
  orderId: string;
  amount: number;
  items?: Array<{
    title: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
  }>;
  backUrls?: {
    success: string;
    failure: string;
    pending: string;
  };
  externalReference?: string;
}

export interface PreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export const paymentService = {
  // ==================== PAYMENT SETTINGS (ADMIN) ====================

  /**
   * Get payment settings
   */
  async getSettings() {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('gateway', 'mercado_pago')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Update payment settings (admin)
   */
  async updateSettings(settings: Partial<PaymentSettings>) {
    const { data: existing } = await supabase
      .from('payment_settings')
      .select('id')
      .eq('gateway', 'mercado_pago')
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('payment_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('payment_settings')
        .insert({
          gateway: 'mercado_pago',
          ...settings,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  // ==================== MERCADO PAGO OPERATIONS ====================

  /**
   * Create Mercado Pago preference (checkout)
   */
  async createPreference(data: CreatePreferenceData): Promise<PreferenceResponse> {
    const { data: response, error } = await supabase.functions.invoke('create-mp-preference', {
      body: {
        orderId: data.orderId,
        amount: data.amount,
        items: data.items,
        back_urls: data.backUrls,
        external_reference: data.externalReference || data.orderId,
      },
    });

    if (error) throw error;
    if (response.error) throw new Error(response.error);

    return response;
  },

  // ==================== PAYMENT RECORDS ====================

  /**
   * Get payments for an order
   */
  async getOrderPayments(orderId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get all payments (admin)
   */
  async getAllPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select('*, order:orders(order_number, total)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get payment by transaction ID
   */
  async getPaymentByTransactionId(transactionId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
};
