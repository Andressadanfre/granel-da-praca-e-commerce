export type ProductType = 'granel' | 'unit'
export type ProductUnit = 'KG' | 'UN' | 'SC' | 'CX' | 'BL'
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          icon_name: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          icon_name?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          icon_name?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          id: string
          email: string
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          source?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          source?: string
          created_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          id: number
          product_id: number
          url: string
          alt: string | null
          sort_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: number
          product_id: number
          url: string
          alt?: string | null
          sort_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          product_id?: number
          url?: string
          alt?: string | null
          sort_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'product_images_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      products: {
        Row: {
          id: number
          category_id: number
          name: string
          slug: string
          description: string | null
          unit: ProductUnit
          product_type: ProductType
          price_cents: number
          compare_at_cents: number | null
          increment_grams: number
          stock_status: StockStatus
          is_active: boolean
          is_deleted: boolean
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          category_id: number
          name: string
          slug: string
          description?: string | null
          unit?: ProductUnit
          product_type?: ProductType
          price_cents: number
          compare_at_cents?: number | null
          increment_grams?: number
          stock_status?: StockStatus
          is_active?: boolean
          is_deleted?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          category_id?: number
          name?: string
          slug?: string
          description?: string | null
          unit?: ProductUnit
          product_type?: ProductType
          price_cents?: number
          compare_at_cents?: number | null
          increment_grams?: number
          stock_status?: StockStatus
          is_active?: boolean
          is_deleted?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'product_images_product_id_fkey'
            columns: ['id']
            isOneToOne: false
            referencedRelation: 'product_images'
            referencedColumns: ['product_id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      product_type: ProductType
      product_unit: ProductUnit
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
