import type {
  OrderDeliveryType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/lib/orders/types'

export type AccountOrderItem = {
  productId: number
  productName: string
  imageUrl: string | null
  productType: 'granel' | 'unit'
  quantityGrams: number | null
  quantityUnits: number | null
  itemTotalCents: number
}

export type AccountOrder = {
  id: string
  code: string
  trackingToken: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  deliveryType: OrderDeliveryType
  totalCents: number
  createdAt: string
  items: AccountOrderItem[]
}

export type AccountUser = {
  id: string
  fullName: string | null
  email: string
  phone: string | null
}

/** Status em andamento — timeline + CTAs secundários no card */
export const IN_PROGRESS_STATUSES = [
  'aceito',
  'em_separacao',
  'saiu_para_entrega',
  'pronto_para_retirada',
] as const satisfies readonly OrderStatus[]

export type InProgressStatus = (typeof IN_PROGRESS_STATUSES)[number]

export function isInProgressStatus(status: OrderStatus): status is InProgressStatus {
  return (IN_PROGRESS_STATUSES as readonly OrderStatus[]).includes(status)
}

/** Pedidos finalizados — elegíveis a "Comprar novamente" */
export const COMPLETED_STATUSES = [
  'entregue',
  'retirado',
] as const satisfies readonly OrderStatus[]

export function isCompletedStatus(status: OrderStatus): boolean {
  return (COMPLETED_STATUSES as readonly OrderStatus[]).includes(status)
}
