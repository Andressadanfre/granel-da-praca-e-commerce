'use server'

import { getSupabaseServer } from '@/lib/supabase/server'
import { logger, logError, logWarn } from '@/lib/logger'
import { createOrderSchema } from './schemas'
import type { ServerCartItem } from './calculations'
import {
  calcSubtotalServer,
  calcFreteServer,
  calcGranelItemServer,
  calcUnitItemServer,
} from './calculations'
import { createMPPreference, cartItemsToMPItems } from './mercadopago'
import { PAY_ON_DELIVERY_METHODS } from './types'
import type { Json } from '@/types/database'

// ─── Tipos de retorno ─────────────────────────────────────────────────────────

export interface CreateOrderResult {
  success: true
  orderId: string
  orderCode: string
  preferenceId: string
  initPoint: string
  sandboxInitPoint: string
}

export interface CreateOrderError {
  success: false
  error: string
}

// ─── Server Action principal — criar pedido + preferência MP ──────────────────
export async function createOrderAction(
  input: unknown,
): Promise<CreateOrderResult | CreateOrderError> {

  // 1. Validar input com Zod
  const parsed = createOrderSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Dados do pedido inválidos' }
  }

  // 2. Autenticar — identidade sempre do servidor, nunca do cliente
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  const data = parsed.data

  // 3. Buscar produtos e recalcular preços server-side
  const productResult = await getProductsForOrder(data.items)
  if (!productResult) {
    return { success: false, error: 'Um ou mais produtos não estão disponíveis' }
  }
  const { items: serverItems, names: productNames } = productResult

  const subtotalCents = calcSubtotalServer(serverItems)
  const shippingCents = calcFreteServer(subtotalCents)
  const PIX_DISCOUNT_RATE = 0.05
  const discountCents = data.paymentMethod === 'pix'
    ? Math.floor(subtotalCents * PIX_DISCOUNT_RATE)
    : 0
  const totalCents = subtotalCents + shippingCents - discountCents

  // 4. Registrar pedido via RPC atômica (orders + order_items em uma transação)
  const rpcItems = serverItems.map((item, idx) => {
    const clientItem = data.items[idx]
    const itemTotalCents = item.product_type === 'granel'
      ? calcGranelItemServer(item.price_cents, item.quantity_grams ?? 0)
      : calcUnitItemServer(item.price_cents, item.quantity_units ?? 0)
    return {
      product_id:           clientItem.productId,
      product_name:         productNames[clientItem.productId],
      product_type:         item.product_type,
      price_cents_snapshot: item.price_cents,
      quantity_grams:       item.quantity_grams,
      quantity_units:       item.quantity_units,
      item_total_cents:     itemTotalCents,
    }
  })

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    'create_order_with_items',
    {
      p_user_id:          user.id,
      p_delivery_type:    data.deliveryType,
      p_payment_method:   data.paymentMethod,
      p_subtotal_cents:   subtotalCents,
      p_shipping_cents:   shippingCents,
      p_discount_cents:   discountCents,
      p_total_cents:      totalCents,
      p_delivery_address: (data.deliveryAddress as Json | undefined) ?? undefined,
      p_customer_name:    data.customerName ?? undefined,
      p_customer_phone:   data.customerPhone ?? undefined,
      p_customer_email:   data.customerEmail ?? undefined,
      p_notes:            data.notes ?? undefined,
      p_items:            rpcItems as Json,
    },
  )

  if (rpcError || !rpcData || rpcData.length === 0) {
    logError(logger, rpcError, { route: '/checkout', user_id: user.id }, 'Erro ao criar pedido via RPC')
    return { success: false, error: 'Não foi possível registrar o pedido.' }
  }

  const { id: orderId, code: orderCode } = rpcData[0]

  // 5. Criar preferência Mercado Pago (apenas pagamentos online)
  // Dinheiro e alelo são pagos na entrega/retirada — sem preferência MP
  const isPayOnDelivery = (PAY_ON_DELIVERY_METHODS as readonly string[]).includes(data.paymentMethod)
  if (isPayOnDelivery) {
    return {
      success: true,
      orderId,
      orderCode,
      preferenceId:     '',
      initPoint:        '',
      sandboxInitPoint: '',
    }
  }

  try {
    const mpResult = await createMPPreference({
      orderId,
      orderCode,
      items: cartItemsToMPItems(
        serverItems,
        data.items.map(i => i.productId),
        productNames,
      ),
      shippingCents,
      discountCents,
      payer: {
        name:  data.customerName ?? undefined,
        email: data.customerEmail ?? undefined,
        phone: data.customerPhone ? { number: data.customerPhone } : undefined,
      },
    })

    return {
      success: true,
      orderId,
      orderCode,
      preferenceId:     mpResult.preferenceId,
      initPoint:        mpResult.initPoint,
      sandboxInitPoint: mpResult.sandboxInitPoint,
    }
  } catch (mpErr) {
    logError(
      logger,
      mpErr,
      { route: '/checkout', order_id: orderId, user_id: user.id },
      'Erro ao criar preferência MP',
    )
    return { success: false, error: 'Não foi possível iniciar o pagamento.' }
  }
}

// ─── Helper — busca produto do banco para recalcular preço ───────────────────
// Garante que o preço usado é o do banco, nunca o enviado pelo cliente
export async function getProductsForOrder(
  clientItems: { productId: number; quantity: number }[],
): Promise<{ items: ServerCartItem[], names: Record<number, string> } | null> {
  const productIds = clientItems.map(i => i.productId)
  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from('products')
    .select('id, name, price_cents, product_type')
    .in('id', productIds)
    .eq('is_active', true)
    .eq('is_deleted', false)

  if (error || !data || data.length !== productIds.length) {
    logWarn(
      logger,
      { route: '/checkout' },
      'Produtos não encontrados ou inativos ao montar pedido',
    )
    return null
  }

  const names: Record<number, string> = {}
  data.forEach(p => { names[p.id] = p.name ?? '' })

  const items: ServerCartItem[] = clientItems.map(clientItem => {
    const product = data.find(p => p.id === clientItem.productId)
    if (!product) {
      throw new Error(`Produto ${clientItem.productId} não encontrado no resultado da query`)
    }
    return {
      product_type:   product.product_type,
      price_cents:    product.price_cents,
      quantity_grams: product.product_type === 'granel' ? clientItem.quantity : null,
      quantity_units: product.product_type === 'unit' ? clientItem.quantity : null,
    }
  })

  return { items, names }
}
