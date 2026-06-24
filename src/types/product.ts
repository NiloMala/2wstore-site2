export interface ProductVariant {
  size: string;
  color: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  original_price?: number;
  image?: string;
  images?: string[];
  category?: string;
  categoryId?: string;
  stock?: number;
  sizes?: string[];
  colors?: string[];
  variants?: ProductVariant[];
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  created_at?: string;
  createdAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export default Product;
