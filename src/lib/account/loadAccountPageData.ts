import 'server-only'

import { createLogger, logError } from '@/lib/logger'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { AccountOrder, AccountUser } from '@/lib/account/types'
import type {
  OrderDeliveryType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/lib/orders/types'

type OrderItemRow = {
  product_id: number
  product_name: string
  product_type: 'granel' | 'unit'
  quantity_grams: number | null
  quantity_units: number | null
  item_total_cents: number
}

type OrderRow = {
  id: string
  code: string
  tracking_token: string
  status: OrderStatus
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  delivery_type: OrderDeliveryType
  total_cents: number
  created_at: string
  order_items: OrderItemRow[] | null
}

export type AccountPageData = {
  user: AccountUser
  orders: AccountOrder[]
}

export async function loadAccountPageData(
  authUserId: string,
  email: string,
): Promise<AccountPageData> {
  const supabase = getSupabaseServer()
  const log = createLogger({ action: 'loadAccountPageData', userId: authUserId })

  const [profileResult, ordersResult] = await Promise.all([
    supabase
      .from('app_users')
      .select('id, full_name, phone')
      .eq('id', authUserId)
      .maybeSingle(),
    supabase
      .from('orders')
      .select(`
        id,
        code,
        tracking_token,
        status,
        payment_method,
        payment_status,
        delivery_type,
        total_cents,
        created_at,
        order_items (
          product_id,
          product_name,
          product_type,
          quantity_grams,
          quantity_units,
          item_total_cents
        )
      `)
      .eq('user_id', authUserId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false }),
  ])

  if (profileResult.error) {
    logError(log, profileResult.error, { route: '/conta' }, 'Falha ao buscar perfil')
  }

  if (ordersResult.error) {
    logError(log, ordersResult.error, { route: '/conta' }, 'Falha ao buscar pedidos')
  }

  const profile = profileResult.data
  const user: AccountUser = {
    id: authUserId,
    fullName: profile?.full_name ?? null,
    email,
    phone: profile?.phone ?? null,
  }

  const rows = (ordersResult.data ?? []) as OrderRow[]
  const orders: AccountOrder[] = rows.map((row) => ({
    id: row.id,
    code: row.code,
    trackingToken: row.tracking_token,
    status: row.status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    deliveryType: row.delivery_type,
    totalCents: row.total_cents,
    createdAt: row.created_at,
    items: (row.order_items ?? []).map((item) => ({
      productId: item.product_id,
      productName: item.product_name,
      productType: item.product_type,
      quantityGrams: item.quantity_grams,
      quantityUnits: item.quantity_units,
      itemTotalCents: item.item_total_cents,
    })),
  }))

  return { user, orders }
}
