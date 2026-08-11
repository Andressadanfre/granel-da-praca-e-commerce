export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          created_at: string
          entity: string
          entity_id: string
          id: string
          new_value: Json | null
          old_value: Json | null
          reason: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity: string
          entity_id: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string
          entity_id?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_users: {
        Row: {
          birth_date: string | null
          cpf: string | null
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean
          is_deleted: boolean
          marketing_opt_in: boolean
          marketing_opt_in_at: string | null
          phone: string | null
          terms_accepted_at: string | null
          terms_version: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_active?: boolean
          is_deleted?: boolean
          marketing_opt_in?: boolean
          marketing_opt_in_at?: string | null
          phone?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          is_deleted?: boolean
          marketing_opt_in?: boolean
          marketing_opt_in_at?: string | null
          phone?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon_name: string | null
          id: number
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: number
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: number
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          is_separated: boolean
          item_total_cents: number
          order_id: string
          price_cents_snapshot: number
          product_code: string | null
          product_id: number
          product_name: string
          product_type: Database["public"]["Enums"]["product_type"]
          quantity_grams: number | null
          quantity_units: number | null
          separated_at: string | null
        }
        Insert: {
          id?: string
          is_separated?: boolean
          item_total_cents: number
          order_id: string
          price_cents_snapshot: number
          product_code?: string | null
          product_id: number
          product_name: string
          product_type: Database["public"]["Enums"]["product_type"]
          quantity_grams?: number | null
          quantity_units?: number | null
          separated_at?: string | null
        }
        Update: {
          id?: string
          is_separated?: boolean
          item_total_cents?: number
          order_id?: string
          price_cents_snapshot?: number
          product_code?: string | null
          product_id?: number
          product_name?: string
          product_type?: Database["public"]["Enums"]["product_type"]
          quantity_grams?: number | null
          quantity_units?: number | null
          separated_at?: string | null
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
          },
        ]
      }
      orders: {
        Row: {
          cancelled_at: string | null
          cancelled_by: string | null
          cancelled_reason: string | null
          code: string
          coupon_id: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivery_address: Json | null
          delivery_type: Database["public"]["Enums"]["order_delivery_type"]
          discount_cents: number
          id: string
          is_deleted: boolean
          mp_payment_id: string | null
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: string
          shipping_cents: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number
          total_cents: number
          tracking_token: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancelled_reason?: string | null
          code?: string
          coupon_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: Json | null
          delivery_type: Database["public"]["Enums"]["order_delivery_type"]
          discount_cents?: number
          id?: string
          is_deleted?: boolean
          mp_payment_id?: string | null
          notes?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: string
          shipping_cents?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number
          total_cents: number
          tracking_token?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancelled_reason?: string | null
          code?: string
          coupon_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: Json | null
          delivery_type?: Database["public"]["Enums"]["order_delivery_type"]
          discount_cents?: number
          id?: string
          is_deleted?: boolean
          mp_payment_id?: string | null
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: string
          shipping_cents?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents?: number
          total_cents?: number
          tracking_token?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string | null
          created_at: string
          id: number
          is_primary: boolean
          product_id: number
          sort_order: number
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: number
          is_primary?: boolean
          product_id: number
          sort_order?: number
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: number
          is_primary?: boolean
          product_id?: number
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: number
          compare_at_cents: number | null
          created_at: string
          description: string | null
          id: number
          image_url: string | null
          increment_grams: number
          is_active: boolean
          is_deleted: boolean
          is_featured: boolean
          low_stock_threshold_grams: number
          low_stock_threshold_units: number
          name: string
          nutritional_table_image_url: string | null
          price_cents: number
          product_type: Database["public"]["Enums"]["product_type"]
          slug: string
          stock_quantity_grams: number | null
          stock_quantity_units: number | null
          stock_status: string
          unit: Database["public"]["Enums"]["product_unit"]
          updated_at: string
        }
        Insert: {
          category_id: number
          compare_at_cents?: number | null
          created_at?: string
          description?: string | null
          id?: number
          image_url?: string | null
          increment_grams?: number
          is_active?: boolean
          is_deleted?: boolean
          is_featured?: boolean
          low_stock_threshold_grams?: number
          low_stock_threshold_units?: number
          name: string
          nutritional_table_image_url?: string | null
          price_cents: number
          product_type?: Database["public"]["Enums"]["product_type"]
          slug: string
          stock_quantity_grams?: number | null
          stock_quantity_units?: number | null
          stock_status?: string
          unit?: Database["public"]["Enums"]["product_unit"]
          updated_at?: string
        }
        Update: {
          category_id?: number
          compare_at_cents?: number | null
          created_at?: string
          description?: string | null
          id?: number
          image_url?: string | null
          increment_grams?: number
          is_active?: boolean
          is_deleted?: boolean
          is_featured?: boolean
          low_stock_threshold_grams?: number
          low_stock_threshold_units?: number
          name?: string
          nutritional_table_image_url?: string | null
          price_cents?: number
          product_type?: Database["public"]["Enums"]["product_type"]
          slug?: string
          stock_quantity_grams?: number | null
          stock_quantity_units?: number | null
          stock_status?: string
          unit?: Database["public"]["Enums"]["product_unit"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_order_with_items: {
        Args: {
          p_customer_email?: string
          p_customer_name?: string
          p_customer_phone?: string
          p_delivery_address?: Json
          p_delivery_type: Database["public"]["Enums"]["order_delivery_type"]
          p_discount_cents: number
          p_items?: Json
          p_notes?: string
          p_payment_method: Database["public"]["Enums"]["payment_method"]
          p_shipping_cents: number
          p_subtotal_cents: number
          p_total_cents: number
          p_user_id: string
        }
        Returns: {
          code: string
          id: string
        }[]
      }
    }
    Enums: {
      admin_role: "owner" | "supervisora"
      order_delivery_type: "entrega" | "retirada"
      order_status:
        | "recebido"
        | "aceito"
        | "em_separacao"
        | "saiu_para_entrega"
        | "pronto_para_retirada"
        | "entregue"
        | "retirado"
        | "cancelado"
      payment_method:
        | "pix"
        | "cartao_credito"
        | "cartao_debito"
        | "dinheiro"
        | "alelo"
      product_type: "granel" | "unit"
      product_unit: "KG" | "UN" | "SC" | "CX" | "BL"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["owner", "supervisora"],
      order_delivery_type: ["entrega", "retirada"],
      order_status: [
        "recebido",
        "aceito",
        "em_separacao",
        "saiu_para_entrega",
        "pronto_para_retirada",
        "entregue",
        "retirado",
        "cancelado",
      ],
      payment_method: [
        "pix",
        "cartao_credito",
        "cartao_debito",
        "dinheiro",
        "alelo",
      ],
      product_type: ["granel", "unit"],
      product_unit: ["KG", "UN", "SC", "CX", "BL"],
    },
  },
} as const
