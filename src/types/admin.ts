import type { Json } from '@/types/database'

export type AdminRole = 'owner' | 'supervisora'

export type OrderStatus =
  | 'recebido' | 'aceito' | 'em_separacao'
  | 'saiu_para_entrega' | 'pronto_para_retirada'
  | 'entregue' | 'retirado' | 'cancelado'

export type DeliveryType = 'entrega' | 'retirada'

export type PaymentMethod =
  | 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'alelo'

export interface AdminUser {
  id: string
  user_id: string
  role: AdminRole
  is_active: boolean
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: number
  product_name: string
  product_code: string | null
  product_type: 'granel' | 'unit'
  price_cents_snapshot: number
  quantity_grams: number | null
  quantity_units: number | null
  item_total_cents: number
  is_separated: boolean
  separated_at: string | null
}

export interface AdminOrder {
  id: string
  code: string
  tracking_token: string
  user_id: string | null
  delivery_type: DeliveryType
  status: OrderStatus
  payment_method: PaymentMethod
  payment_status: string
  mp_payment_id: string | null
  subtotal_cents: number
  shipping_cents: number
  discount_cents: number
  total_cents: number
  delivery_address: Json | null
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  notes: string | null
  cancelled_reason: string | null
  cancelled_by: string | null
  cancelled_at: string | null
  is_deleted: boolean
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

/** Colunas retornadas por getAdminOrders() — subset de AdminOrder para a tabela de listagem. */
export type AdminOrderListItem = Pick<
  AdminOrder,
  | 'id' | 'code' | 'status' | 'payment_status' | 'payment_method' | 'delivery_type'
  | 'total_cents' | 'customer_name' | 'customer_phone' | 'created_at'
> & {
  items_count: number
}
