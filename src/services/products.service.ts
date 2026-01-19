import { supabase } from '@/integrations/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase';

export type Product = Tables<'products'>;
export type ProductInsert = TablesInsert<'products'>;
export type ProductUpdate = TablesUpdate<'products'>;

export const productsService = {
  /**
   * Get all active products
   */
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug, icon)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get all products (admin)
   */
  async getAllAdmin() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug, icon)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get product by ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug, icon)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get product by slug
   */
  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug, icon)
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get products by category
   */
  async getByCategory(categorySlug: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories!inner(id, name, slug, icon)
      `)
      .eq('is_active', true)
      .eq('category.slug', categorySlug)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get featured products (new or best seller)
   */
  async getFeatured() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug, icon)
      `)
      .eq('is_active', true)
      .or('is_new.eq.true,is_best_seller.eq.true')
      .limit(8);

    if (error) throw error;
    return data;
  },

  /**
   * Get products on sale
   */
  async getOnSale() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug, icon)
      `)
      .eq('is_active', true)
      .eq('is_on_sale', true);

    if (error) throw error;
    return data;
  },

  /**
   * Search products
   */
  async search(query: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug, icon)
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Create product (admin)
   */
  async create(product: ProductInsert) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update product (admin)
   */
  async update(id: string, product: ProductUpdate) {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete product (admin)
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get low stock products (admin)
   */
  async getLowStock(threshold: number = 10) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .lt('stock', threshold)
      .eq('is_active', true)
      .order('stock', { ascending: true });

    if (error) throw error;
    return data;
  }
};
