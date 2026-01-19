import { supabase } from '@/integrations/supabase';
import type { Tables, TablesInsert } from '@/integrations/supabase';

export type CartItem = Tables<'cart_items'>;
export type CartItemInsert = TablesInsert<'cart_items'>;

export interface CartItemWithProduct extends CartItem {
  product: Tables<'products'>;
}

export const cartService = {
  /**
   * Get cart items for current user
   */
  async getCartItems() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', user.id);

    if (error) throw error;
    return data as CartItemWithProduct[];
  },

  /**
   * Add item to cart
   */
  async addItem(productId: string, quantity: number = 1, selectedSize?: string, selectedColor?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if item already exists
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .eq('selected_size', selectedSize || '')
      .eq('selected_color', selectedColor || '')
      .single();

    if (existing) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // Insert new item
    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: user.id,
        product_id: productId,
        quantity,
        selected_size: selectedSize,
        selected_color: selectedColor,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update item quantity
   */
  async updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(itemId);
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  /**
   * Clear cart
   */
  async clearCart() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
  },

  /**
   * Sync local cart to database (after login)
   */
  async syncCart(localItems: { productId: string; quantity: number; size?: string; color?: string }[]) {
    for (const item of localItems) {
      await this.addItem(item.productId, item.quantity, item.size, item.color);
    }
  }
};
