import 'server-only'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import type { AdminOrder, AdminOrderListItem } from '@/types/admin'

export async function getAdminOrders(): Promise<AdminOrderListItem[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('orders')
    .select('id, code, status, payment_status, delivery_type, total_cents, customer_name, customer_phone, created_at')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getAdminOrderById(id: string): Promise<AdminOrder | null> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('orders')
    .select(
      `id, code, tracking_token, user_id, delivery_type, status, payment_method,
       payment_status, mp_payment_id, subtotal_cents, shipping_cents, discount_cents,
       total_cents, delivery_address, customer_name, customer_phone, customer_email,
       notes, cancelled_reason, cancelled_by, cancelled_at, is_deleted, created_at, updated_at,
       order_items(id, order_id, product_id, product_name, product_code, product_type,
         price_cents_snapshot, quantity_grams, quantity_units, item_total_cents,
         is_separated, separated_at)`,
    )
    .eq('id', id)
    .eq('is_deleted', false)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function isAdminUser(authUserId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', authUserId)
    .eq('is_active', true)
    .limit(1)

  if (error) {
    throw new Error(error.message)
  }

  return data !== null && data.length > 0
}
