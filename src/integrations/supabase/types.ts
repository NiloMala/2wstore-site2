export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string | null
          street: string
          number: string
          complement: string | null
          neighborhood: string
          city: string
          state: string
          zip_code: string
          is_default: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string | null
          street: string
          number: string
          complement?: string | null
          neighborhood: string
          city: string
          state: string
          zip_code: string
          is_default?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string | null
          street?: string
          number?: string
          complement?: string | null
          neighborhood?: string
          city?: string
          state?: string
          zip_code?: string
          is_default?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      banners: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          description: string | null
          image_url: string
          link_url: string | null
          position: Database["public"]["Enums"]["banner_position"]
          display_order: number | null
          is_active: boolean | null
          starts_at: string | null
          ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          description?: string | null
          image_url: string
          link_url?: string | null
          position?: Database["public"]["Enums"]["banner_position"]
          display_order?: number | null
          is_active?: boolean | null
          starts_at?: string | null
          ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          description?: string | null
          image_url?: string
          link_url?: string | null
          position?: Database["public"]["Enums"]["banner_position"]
          display_order?: number | null
          is_active?: boolean | null
          starts_at?: string | null
          ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          selected_size: string | null
          selected_color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          selected_size?: string | null
          selected_color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          selected_size?: string | null
          selected_color?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string | null
          description: string | null
          is_active: boolean | null
          display_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon?: string | null
          description?: string | null
          is_active?: boolean | null
          display_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string | null
          description?: string | null
          is_active?: boolean | null
          display_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          id: string
          code: string
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          min_purchase: number | null
          max_uses: number | null
          used_count: number | null
          expires_at: string | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          min_purchase?: number | null
          max_uses?: number | null
          used_count?: number | null
          expires_at?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          min_purchase?: number | null
          max_uses?: number | null
          used_count?: number | null
          expires_at?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      delivery_settings: {
        Row: {
          id: string
          is_motoboy_enabled: boolean | null
          minimum_order: number | null
          free_delivery_threshold: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          is_motoboy_enabled?: boolean | null
          minimum_order?: number | null
          free_delivery_threshold?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          is_motoboy_enabled?: boolean | null
          minimum_order?: number | null
          free_delivery_threshold?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          id: string
          name: string
          neighborhoods: string[] | null
          price: number
          estimated_time: string | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          neighborhoods?: string[] | null
          price?: number
          estimated_time?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          neighborhoods?: string[] | null
          price?: number
          estimated_time?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_image: string | null
          price: number
          quantity: number
          size: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_image?: string | null
          price: number
          quantity: number
          size?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_image?: string | null
          price?: number
          quantity?: number
          size?: string | null
          color?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          discount: number | null
          shipping: number | null
          total: number
          shipping_address_id: string | null
          tracking_code: string | null
          notes: string | null
          coupon_id: string | null
          melhor_envio_shipment_id: string | null
          melhor_envio_protocol: string | null
          invoice_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          discount?: number | null
          shipping?: number | null
          total: number
          shipping_address_id?: string | null
          tracking_code?: string | null
          notes?: string | null
          coupon_id?: string | null
          melhor_envio_shipment_id?: string | null
          melhor_envio_protocol?: string | null
          invoice_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          discount?: number | null
          shipping?: number | null
          total?: number
          shipping_address_id?: string | null
          tracking_code?: string | null
          notes?: string | null
          coupon_id?: string | null
          melhor_envio_shipment_id?: string | null
          melhor_envio_protocol?: string | null
          invoice_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      product_reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string | null
          rating: number
          comment: string | null
          is_approved: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id?: string | null
          rating: number
          comment?: string | null
          is_approved?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string | null
          rating?: number
          comment?: string | null
          is_approved?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          original_price: number | null
          category_id: string | null
          sizes: string[] | null
          colors: string[] | null
          images: string[] | null
          stock: number | null
          variants: Json | null
          is_new: boolean | null
          is_best_seller: boolean | null
          is_on_sale: boolean | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          price: number
          original_price?: number | null
          category_id?: string | null
          sizes?: string[] | null
          colors?: string[] | null
          images?: string[] | null
          stock?: number | null
          variants?: Json | null
          is_new?: boolean | null
          is_best_seller?: boolean | null
          is_on_sale?: boolean | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          price?: number
          original_price?: number | null
          category_id?: string | null
          sizes?: string[] | null
          colors?: string[] | null
          images?: string[] | null
          stock?: number | null
          variants?: Json | null
          is_new?: boolean | null
          is_best_seller?: boolean | null
          is_on_sale?: boolean | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: Database["public"]["Enums"]["app_role"]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      wishlist: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      payment_settings: {
        Row: {
          id: string
          gateway: string
          access_token: string | null
          public_key: string | null
          is_sandbox: boolean | null
          is_active: boolean | null
          webhook_secret: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          gateway?: string
          access_token?: string | null
          public_key?: string | null
          is_sandbox?: boolean | null
          is_active?: boolean | null
          webhook_secret?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          gateway?: string
          access_token?: string | null
          public_key?: string | null
          is_sandbox?: boolean | null
          is_active?: boolean | null
          webhook_secret?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      shipping_settings: {
        Row: {
          id: string
          provider: string
          api_token: string | null
          client_id: string | null
          client_secret: string | null
          is_sandbox: boolean | null
          is_active: boolean | null
          origin_name: string | null
          origin_email: string | null
          origin_phone: string | null
          origin_document: string | null
          origin_postal_code: string | null
          origin_address: string | null
          origin_number: string | null
          origin_complement: string | null
          origin_neighborhood: string | null
          origin_city: string | null
          origin_state: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider?: string
          api_token?: string | null
          client_id?: string | null
          client_secret?: string | null
          is_sandbox?: boolean | null
          is_active?: boolean | null
          origin_name?: string | null
          origin_email?: string | null
          origin_phone?: string | null
          origin_document?: string | null
          origin_postal_code?: string | null
          origin_address?: string | null
          origin_number?: string | null
          origin_complement?: string | null
          origin_neighborhood?: string | null
          origin_city?: string | null
          origin_state?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider?: string
          api_token?: string | null
          client_id?: string | null
          client_secret?: string | null
          is_sandbox?: boolean | null
          is_active?: boolean | null
          origin_name?: string | null
          origin_email?: string | null
          origin_phone?: string | null
          origin_document?: string | null
          origin_postal_code?: string | null
          origin_address?: string | null
          origin_number?: string | null
          origin_complement?: string | null
          origin_neighborhood?: string | null
          origin_city?: string | null
          origin_state?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          order_id: string | null
          gateway: string
          transaction_id: string | null
          amount: number
          currency: string | null
          status: string | null
          payment_method: string | null
          payment_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          gateway?: string
          transaction_id?: string | null
          amount: number
          currency?: string | null
          status?: string | null
          payment_method?: string | null
          payment_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string | null
          gateway?: string
          transaction_id?: string | null
          amount?: number
          currency?: string | null
          status?: string | null
          payment_method?: string | null
          payment_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      order_status_notifications: {
        Row: {
          id: string
          order_id: string | null
          old_status: string | null
          new_status: string
          notified_at: string | null
          error: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          old_status?: string | null
          new_status: string
          notified_at?: string | null
          error?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string | null
          old_status?: string | null
          new_status?: string
          notified_at?: string | null
          error?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      banner_position: "hero" | "promo" | "category"
      discount_type: "percentage" | "fixed"
      order_status: "pending" | "processing" | "confirmed" | "shipped" | "delivered" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier access
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
