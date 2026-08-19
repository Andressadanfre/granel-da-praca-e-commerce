import { describe, it, expect } from 'vitest'
import {
  calcGranelItemServer,
  calcUnitItemServer,
  calcSubtotalServer,
  calcFreteServer,
  calcTotalServer,
  assertTotalMatch,
  type ServerCartItem,
} from './calculations'
import { FRETE_FIXO_CENTS, FRETE_GRATIS_THRESHOLD } from '@/lib/cart/constants'

// ─── calcGranelItemServer ──────────────────────────────────────────────────
// price_cents_raw = preço por KG. quantityGrams deve ser múltiplo de 100.
describe('calcGranelItemServer', () => {
  it('calcula corretamente 500gr a R$149,00/kg', () => {
    // 14900 * 500 / 1000 = 7450 centavos = R$74,50
    expect(calcGranelItemServer(14900, 500)).toBe(7450)
  })

  it('calcula corretamente 100gr (menor unidade vendável)', () => {
    expect(calcGranelItemServer(14900, 100)).toBe(1490)
  })

  it('retorna 0 para quantidade zero ou negativa', () => {
    expect(calcGranelItemServer(14900, 0)).toBe(0)
    expect(calcGranelItemServer(14900, -100)).toBe(0)
  })

  it('rejeita quantidade que não é múltiplo de 100gr', () => {
    // Regra de negócio: granel só vende em múltiplos de 100gr.
    // Se isso passar despercebido, o cliente pode ser cobrado errado.
    expect(() => calcGranelItemServer(14900, 150)).toThrow(/múltiplo de 100/)
    expect(() => calcGranelItemServer(14900, 99)).toThrow()
  })

  it('arredonda para o centavo mais próximo (guarda contra bug de fração)', () => {
    // 3333 * 300 / 1000 = 999.9 → deve arredondar para 1000, não truncar para 999
    expect(calcGranelItemServer(3333, 300)).toBe(1000)
  })
})

// ─── calcUnitItemServer ─────────────────────────────────────────────────────
describe('calcUnitItemServer', () => {
  it('multiplica preço cheio pela quantidade de unidades', () => {
    expect(calcUnitItemServer(2500, 3)).toBe(7500)
  })

  it('retorna 0 para quantidade zero ou negativa', () => {
    expect(calcUnitItemServer(2500, 0)).toBe(0)
    expect(calcUnitItemServer(2500, -1)).toBe(0)
  })
})

// ─── calcSubtotalServer ─────────────────────────────────────────────────────
describe('calcSubtotalServer', () => {
  it('soma itens mistos (granel + unitário) corretamente', () => {
    const items: ServerCartItem[] = [
      { product_type: 'granel', price_cents: 14900, quantity_grams: 500, quantity_units: null },
      { product_type: 'unit', price_cents: 2500, quantity_grams: null, quantity_units: 2 },
    ]
    // granel: 7450 + unit: 5000 = 12450
    expect(calcSubtotalServer(items)).toBe(12450)
  })

  it('ignora item granel sem quantity_grams (defensivo contra payload malformado)', () => {
    const items: ServerCartItem[] = [
      { product_type: 'granel', price_cents: 14900, quantity_grams: null, quantity_units: null },
    ]
    expect(calcSubtotalServer(items)).toBe(0)
  })

  it('carrinho vazio retorna 0', () => {
    expect(calcSubtotalServer([])).toBe(0)
  })
})

// ─── calcFreteServer ────────────────────────────────────────────────────────
describe('calcFreteServer', () => {
  it('cobra frete fixo abaixo do threshold', () => {
    expect(calcFreteServer(FRETE_GRATIS_THRESHOLD - 1)).toBe(FRETE_FIXO_CENTS)
  })

  it('libera frete grátis exatamente no threshold (limite inclusivo)', () => {
    expect(calcFreteServer(FRETE_GRATIS_THRESHOLD)).toBe(0)
  })

  it('libera frete grátis acima do threshold', () => {
    expect(calcFreteServer(FRETE_GRATIS_THRESHOLD + 5000)).toBe(0)
  })
})

// ─── calcTotalServer ────────────────────────────────────────────────────────
describe('calcTotalServer', () => {
  it('soma subtotal + frete sem desconto', () => {
    expect(calcTotalServer(5000)).toBe(5000 + FRETE_FIXO_CENTS)
  })

  it('aplica desconto corretamente', () => {
    expect(calcTotalServer(5000, 1000)).toBe(5000 + FRETE_FIXO_CENTS - 1000)
  })

  it('não cobra frete quando subtotal já atingiu o threshold, mesmo com desconto', () => {
    expect(calcTotalServer(FRETE_GRATIS_THRESHOLD, 500)).toBe(FRETE_GRATIS_THRESHOLD - 500)
  })
})

// ─── assertTotalMatch — guard contra bug de preço divergente cliente/servidor ─
describe('assertTotalMatch', () => {
  it('não lança quando os totais batem exatamente', () => {
    expect(() => assertTotalMatch(10000, 10000)).not.toThrow()
  })

  it('tolera diferença de até 1 centavo (arredondamento)', () => {
    expect(() => assertTotalMatch(10000, 10001)).not.toThrow()
    expect(() => assertTotalMatch(10001, 10000)).not.toThrow()
  })

  it('lança erro quando a diferença excede 1 centavo — cenário do "bug 10×"', () => {
    // Este é o guard que existe especificamente pra pegar o caso em que o
    // cliente envia um total calculado com a fórmula errada (ex: usando
    // priceCents da UI em vez de price_cents do banco) e o servidor aceitaria
    // sem essa checagem.
    expect(() => assertTotalMatch(10000, 100000)).toThrow(/Divergência de preço/)
  })

  it('mensagem de erro inclui os dois valores para depuração', () => {
    expect(() => assertTotalMatch(5000, 5500)).toThrow(/server=5000/)
    expect(() => assertTotalMatch(5000, 5500)).toThrow(/client=5500/)
  })
})
