import { supabase } from '@/integrations/supabase';
import type { Tables, TablesUpdate } from '@/integrations/supabase';

export type ShippingSettings = Tables<'shipping_settings'>;

export interface FreightProduct {
  weight: number;      // kg
  height: number;      // cm
  width: number;       // cm
  length: number;      // cm
  quantity: number;
  insurance_value?: number;
}

export interface FreightOption {
  id: number;
  name: string;
  company: string;
  company_logo: string;
  price: number;
  discount: number;
  final_price: number;
  delivery_time: number;
  delivery_range: {
    min: number;
    max: number;
  };
  currency: string;
  packages: any[];
}

export interface FreightCalculationResult {
  carriers: FreightOption[];
  error?: string;
}

export interface CreateShipmentResult {
  ok: boolean;
  message: string;
  shipment_id?: string;
  shipment_protocol?: string;
  tracking_code?: string;
  next_steps?: string;
  error?: string;
}

export const shippingService = {
  // ==================== SHIPPING SETTINGS (ADMIN) ====================

  /**
   * Get shipping settings
   */
  async getSettings() {
    const { data, error } = await supabase
      .from('shipping_settings')
      .select('*')
      .eq('provider', 'melhor_envio')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Update shipping settings (admin)
   */
  async updateSettings(settings: Partial<ShippingSettings>) {
    const { data: existing } = await supabase
      .from('shipping_settings')
      .select('id')
      .eq('provider', 'melhor_envio')
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('shipping_settings')
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
        .from('shipping_settings')
        .insert({
          provider: 'melhor_envio',
          ...settings,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  // ==================== FREIGHT CALCULATION ====================

  /**
   * Calculate freight options
   */
  async calculateFreight(postalCode: string, products: FreightProduct[]): Promise<FreightCalculationResult> {
    const { data, error } = await supabase.functions.invoke('calculate-freight', {
      body: {
        to_postal_code: postalCode,
        products,
      },
    });

    if (error) throw error;
    if (data.error) {
      return { carriers: [], error: data.error };
    }

    return data;
  },

  // ==================== SHIPMENT CREATION ====================

  /**
   * Create shipment in Melhor Envio (after payment approved)
   */
  async createShipment(orderId: string): Promise<CreateShipmentResult> {
    const { data, error } = await supabase.functions.invoke('create-melhor-envio-shipment', {
      body: {
        order_id: orderId,
      },
    });

    if (error) throw error;
    return data;
  },

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Format postal code (remove non-numeric chars)
   */
  formatPostalCode(postalCode: string): string {
    return postalCode.replace(/\D/g, '');
  },

  /**
   * Validate postal code (8 digits)
   */
  isValidPostalCode(postalCode: string): boolean {
    const cleaned = this.formatPostalCode(postalCode);
    return cleaned.length === 8;
  },

  /**
   * Format price to BRL
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  },

  /**
   * Format delivery time
   */
  formatDeliveryTime(days: number): string {
    if (days === 1) {
      return '1 dia útil';
    }
    return `${days} dias úteis`;
  },

  /**
   * Get Melhor Envio settings (alias for getSettings)
   */
  async getMelhorEnvioSettings() {
    return this.getSettings();
  },

  /**
   * Update Melhor Envio settings (alias for updateSettings)
   */
  async updateMelhorEnvioSettings(settings: Partial<ShippingSettings>) {
    return this.updateSettings(settings);
  },
};
