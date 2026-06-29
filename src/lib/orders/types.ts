// Tipos derivados do schema real do Supabase (migration A0 — 29/06/2026)
// Fonte de verdade: tabela public.orders + public.order_items

export type OrderStatus =
  | 'recebido'
  | 'aceito'
  | 'em_separacao'
  | 'saiu_para_entrega'
  | 'pronto_para_retirada'
  | 'entregue'
  | 'retirado'
  | 'cancelado'

export type OrderDeliveryType = 'entrega' | 'retirada'

export type PaymentMethod =
  | 'pix'
  | 'cartao_credito'
  | 'cartao_debito'
  | 'dinheiro'
  | 'alelo'

export type PaymentStatus = 'pendente' | 'pago' | 'falhou' | 'reembolsado'

export type AdminRole = 'owner' | 'supervisora'

// Regras de transição de status
// Entrega:  recebido → aceito → em_separacao → saiu_para_entrega → entregue
// Retirada: recebido → aceito → em_separacao → pronto_para_retirada → retirado
// Cancelamento livre até: recebido | aceito
// Cancelamento com justificativa obrigatória: em_separacao em diante

export const DELIVERY_STATUSES = [
  'saiu_para_entrega',
  'entregue',
] as const satisfies OrderStatus[]

export const PICKUP_STATUSES = [
  'pronto_para_retirada',
  'retirado',
] as const satisfies OrderStatus[]

export const CANCELLABLE_WITHOUT_REASON = [
  'recebido',
  'aceito',
] as const satisfies OrderStatus[]

export const PAY_ON_DELIVERY_METHODS = [
  'dinheiro',
  'alelo',
] as const satisfies PaymentMethod[]

export interface DeliveryAddress {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zip: string
}

export interface Order {
  id: string
  code: string
  trackingToken: string
  userId: string | null
  deliveryType: OrderDeliveryType
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  mpPaymentId: string | null
  subtotalCents: number
  shippingCents: number
  discountCents: number
  totalCents: number
  couponId: string | null
  deliveryAddress: DeliveryAddress | null
  customerName: string | null
  customerPhone: string | null
  customerEmail: string | null
  notes: string | null
  cancelledReason: string | null
  cancelledBy: string | null
  cancelledAt: string | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: number
  productName: string
  productCode: string | null
  productType: 'granel' | 'unit'
  priceCentsSnapshot: number
  quantityGrams: number | null
  quantityUnits: number | null
  itemTotalCents: number
  isSeparated: boolean
  separatedAt: string | null
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
}
