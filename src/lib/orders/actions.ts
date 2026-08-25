'use server'

import { ensureAppUser } from '@/lib/auth/ensureAppUser'
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase/server'
import { logger, logError, logWarn } from '@/lib/logger'
import { createOrderSchema } from './schemas'
import type { ServerCartItem } from './calculations'
import {
  calcSubtotalServer,
  calcFreteServer,
  calcGranelItemServer,
  calcUnitItemServer,
} from './calculations'
import { createMPPreference, cartItemsToMPItems, type MPCheckoutPaymentMethod } from './mercadopago'
import { PAY_ON_DELIVERY_METHODS, type PaymentMethod } from './types'
import type { Json } from '@/types/database'

function isMPCheckoutPaymentMethod(
  method: PaymentMethod,
): method is MPCheckoutPaymentMethod {
  return method === 'pix' || method === 'cartao_credito' || method === 'cartao_debito'
}

// ─── Tipos de retorno ─────────────────────────────────────────────────────────

export interface CreateOrderResult {
  success: true
  orderId: string
  orderCode: string
  trackingToken: string
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
  const shippingCents = data.deliveryType === 'retirada' ? 0 : calcFreteServer(subtotalCents)
  const PIX_DISCOUNT_RATE = 0.05
  const discountCents = data.paymentMethod === 'pix'
    ? Math.floor(subtotalCents * PIX_DISCOUNT_RATE)
    : 0
  const totalCents = subtotalCents + shippingCents - discountCents

  // Garantir linha em app_users — FK orders.user_id → app_users.id
  // Contas criadas direto no painel Supabase não passam pelo cadastro/OAuth
  try {
    await ensureAppUser(user)
  } catch (err) {
    logError(logger, err, { route: '/checkout', user_id: user.id }, 'Falha ao provisionar app_users antes do pedido')
    return { success: false, error: 'Não foi possível registrar o pedido.' }
  }

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

  // 4b. Buscar tracking_token do pedido recém-criado — RPC não devolve essa coluna.
  // Filtra por id (PK), não por code — caminho direto e sem ambiguidade.
  const { data: tokenRow, error: tokenError } = await supabase
    .from('orders')
    .select('tracking_token')
    .eq('id', orderId)
    .single()

  if (tokenError || !tokenRow) {
    logError(logger, tokenError, { route: '/checkout', order_id: orderId, user_id: user.id }, 'Erro ao buscar tracking_token do pedido criado')
    return { success: false, error: 'Não foi possível registrar o pedido.' }
  }

  const trackingToken = tokenRow.tracking_token

  // 5. Criar preferência Mercado Pago (apenas pagamentos online)
  // Dinheiro e alelo são pagos na entrega/retirada — sem preferência MP
  const isPayOnDelivery = (PAY_ON_DELIVERY_METHODS as readonly string[]).includes(data.paymentMethod)
  if (isPayOnDelivery) {
    return {
      success: true,
      orderId,
      orderCode,
      trackingToken,
      preferenceId:     '',
      initPoint:        '',
      sandboxInitPoint: '',
    }
  }

  try {
    if (!isMPCheckoutPaymentMethod(data.paymentMethod)) {
      return { success: false, error: 'Método de pagamento inválido.' }
    }

    const mpResult = await createMPPreference({
      orderId,
      orderCode,
      trackingToken,
      items: cartItemsToMPItems(
        serverItems,
        data.items.map(i => i.productId),
        productNames,
      ),
      shippingCents,
      discountCents,
      totalCents,
      paymentMethod: data.paymentMethod,
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
      trackingToken,
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
    .neq('stock_status', 'out_of_stock')

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

// ─── Retry de pagamento — nova preferência MP para pedido já existente ────────

// tracking_token = encode(gen_random_bytes(16), 'hex') no banco — mesmo padrão de src/app/pedido/[token]/page.tsx
const TOKEN_REGEX = /^[0-9a-f]{32}$/

export interface RetryPaymentResult {
  success: true
  initPoint: string
  sandboxInitPoint: string
}

export interface RetryPaymentError {
  success: false
  error: string
}

// Gera uma nova preferência MP para o MESMO pedido (orderId/orderCode/trackingToken
// preservados) — não recria o pedido nem chama create_order_with_items de novo.
// Autorização é o token, não a sessão — getSupabaseAdmin(), mesma lógica de /pedido/[token].
export async function retryOrderPayment(
  trackingToken: string,
): Promise<RetryPaymentResult | RetryPaymentError> {
  if (!TOKEN_REGEX.test(trackingToken)) {
    return { success: false, error: 'Este pedido não pode ser reprocessado.' }
  }

  const supabase = getSupabaseAdmin()

  // payment_status em ['falhou', 'pendente'] exigido na própria query —
  // pedido inexistente e pedido em outro status retornam o mesmo erro
  // genérico (evita enumeração). 'pendente' cobre pagamento abandonado.
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, code, tracking_token, shipping_cents, discount_cents, total_cents, payment_method, customer_name, customer_phone, customer_email')
    .eq('tracking_token', trackingToken)
    .in('payment_status', ['falhou', 'pendente'])
    .eq('is_deleted', false)
    .single()

  if (orderError || !order) {
    return { success: false, error: 'Este pedido não pode ser reprocessado.' }
  }

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('product_id, product_name, product_type, price_cents_snapshot, quantity_grams, quantity_units')
    .eq('order_id', order.id)

  if (itemsError || !items || items.length === 0) {
    logError(logger, itemsError, { route: '/pedido', order_id: order.id }, 'Erro ao buscar itens para retry de pagamento')
    return { success: false, error: 'Este pedido não pode ser reprocessado.' }
  }

  // Preço vem do snapshot salvo no pedido original — nunca do catálogo atual
  const serverItems: ServerCartItem[] = items.map(item => ({
    product_type:   item.product_type,
    price_cents:    item.price_cents_snapshot,
    quantity_grams: item.quantity_grams,
    quantity_units: item.quantity_units,
  }))
  const productIds = items.map(item => item.product_id)
  const productNames: Record<number, string> = {}
  items.forEach(item => { productNames[item.product_id] = item.product_name })

  try {
    if (!isMPCheckoutPaymentMethod(order.payment_method)) {
      return { success: false, error: 'Este pedido não pode ser reprocessado.' }
    }

    const mpResult = await createMPPreference({
      orderId:       order.id,
      orderCode:     order.code,
      trackingToken: order.tracking_token,
      items:         cartItemsToMPItems(serverItems, productIds, productNames),
      shippingCents: order.shipping_cents,
      discountCents: order.discount_cents,
      totalCents:    order.total_cents,
      paymentMethod: order.payment_method,
      payer: {
        name:  order.customer_name ?? undefined,
        email: order.customer_email ?? undefined,
        phone: order.customer_phone ? { number: order.customer_phone } : undefined,
      },
    })

    return {
      success: true,
      initPoint:        mpResult.initPoint,
      sandboxInitPoint: mpResult.sandboxInitPoint,
    }
  } catch (mpErr) {
    logError(
      logger,
      mpErr,
      { route: '/pedido', order_id: order.id },
      'Erro ao criar preferência MP para retry de pagamento',
    )
    return { success: false, error: 'Não foi possível iniciar o pagamento.' }
  }
}
