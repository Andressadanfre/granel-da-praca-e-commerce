'use server'

import { revalidatePath } from 'next/cache'

import { createLogger, logError } from '@/lib/logger'
import { getSupabaseServer } from '@/lib/supabase/server'
import { pickPrimaryImage } from '@/lib/utils'
import type { CartItem } from '@/lib/cart/types'
import { isCompletedStatus } from '@/lib/account/types'
import {
  changePasswordSchema,
  prepareReorderSchema,
  updateProfileSchema,
} from '@/lib/account/schemas'
import type { OrderStatus } from '@/lib/orders/types'

type ActionResult = { success: true } | { success: false; error: string }

type PrepareReorderResult =
  | { success: true; items: CartItem[] }
  | { success: false; error: string }

type ProductRow = {
  id: number
  name: string
  price_cents: number
  product_type: 'granel' | 'unit'
  increment_grams: number
  is_active: boolean
  is_deleted: boolean
  categories: { name: string } | null
  product_images: { url: string; is_primary: boolean }[] | null
}

type OrderItemRow = {
  product_id: number
  product_name: string
  product_type: 'granel' | 'unit'
  quantity_grams: number | null
  quantity_units: number | null
}

function formatUnavailableError(names: string[]): string {
  if (names.length === 1) {
    return `${names[0]} não está mais disponível. Não foi possível repetir este pedido.`
  }
  return `${names.join(', ')} não estão mais disponíveis. Não foi possível repetir este pedido.`
}

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const parsed = updateProfileSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const supabase = getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autorizado' }
  }

  const { error } = await supabase
    .from('app_users')
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    const log = createLogger({ action: 'updateProfileAction', userId: user.id })
    logError(log, error, { route: '/conta' }, 'Falha ao atualizar perfil')
    return { success: false, error: 'Não foi possível salvar suas alterações.' }
  }

  revalidatePath('/conta')
  return { success: true }
}

export async function changePasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const supabase = getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autorizado' }
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })

  if (error) {
    const log = createLogger({ action: 'changePasswordAction', userId: user.id })
    logError(log, error, { route: '/conta' }, 'Falha ao alterar senha')
    return { success: false, error: 'Não foi possível alterar sua senha.' }
  }

  return { success: true }
}

export async function prepareReorderAction(input: unknown): Promise<PrepareReorderResult> {
  const parsed = prepareReorderSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Pedido inválido.' }
  }

  const supabase = getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autorizado' }
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, status, is_deleted')
    .eq('id', parsed.data.orderId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (orderError) {
    const log = createLogger({ action: 'prepareReorderAction', userId: user.id })
    logError(log, orderError, { route: '/conta', orderId: parsed.data.orderId }, 'Falha ao buscar pedido')
    return { success: false, error: 'Não foi possível repetir este pedido.' }
  }

  if (!order || order.is_deleted) {
    return { success: false, error: 'Pedido não encontrado.' }
  }

  if (!isCompletedStatus(order.status as OrderStatus)) {
    return { success: false, error: 'Só é possível repetir pedidos finalizados.' }
  }

  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select('product_id, product_name, product_type, quantity_grams, quantity_units')
    .eq('order_id', order.id)

  if (itemsError || !orderItems || orderItems.length === 0) {
    if (itemsError) {
      const log = createLogger({ action: 'prepareReorderAction', userId: user.id })
      logError(log, itemsError, { route: '/conta', orderId: order.id }, 'Falha ao buscar itens')
    }
    return { success: false, error: 'Não foi possível repetir este pedido.' }
  }

  const items = orderItems as OrderItemRow[]
  const productIds = Array.from(new Set(items.map((i) => i.product_id)))

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(`
      id,
      name,
      price_cents,
      product_type,
      increment_grams,
      is_active,
      is_deleted,
      categories ( name ),
      product_images ( url, is_primary )
    `)
    .in('id', productIds)

  if (productsError || !products) {
    if (productsError) {
      const log = createLogger({ action: 'prepareReorderAction', userId: user.id })
      logError(log, productsError, { route: '/conta', orderId: order.id }, 'Falha ao validar produtos')
    }
    return { success: false, error: 'Não foi possível repetir este pedido.' }
  }

  const productMap = new Map((products as ProductRow[]).map((p) => [p.id, p]))
  const unavailableNames: string[] = []

  for (const item of items) {
    const product = productMap.get(item.product_id)
    if (
      !product
      || !product.is_active
      || product.is_deleted
      || product.product_type !== item.product_type
    ) {
      unavailableNames.push(item.product_name)
    }
  }

  if (unavailableNames.length > 0) {
    return { success: false, error: formatUnavailableError(unavailableNames) }
  }

  const cartItems: CartItem[] = []

  for (const item of items) {
    const product = productMap.get(item.product_id)
    if (!product) continue

    const quantity =
      product.product_type === 'granel'
        ? (item.quantity_grams ?? 0)
        : (item.quantity_units ?? 0)

    if (quantity <= 0) continue

    cartItems.push({
      id: product.id,
      name: product.name,
      category: product.categories?.name ?? '',
      productType: product.product_type,
      imageUrl: pickPrimaryImage(product.product_images),
      priceCents:
        product.product_type === 'granel'
          ? Math.round(product.price_cents / 10)
          : product.price_cents,
      incrementGrams: product.product_type === 'granel' ? product.increment_grams : 0,
      quantity,
    })
  }

  if (cartItems.length === 0) {
    return { success: false, error: 'Não foi possível repetir este pedido.' }
  }

  return { success: true, items: cartItems }
}
