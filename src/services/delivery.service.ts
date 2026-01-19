import { supabase } from '@/integrations/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase';

export type DeliveryZone = Tables<'delivery_zones'>;
export type DeliveryZoneInsert = TablesInsert<'delivery_zones'>;
export type DeliveryZoneUpdate = TablesUpdate<'delivery_zones'>;
export type DeliverySettings = Tables<'delivery_settings'>;

export const deliveryService = {
  // ==================== DELIVERY ZONES ====================

  /**
   * Get all active delivery zones
   */
  async getActiveZones() {
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data;
  },

  /**
   * Get all delivery zones (admin)
   */
  async getAllZonesAdmin() {
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  /**
   * Find zone by neighborhood
   */
  async findZoneByNeighborhood(neighborhood: string) {
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('is_active', true)
      .contains('neighborhoods', [neighborhood]);

    if (error) throw error;
    return data?.[0] || null;
  },

  /**
   * Create delivery zone (admin)
   */
  async createZone(zone: DeliveryZoneInsert) {
    const { data, error } = await supabase
      .from('delivery_zones')
      .insert(zone)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update delivery zone (admin)
   */
  async updateZone(id: string, zone: DeliveryZoneUpdate) {
    const { data, error } = await supabase
      .from('delivery_zones')
      .update(zone)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete delivery zone (admin)
   */
  async deleteZone(id: string) {
    const { error } = await supabase
      .from('delivery_zones')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Toggle zone active state (admin)
   */
  async toggleZoneActive(id: string) {
    const { data: zone } = await supabase
      .from('delivery_zones')
      .select('is_active')
      .eq('id', id)
      .single();

    if (zone) {
      return this.updateZone(id, { is_active: !zone.is_active });
    }
  },

  // ==================== DELIVERY SETTINGS ====================

  /**
   * Get delivery settings
   */
  async getSettings() {
    const { data, error } = await supabase
      .from('delivery_settings')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data || {
      is_motoboy_enabled: true,
      minimum_order: 0,
      free_delivery_threshold: null,
    };
  },

  /**
   * Update delivery settings (admin)
   */
  async updateSettings(settings: Partial<DeliverySettings>) {
    // Get existing settings
    const { data: existing } = await supabase
      .from('delivery_settings')
      .select('id')
      .limit(1)
      .single();

    if (existing) {
      // Update
      const { data, error } = await supabase
        .from('delivery_settings')
        .update(settings)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create
      const { data, error } = await supabase
        .from('delivery_settings')
        .insert(settings)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  // ==================== DELIVERY CALCULATION ====================

  /**
   * Calculate delivery price
   */
  async calculateDelivery(neighborhood: string, orderTotal: number) {
    const settings = await this.getSettings();

    // Check minimum order
    if (settings.minimum_order && orderTotal < Number(settings.minimum_order)) {
      return {
        available: false,
        error: `Pedido mínimo de R$ ${Number(settings.minimum_order).toFixed(2)} para entrega`
      };
    }

    // Check if motoboy is enabled
    if (!settings.is_motoboy_enabled) {
      return {
        available: false,
        error: 'Entrega por motoboy não disponível no momento'
      };
    }

    // Find zone
    const zone = await this.findZoneByNeighborhood(neighborhood);
    if (!zone) {
      return {
        available: false,
        error: 'Bairro não atendido pela entrega por motoboy'
      };
    }

    // Check free delivery
    const isFreeDelivery = settings.free_delivery_threshold &&
      orderTotal >= Number(settings.free_delivery_threshold);

    return {
      available: true,
      zone,
      price: isFreeDelivery ? 0 : Number(zone.price),
      estimatedTime: zone.estimated_time,
      isFreeDelivery
    };
  }
};
