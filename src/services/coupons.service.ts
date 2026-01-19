import { supabase } from '@/integrations/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase';

export type Coupon = Tables<'coupons'>;
export type CouponInsert = TablesInsert<'coupons'>;
export type CouponUpdate = TablesUpdate<'coupons'>;

export const couponsService = {
  /**
   * Validate and get coupon by code
   */
  async validateCoupon(code: string, orderTotal: number) {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { valid: false, error: 'Cupom inválido ou não encontrado' };
    }

    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { valid: false, error: 'Cupom expirado' };
    }

    // Check usage limit
    if (data.max_uses && data.used_count && data.used_count >= data.max_uses) {
      return { valid: false, error: 'Cupom esgotado' };
    }

    // Check minimum purchase
    if (data.min_purchase && orderTotal < Number(data.min_purchase)) {
      return {
        valid: false,
        error: `Valor mínimo de R$ ${Number(data.min_purchase).toFixed(2)} para usar este cupom`
      };
    }

    // Calculate discount
    let discountAmount = 0;
    if (data.discount_type === 'percentage') {
      discountAmount = orderTotal * (Number(data.discount_value) / 100);
    } else {
      discountAmount = Number(data.discount_value);
    }

    return {
      valid: true,
      coupon: data,
      discountAmount
    };
  },

  /**
   * Get all coupons (admin)
   */
  async getAllAdmin() {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Create coupon (admin)
   */
  async create(coupon: CouponInsert) {
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        ...coupon,
        code: coupon.code.toUpperCase(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update coupon (admin)
   */
  async update(id: string, coupon: CouponUpdate) {
    const { data, error } = await supabase
      .from('coupons')
      .update({
        ...coupon,
        code: coupon.code?.toUpperCase(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete coupon (admin)
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Increment coupon usage
   */
  async incrementUsage(id: string) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('used_count')
      .eq('id', id)
      .single();

    if (coupon) {
      await supabase
        .from('coupons')
        .update({ used_count: (coupon.used_count || 0) + 1 })
        .eq('id', id);
    }
  }
};
