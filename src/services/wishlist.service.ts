import { supabase } from '@/integrations/supabase';
import type { Tables } from '@/integrations/supabase';

export type WishlistItem = Tables<'wishlist'>;

export interface WishlistItemWithProduct extends WishlistItem {
  product: Tables<'products'>;
}

export const wishlistService = {
  /**
   * Get wishlist items for current user
   */
  async getWishlist() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', user.id);

    if (error) throw error;
    return data as WishlistItemWithProduct[];
  },

  /**
   * Add item to wishlist
   */
  async addItem(productId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('wishlist')
      .insert({
        user_id: user.id,
        product_id: productId,
      })
      .select()
      .single();

    if (error) {
      // Ignore duplicate error
      if (error.code === '23505') return null;
      throw error;
    }
    return data;
  },

  /**
   * Remove item from wishlist
   */
  async removeItem(productId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) throw error;
  },

  /**
   * Toggle item in wishlist
   */
  async toggleItem(productId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if exists
    const { data: existing } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (existing) {
      await this.removeItem(productId);
      return false;
    } else {
      await this.addItem(productId);
      return true;
    }
  },

  /**
   * Check if product is in wishlist
   */
  async isInWishlist(productId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    return !!data;
  },

  /**
   * Clear wishlist
   */
  async clearWishlist() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
  }
};
