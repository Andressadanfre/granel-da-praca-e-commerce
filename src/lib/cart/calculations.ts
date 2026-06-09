import { CartItem } from './types'
import { FRETE_FIXO_CENTS, FRETE_GRATIS_THRESHOLD, PARCELA_2X_THRESHOLD, PARCELA_3X_THRESHOLD } from './constants'

export function calcItemTotal(item: CartItem): number {
  if (item.productType === 'granel') {
    // priceCents = preço por 100gr
    return Math.round((item.priceCents * item.quantity) / 100)
  }
  // unit: priceCents = preço cheio, quantity = unidades
  return item.priceCents * item.quantity
}

export function calcSubtotal(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + calcItemTotal(item), 0)
}

export function calcFrete(subtotal: number): number {
  return subtotal >= FRETE_GRATIS_THRESHOLD ? 0 : FRETE_FIXO_CENTS
}

export function calcTotal(subtotal: number): number {
  return subtotal + calcFrete(subtotal)
}

export function calcFreteProgress(subtotal: number): number {
  return Math.min((subtotal / FRETE_GRATIS_THRESHOLD) * 100, 100)
}

export function calcParcelamento(subtotal: number): {
  parcelas: number
  faltam: number
  unlocked: boolean
} {
  if (subtotal >= PARCELA_3X_THRESHOLD) {
    return { parcelas: 3, faltam: 0, unlocked: true }
  }
  if (subtotal >= PARCELA_2X_THRESHOLD) {
    return { parcelas: 2, faltam: 0, unlocked: true }
  }
  return { parcelas: 2, faltam: PARCELA_2X_THRESHOLD - subtotal, unlocked: false }
}
