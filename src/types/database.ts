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
          icon_name: string
          sort_order: number
          is_active: boolean
        }
        Insert: {
          id?: number
          name: string
          slug: string
          icon_name?: string
          sort_order?: number
          is_active?: boolean
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          icon_name?: string
          sort_order?: number
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey'
            columns: ['id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['category_id']
          },
        ]
      }
      newsletter_subscriptions: {
        Row: {
          id: number
          email: string
          created_at: string
        }
        Insert: {
          id?: number
          email: string
          created_at?: string
        }
        Update: {
          id?: number
          email?: string
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: number
          name: string
          slug: string
          category_id: number | null
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
        }
        Insert: {
          id?: number
          name: string
          slug: string
          category_id?: number | null
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
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          category_id?: number | null
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
        }
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
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
