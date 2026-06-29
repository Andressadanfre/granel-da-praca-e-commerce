import { FRETE_FIXO_CENTS, FRETE_GRATIS_THRESHOLD } from '@/lib/cart/constants'

/**
 * CRÍTICO — Fórmulas de preço server-side (A4)
 *
 * ATENÇÃO: estas fórmulas operam sobre price_cents RAW do banco (preço por kg).
 * São DIFERENTES das fórmulas do cart (que usam priceCents = preço por 100gr).
 *
 * Banco:  price_cents = preço por kg em centavos (ex: 14900 = R$149,00/kg)
 * UI:     priceCents  = preço por 100gr = Math.round(price_cents / 10)
 *
 * NUNCA usar priceCents da UI aqui. NUNCA usar price_cents do banco no cart.
 */

// ─── Cálculo de item granel ───────────────────────────────────────────────────
// price_cents_raw: preço por kg em centavos (direto do banco)
// quantityGrams:  quantidade em gramas escolhida pelo cliente
// Resultado:      valor do item em centavos
export function calcGranelItemServer(
  price_cents_raw: number,
  quantityGrams: number,
): number {
  if (quantityGrams <= 0) return 0
  if (quantityGrams % 100 !== 0) {
    throw new Error(
      `Quantidade inválida: ${quantityGrams}gr. Deve ser múltiplo de 100.`,
    )
  }
  return Math.round((price_cents_raw * quantityGrams) / 1000)
}

// ─── Cálculo de item unitário ─────────────────────────────────────────────────
// price_cents: preço cheio por unidade em centavos (direto do banco)
// quantityUnits: quantidade de unidades escolhida pelo cliente
export function calcUnitItemServer(
  price_cents: number,
  quantityUnits: number,
): number {
  if (quantityUnits <= 0) return 0
  return price_cents * quantityUnits
}

// ─── Subtotal ─────────────────────────────────────────────────────────────────
export interface ServerCartItem {
  product_type: 'granel' | 'unit'
  price_cents: number   // preço por kg (granel) ou preço cheio (unit) — RAW do banco
  quantity_grams: number | null
  quantity_units: number | null
}

export function calcSubtotalServer(items: ServerCartItem[]): number {
  return items.reduce((acc, item) => {
    if (item.product_type === 'granel') {
      if (!item.quantity_grams) return acc
      return acc + calcGranelItemServer(item.price_cents, item.quantity_grams)
    }
    if (!item.quantity_units) return acc
    return acc + calcUnitItemServer(item.price_cents, item.quantity_units)
  }, 0)
}

// ─── Frete ────────────────────────────────────────────────────────────────────
export function calcFreteServer(subtotalCents: number): number {
  return subtotalCents >= FRETE_GRATIS_THRESHOLD ? 0 : FRETE_FIXO_CENTS
}

// ─── Total ────────────────────────────────────────────────────────────────────
export function calcTotalServer(
  subtotalCents: number,
  discountCents = 0,
): number {
  const frete = calcFreteServer(subtotalCents)
  return subtotalCents + frete - discountCents
}

// ─── Validação cruzada (guard contra bug 10×) ─────────────────────────────────
// Compara o total calculado server-side com o total enviado pelo cliente.
// Lança erro se a diferença for maior que 1 centavo (tolerância de arredondamento).
export function assertTotalMatch(
  serverTotalCents: number,
  clientTotalCents: number,
): void {
  const diff = Math.abs(serverTotalCents - clientTotalCents)
  if (diff > 1) {
    throw new Error(
      `Divergência de preço detectada: server=${serverTotalCents} client=${clientTotalCents} diff=${diff}`,
    )
  }
}
