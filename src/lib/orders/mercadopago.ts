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
  shippingCents: number
  discountCents: number
  totalCents: number
  paymentMethod: MPCheckoutPaymentMethod
  payer?: {
    name?: string
    email?: string
    phone?: { number?: string }
  }
}

export interface MPPreferenceResult {
  preferenceId: string
  initPoint: string       // URL de pagamento produção
  sandboxInitPoint: string // URL de pagamento teste
}

// ─── Regra de parcelamento — PRD "Pagamentos Online", sem juros ao cliente ──
// ≥ R$150 → até 2x · ≥ R$300 → até 3x · abaixo disso → à vista obrigatório
// Nunca acima de 3x em nenhuma hipótese.
function computeMaxInstallments(totalCents: number): number {
  if (totalCents >= PARCELA_3X_THRESHOLD) return 3
  if (totalCents >= PARCELA_2X_THRESHOLD) return 2
  return 1
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
      ? [{ id: 'ticket' }, { id: 'credit_card' }, { id: 'debit_card' }]
      : [{ id: 'ticket' }, { id: 'bank_transfer' }]

  const body = {
    external_reference: input.orderId,
    items: input.items,
    shipments: input.shippingCents > 0
      ? { cost: input.shippingCents / 100, mode: 'not_specified' as const }
      : undefined,
    discounts: input.discountCents > 0
      ? input.discountCents / 100
      : undefined,
    payer: input.payer,
    payment_methods: {
      installments: computeMaxInstallments(input.totalCents),
      excluded_payment_types: excludedTypes,
    },
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

  const result = await preference.create({ body })

  if (!result.id) {
    throw new Error('Mercado Pago não retornou ID de preferência')
  }

  return {
    preferenceId:    result.id,
    initPoint:       result.init_point       ?? '',
    sandboxInitPoint: result.sandbox_init_point ?? '',
  }
}

// ─── Helper — converte itens do carrinho para formato MP ──────────────────────
// CRÍTICO: MP exige unit_price em REAIS, não centavos
export function cartItemsToMPItems(
  items: ServerCartItem[],
  productIds: number[],
  productNames: Record<number, string>,
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
      quantity,
      unit_price:  unitPriceCents / 100,  // centavos → reais
      currency_id: 'BRL' as const,
    }
  })
}
