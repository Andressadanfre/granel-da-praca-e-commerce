import { describe, it, expect } from 'vitest'
import {
  calcItemTotal,
  calcSubtotal,
  calcFrete,
  calcTotal,
  calcFreteProgress,
  calcParcelamento,
} from './calculations'
import type { CartItem } from './types'
import {
  FRETE_FIXO_CENTS,
  FRETE_GRATIS_THRESHOLD,
  PARCELA_2X_THRESHOLD,
  PARCELA_3X_THRESHOLD,
} from './constants'

function granelItem(priceCents: number, quantity: number): CartItem {
  return {
    id: 1,
    name: 'Produto granel de teste',
    category: 'graos',
    productType: 'granel',
    imageUrl: null,
    priceCents,
    incrementGrams: 100,
    quantity,
  }
}

function unitItem(priceCents: number, quantity: number): CartItem {
  return {
    id: 2,
    name: 'Produto unitário de teste',
    category: 'higiene',
    productType: 'unit',
    imageUrl: null,
    priceCents,
    incrementGrams: 0,
    quantity,
  }
}

// ─── calcItemTotal ──────────────────────────────────────────────────────────
// ATENÇÃO: aqui priceCents é preço por 100gr (UI), diferente de
// calculations.ts do lado servidor (price_cents = preço por KG). Ver
// comentário CRÍTICO em src/lib/orders/calculations.ts — são fórmulas
// deliberadamente diferentes, não intercambiáveis.
describe('calcItemTotal', () => {
  it('granel: priceCents é por 100gr, quantity é em gramas', () => {
    // R$14,90 a cada 100gr, 500gr → 5 * 1490 = 7450
    expect(calcItemTotal(granelItem(1490, 500))).toBe(7450)
  })

  it('unit: priceCents é preço cheio, quantity é unidades', () => {
    expect(calcItemTotal(unitItem(2500, 3))).toBe(7500)
  })
})

// ─── calcSubtotal ───────────────────────────────────────────────────────────
describe('calcSubtotal', () => {
  it('soma múltiplos itens', () => {
    const items = [granelItem(1490, 500), unitItem(2500, 2)]
    expect(calcSubtotal(items)).toBe(7450 + 5000)
  })

  it('carrinho vazio retorna 0', () => {
    expect(calcSubtotal([])).toBe(0)
  })
})

// ─── calcFrete / calcTotal ──────────────────────────────────────────────────
describe('calcFrete', () => {
  it('cobra frete abaixo do threshold', () => {
    expect(calcFrete(FRETE_GRATIS_THRESHOLD - 1)).toBe(FRETE_FIXO_CENTS)
  })

  it('libera frete grátis no threshold exato', () => {
    expect(calcFrete(FRETE_GRATIS_THRESHOLD)).toBe(0)
  })
})

describe('calcTotal', () => {
  it('inclui frete no total quando abaixo do threshold', () => {
    expect(calcTotal(5000)).toBe(5000 + FRETE_FIXO_CENTS)
  })

  it('não inclui frete quando subtotal atinge o threshold', () => {
    expect(calcTotal(FRETE_GRATIS_THRESHOLD)).toBe(FRETE_GRATIS_THRESHOLD)
  })
})

// ─── calcFreteProgress ──────────────────────────────────────────────────────
describe('calcFreteProgress', () => {
  it('retorna 0% para carrinho vazio', () => {
    expect(calcFreteProgress(0)).toBe(0)
  })

  it('retorna 50% na metade do threshold', () => {
    expect(calcFreteProgress(FRETE_GRATIS_THRESHOLD / 2)).toBe(50)
  })

  it('nunca ultrapassa 100%, mesmo bem acima do threshold', () => {
    expect(calcFreteProgress(FRETE_GRATIS_THRESHOLD * 3)).toBe(100)
  })
})

// ─── calcParcelamento ───────────────────────────────────────────────────────
describe('calcParcelamento', () => {
  it('abaixo do primeiro threshold: bloqueado, mostra quanto falta', () => {
    const result = calcParcelamento(PARCELA_2X_THRESHOLD - 1000)
    expect(result.unlocked).toBe(false)
    expect(result.parcelas).toBe(2)
    expect(result.faltam).toBe(1000)
  })

  it('no threshold de 2x: libera 2 parcelas', () => {
    const result = calcParcelamento(PARCELA_2X_THRESHOLD)
    expect(result).toEqual({ parcelas: 2, faltam: 0, unlocked: true })
  })

  it('no threshold de 3x: libera 3 parcelas', () => {
    const result = calcParcelamento(PARCELA_3X_THRESHOLD)
    expect(result).toEqual({ parcelas: 3, faltam: 0, unlocked: true })
  })

  it('entre os dois thresholds: ainda mostra só 2x liberado', () => {
    const result = calcParcelamento(PARCELA_2X_THRESHOLD + 1000)
    expect(result.parcelas).toBe(2)
    expect(result.unlocked).toBe(true)
  })
})
