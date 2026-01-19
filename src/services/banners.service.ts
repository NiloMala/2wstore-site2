import { supabase } from '@/integrations/supabase';
import type { Tables, TablesInsert, TablesUpdate, Enums } from '@/integrations/supabase';

export type Banner = Tables<'banners'>;
export type BannerInsert = TablesInsert<'banners'>;
export type BannerUpdate = TablesUpdate<'banners'>;
export type BannerPosition = Enums<'banner_position'>;

export const bannersService = {
  /**
   * Get active banners by position
   */
  async getActiveByPosition(position: BannerPosition) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('position', position)
      .eq('is_active', true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gt.${now}`)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get hero banner
   */
  async getHeroBanner() {
    const banners = await this.getActiveByPosition('hero');
    return banners[0] || null;
  },

  /**
   * Get promo banners
   */
  async getPromoBanners() {
    return this.getActiveByPosition('promo');
  },

  /**
   * Get all banners (admin)
   */
  async getAllAdmin() {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('position')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Create banner (admin)
   */
  async create(banner: BannerInsert) {
    const { data, error } = await supabase
      .from('banners')
      .insert(banner)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update banner (admin)
   */
  async update(id: string, banner: BannerUpdate) {
    const { data, error } = await supabase
      .from('banners')
      .update(banner)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete banner (admin)
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Toggle banner active state (admin)
   */
  async toggleActive(id: string) {
    const { data: banner } = await supabase
      .from('banners')
      .select('is_active')
      .eq('id', id)
      .single();

    if (banner) {
      return this.update(id, { is_active: !banner.is_active });
    }
  },

  /**
   * Reorder banners (admin)
   */
  async reorder(bannerIds: string[]) {
    for (let i = 0; i < bannerIds.length; i++) {
      await supabase
        .from('banners')
        .update({ display_order: i + 1 })
        .eq('id', bannerIds[i]);
    }
  }
};
