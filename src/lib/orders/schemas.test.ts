import { describe, it, expect } from 'vitest'
import {
  createOrderSchema,
  orderTotalsSchema,
  updateOrderStatusSchema,
  FRETE_FIXO_CENTS,
  FRETE_GRATIS_THRESHOLD,
} from './schemas'

const baseOrder = {
  items: [{ productId: 1, quantity: 2 }],
  deliveryType: 'retirada' as const,
  paymentMethod: 'pix' as const,
  deliveryAddress: null,
}

// ─── createOrderSchema ──────────────────────────────────────────────────────
describe('createOrderSchema', () => {
  it('aceita pedido de retirada sem endereço', () => {
    expect(createOrderSchema.safeParse(baseOrder).success).toBe(true)
  })

  it('rejeita carrinho vazio', () => {
    const result = createOrderSchema.safeParse({ ...baseOrder, items: [] })
    expect(result.success).toBe(false)
  })

  it('rejeita entrega sem endereço de entrega', () => {
    const result = createOrderSchema.safeParse({
      ...baseOrder,
      deliveryType: 'entrega',
      deliveryAddress: null,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('deliveryAddress'))).toBe(true)
    }
  })

  it('aceita entrega com endereço completo e válido', () => {
    const result = createOrderSchema.safeParse({
      ...baseOrder,
      deliveryType: 'entrega',
      deliveryAddress: {
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Fundinho',
        city: 'Uberlândia',
        state: 'MG',
        zip: '38400-000',
      },
    })
    expect(result.success).toBe(true)
  })

  it('rejeita CEP em formato inválido', () => {
    const result = createOrderSchema.safeParse({
      ...baseOrder,
      deliveryType: 'entrega',
      deliveryAddress: {
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Fundinho',
        city: 'Uberlândia',
        state: 'MG',
        zip: '123', // inválido
      },
    })
    expect(result.success).toBe(false)
  })

  it('rejeita quantidade zero ou negativa de item', () => {
    expect(
      createOrderSchema.safeParse({ ...baseOrder, items: [{ productId: 1, quantity: 0 }] }).success,
    ).toBe(false)
    expect(
      createOrderSchema.safeParse({ ...baseOrder, items: [{ productId: 1, quantity: -1 }] }).success,
    ).toBe(false)
  })

  it('rejeita e-mail em formato inválido quando fornecido', () => {
    const result = createOrderSchema.safeParse({ ...baseOrder, customerEmail: 'nao-e-email' })
    expect(result.success).toBe(false)
  })

  it('rejeita couponId que não é UUID', () => {
    const result = createOrderSchema.safeParse({ ...baseOrder, couponId: 'cupom-123' })
    expect(result.success).toBe(false)
  })
})

// ─── updateOrderStatusSchema ────────────────────────────────────────────────
describe('updateOrderStatusSchema', () => {
  const orderId = '11111111-1111-4111-8111-111111111111'

  it('aceita transição normal sem motivo (ex: recebido → aceito)', () => {
    const result = updateOrderStatusSchema.safeParse({ orderId, status: 'aceito' })
    expect(result.success).toBe(true)
  })

  it('rejeita orderId que não é UUID', () => {
    const result = updateOrderStatusSchema.safeParse({ orderId: 'nao-uuid', status: 'aceito' })
    expect(result.success).toBe(false)
  })

  it('exige justificativa ao cancelar', () => {
    const result = updateOrderStatusSchema.safeParse({ orderId, status: 'cancelado' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('reason'))).toBe(true)
    }
  })

  it('aceita cancelamento com justificativa de pelo menos 10 caracteres', () => {
    const result = updateOrderStatusSchema.safeParse({
      orderId,
      status: 'cancelado',
      reason: 'Cliente desistiu da compra',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita justificativa curta demais (< 10 caracteres)', () => {
    const result = updateOrderStatusSchema.safeParse({
      orderId,
      status: 'cancelado',
      reason: 'curta',
    })
    expect(result.success).toBe(false)
  })
})

// ─── orderTotalsSchema — guard server-side contra total forjado pelo cliente ─
describe('orderTotalsSchema', () => {
  it('aceita totais consistentes, abaixo do threshold de frete grátis', () => {
    const result = orderTotalsSchema.safeParse({
      subtotalCents: 5000,
      shippingCents: FRETE_FIXO_CENTS,
      discountCents: 0,
      totalCents: 5000 + FRETE_FIXO_CENTS,
    })
    expect(result.success).toBe(true)
  })

  it('aceita totais consistentes, com frete grátis no threshold', () => {
    const result = orderTotalsSchema.safeParse({
      subtotalCents: FRETE_GRATIS_THRESHOLD,
      shippingCents: 0,
      discountCents: 0,
      totalCents: FRETE_GRATIS_THRESHOLD,
    })
    expect(result.success).toBe(true)
  })

  it('rejeita quando totalCents não bate com subtotal - desconto + frete', () => {
    const result = orderTotalsSchema.safeParse({
      subtotalCents: 5000,
      shippingCents: FRETE_FIXO_CENTS,
      discountCents: 0,
      totalCents: 999999, // forjado
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('totalCents'))).toBe(true)
    }
  })

  it('rejeita frete cobrado quando o subtotal já atingiu o threshold de frete grátis', () => {
    // Cenário exato que o guard de negócio precisa pegar: cliente tenta
    // manter o frete cobrado mesmo com subtotal elegível a frete grátis.
    const result = orderTotalsSchema.safeParse({
      subtotalCents: FRETE_GRATIS_THRESHOLD,
      shippingCents: FRETE_FIXO_CENTS, // deveria ser 0
      discountCents: 0,
      totalCents: FRETE_GRATIS_THRESHOLD + FRETE_FIXO_CENTS,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('shippingCents'))).toBe(true)
    }
  })

  it('rejeita frete grátis quando o subtotal não atingiu o threshold', () => {
    const result = orderTotalsSchema.safeParse({
      subtotalCents: FRETE_GRATIS_THRESHOLD - 1000,
      shippingCents: 0, // deveria ser FRETE_FIXO_CENTS
      discountCents: 0,
      totalCents: FRETE_GRATIS_THRESHOLD - 1000,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita valores negativos em qualquer campo monetário', () => {
    const result = orderTotalsSchema.safeParse({
      subtotalCents: -100,
      shippingCents: 0,
      discountCents: 0,
      totalCents: -100,
    })
    expect(result.success).toBe(false)
  })
})
