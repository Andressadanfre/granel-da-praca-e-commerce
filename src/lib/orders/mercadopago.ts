import MercadoPagoConfig, { Preference } from 'mercadopago'
import { PARCELA_2X_THRESHOLD, PARCELA_3X_THRESHOLD } from '@/lib/cart/constants'
import type { ServerCartItem } from './calculations'
import { calcGranelItemServer, calcUnitItemServer } from './calculations'

// ─── Cliente MP — singleton ───────────────────────────────────────────────────
// Instanciado uma vez — nunca expor o access token no cliente
function getMPClient(): MercadoPagoConfig {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado')
  return new MercadoPagoConfig({ accessToken: token })
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface MPPreferenceItem {
  id: string
  title: string
  description?: string
  quantity: number
  unit_price: number        // em reais (não centavos) — requisito da API MP
  currency_id: 'BRL'
}

export type MPCheckoutPaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito'

export interface CreatePreferenceInput {
  orderId: string
  orderCode: string
  trackingToken: string
  items: MPPreferenceItem[]
  subtotalCents: number      // base do teto de parcelas — regra: subtotal sem frete, antes de desconto
  shippingCents: number
  discountCents: number
  totalCents: number
  paymentMethod: MPCheckoutPaymentMethod
  idempotencyKey: string
  payer?: {
    name?: string
    surname?: string
    email?: string
    phone?: { number?: string }
  }
}

export interface MPPreferenceResult {
  preferenceId: string
  initPoint: string
}

// ─── Regra de parcelamento — PRD "Pagamentos Online", sem juros ao cliente ──
// ≥ R$150 → até 2x · ≥ R$300 → até 3x · abaixo disso → à vista obrigatório
// Nunca acima de 3x em nenhuma hipótese.
// Base: subtotal sem frete, antes de qualquer desconto (decisão 01/10/2026).
function computeMaxInstallments(subtotalCents: number): number {
  if (subtotalCents >= PARCELA_3X_THRESHOLD) return 3
  if (subtotalCents >= PARCELA_2X_THRESHOLD) return 2
  return 1
}

// ─── Desconto aplicado nos itens ──────────────────────────────────────────────
// A API de preferências NÃO tem campo de desconto global (`discounts` não existe
// e era descartado em silêncio — o MP cobrava o valor cheio). O desconto é
// distribuído proporcionalmente entre as linhas (resto na última); cada linha
// vira quantity 1 com o valor da linha, para o total fechar no centavo.
function applyDiscountToItems(items: MPPreferenceItem[], discountCents: number): MPPreferenceItem[] {
  if (discountCents <= 0) return items
  const lineCents = items.map(i => Math.round(i.unit_price * 100) * i.quantity)
  const baseCents = lineCents.reduce((a, b) => a + b, 0)
  let remainingCents = discountCents
  return items.map((item, idx) => {
    const shareCents = idx === items.length - 1
      ? remainingCents
      : Math.floor((discountCents * lineCents[idx]) / baseCents)
    remainingCents -= shareCents
    const title = item.quantity > 1 ? `${item.title} (${item.quantity} un)` : item.title
    return { ...item, title, quantity: 1, unit_price: (lineCents[idx] - shareCents) / 100 }
  })
}

// ─── Criação de preferência ───────────────────────────────────────────────────
export async function createMPPreference(
  input: CreatePreferenceInput,
): Promise<MPPreferenceResult> {
  const client = getMPClient()
  const preference = new Preference(client)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Boleto nunca fez parte do escopo do projeto — excluído sempre.
  // Pix selecionado no site → mostra só Pix no MP. Cartão selecionado →
  // mostra só cartão (crédito/débito), esconde Pix.
  const excludedTypes =
    input.paymentMethod === 'pix'
      ? [{ id: 'ticket' }, { id: 'credit_card' }, { id: 'debit_card' }, { id: 'prepaid_card' }]
      : [{ id: 'ticket' }, { id: 'bank_transfer' }]

  // Trava: o que vai ao MP (itens + frete) precisa ser exatamente o total do
  // pedido no banco. Divergência → falha antes de cobrar, nunca cobrança errada.
  const chargedItems = applyDiscountToItems(input.items, input.discountCents)
  const chargedCents =
    chargedItems.reduce((a, i) => a + Math.round(i.unit_price * 100) * i.quantity, 0)
    + input.shippingCents
  if (chargedCents !== input.totalCents) {
    throw new Error(`Total enviado ao MP (${chargedCents}) diverge do pedido (${input.totalCents})`)
  }

  const body = {
    external_reference: input.orderId,
    items: chargedItems,
    shipments: input.shippingCents > 0
      ? { cost: input.shippingCents / 100, mode: 'not_specified' as const }
      : undefined,
    payer: input.payer,
    payment_methods: {
      installments: computeMaxInstallments(input.subtotalCents),
      excluded_payment_types: excludedTypes,
    },
    statement_descriptor: 'GRANEL PRACA',
    back_urls: {
      success: `${appUrl}/pedido/${input.trackingToken}?status=sucesso`,
      failure: `${appUrl}/pedido/${input.trackingToken}?status=falhou`,
      pending: `${appUrl}/pedido/${input.trackingToken}?status=pendente`,
    },
    ...(appUrl.startsWith('https') ? { auto_return: 'approved' as const } : {}),
    notification_url: `${appUrl}/api/webhooks/mercadopago`,
    metadata: {
      order_id:   input.orderId,
      order_code: input.orderCode,
    },
  }

  const result = await preference.create({
    body,
    requestOptions: { idempotencyKey: input.idempotencyKey },
  })

  if (!result.id) {
    throw new Error('Mercado Pago não retornou ID de preferência')
  }

  return {
    preferenceId: result.id,
    initPoint:    result.init_point ?? '',
  }
}

// ─── Helper — converte itens do carrinho para formato MP ──────────────────────
// CRÍTICO: MP exige unit_price em REAIS, não centavos
export function cartItemsToMPItems(
  items: ServerCartItem[],
  productIds: number[],
  productNames: Record<number, string>,
  productDescriptions: Record<number, string>,
): MPPreferenceItem[] {
  return items.map((item, index) => {
    const productId = productIds[index]
    const totalCents = item.product_type === 'granel'
      ? calcGranelItemServer(item.price_cents, item.quantity_grams ?? 0)
      : calcUnitItemServer(item.price_cents, item.quantity_units ?? 0)

    const quantity = item.product_type === 'granel'
      ? 1  // granel: 1 item com preço total (MP não suporta frações de grama)
      : (item.quantity_units ?? 1)

    const unitPriceCents = item.product_type === 'granel'
      ? totalCents
      : item.price_cents

    return {
      id:          String(productId),
      title:       productNames[productId] ?? `Produto ${productId}`,
      description: productDescriptions[productId] || productNames[productId] || `Produto ${productId}`,
      quantity,
      unit_price:  unitPriceCents / 100,  // centavos → reais
      currency_id: 'BRL' as const,
    }
  })
}
