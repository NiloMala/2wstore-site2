import { supabase } from '@/integrations/supabase/client';

export const productService = {
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(id, name, slug)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    return (data || []).map(normalizeProduct);
  },

  async getProductById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(id, name, slug)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? normalizeProduct(data) : null;
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');

    if (error) throw error;
    return data || [];
  },

  async getFeatured(filter: 'new' | 'bestseller' | 'sale', limit = 4) {
    let query = supabase
      .from('products')
      .select('*, category:categories(id, name, slug)')
      .eq('is_active', true)
      .limit(limit);

    switch (filter) {
      case 'new':
        query = query.eq('is_new', true);
        break;
      case 'bestseller':
        query = query.eq('is_best_seller', true);
        break;
      case 'sale':
        query = query.eq('is_on_sale', true);
        break;
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
    return (data || []).map(normalizeProduct);
  }
};

export default productService;

function normalizeProduct(p: any) {
  // Extract category name from joined object or fallback
  const categoryName = p.category?.name ?? p.category_name ?? undefined;
  const categoryId = p.category?.id ?? p.category_id ?? undefined;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug ?? p.name,
    description: p.description ?? p.desc ?? p.summary,
    price: Number(p.price ?? p.preco ?? 0),
    originalPrice: Number(p.original_price ?? p.originalPrice ?? p.old_price ?? 0) || undefined,
    image: p.image ?? (p.images && p.images[0]) ?? undefined,
    images: p.images ?? [],
    category: categoryName,
    categoryId: categoryId,
    sizes: p.sizes ?? p.available_sizes ?? [],
    colors: p.colors ?? p.available_colors ?? [],
    isNew: Boolean(p.is_new ?? p.isNew),
    isBestSeller: Boolean(p.is_best_seller ?? p.isBestSeller),
    isOnSale: Boolean(p.is_on_sale ?? p.isOnSale),
    created_at: p.created_at ?? p.createdAt,
    createdAt: p.created_at ?? p.createdAt,
    // keep raw data for edge cases
    _raw: p,
  } as any;
}
