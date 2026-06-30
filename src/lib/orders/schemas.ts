import { z } from 'zod'
import {
  CANCELLABLE_WITHOUT_REASON,
  PAY_ON_DELIVERY_METHODS,
} from './types'
import {
  FRETE_FIXO_CENTS,
  FRETE_GRATIS_THRESHOLD,
  PARCELA_2X_THRESHOLD,
  PARCELA_3X_THRESHOLD,
} from '@/lib/cart/constants'

export const orderStatusSchema = z.enum([
  'recebido',
  'aceito',
  'em_separacao',
  'saiu_para_entrega',
  'pronto_para_retirada',
  'entregue',
  'retirado',
  'cancelado',
])

export const orderDeliveryTypeSchema = z.enum(['entrega', 'retirada'])

export const paymentMethodSchema = z.enum([
  'pix',
  'cartao_credito',
  'cartao_debito',
  'dinheiro',
  'alelo',
])

export const paymentStatusSchema = z.enum([
  'pendente',
  'pago',
  'falhou',
  'reembolsado',
])

export const deliveryAddressSchema = z.object({
  street:       z.string().min(1),
  number:       z.string().min(1),
  complement:   z.string().optional(),
  neighborhood: z.string().min(1),
  city:         z.string().min(1),
  state:        z.string().length(2),
  zip:          z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
})

export const orderItemInputSchema = z.object({
  productId: z.number().int().positive(),
  quantity:  z.number().int().positive(),
})

export const createOrderSchema = z.object({
  items:           z.array(orderItemInputSchema).min(1, 'Carrinho vazio'),
  deliveryType:    orderDeliveryTypeSchema,
  paymentMethod:   paymentMethodSchema,
  deliveryAddress: deliveryAddressSchema.nullable(),
  notes:           z.string().max(500).optional(),
  couponId:        z.string().uuid().optional(),
  customerName:    z.string().min(1).max(120).optional(),
  customerPhone:   z.string().min(10).max(20).optional(),
  customerEmail:   z.string().email().optional(),
}).superRefine((data, ctx) => {
  if (data.deliveryType === 'entrega' && !data.deliveryAddress) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Endereço de entrega obrigatório para pedidos de entrega',
      path: ['deliveryAddress'],
    })
  }
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status:  orderStatusSchema,
  reason:  z.string().min(10).max(500).optional(),
}).superRefine((data, ctx) => {
  const isCancelling = data.status === 'cancelado'
  const requiresReason = isCancelling &&
    !CANCELLABLE_WITHOUT_REASON.includes(data.status as never)

  if (isCancelling && !data.reason) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Justificativa obrigatória para cancelamento',
      path: ['reason'],
    })
  }

  void requiresReason
})

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>

export const orderTotalsSchema = z.object({
  subtotalCents: z.number().int().nonnegative(),
  shippingCents: z.number().int().nonnegative(),
  discountCents: z.number().int().nonnegative(),
  totalCents:    z.number().int().nonnegative(),
}).superRefine((data, ctx) => {
  const expected = data.subtotalCents - data.discountCents + data.shippingCents
  if (data.totalCents !== expected) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Total inconsistente: esperado ${expected}, recebido ${data.totalCents}`,
      path: ['totalCents'],
    })
  }

  const expectedShipping = data.subtotalCents >= FRETE_GRATIS_THRESHOLD
    ? 0
    : FRETE_FIXO_CENTS
  if (data.shippingCents !== expectedShipping) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Frete incorreto: esperado ${expectedShipping} centavos`,
      path: ['shippingCents'],
    })
  }
})

export type OrderTotals = z.infer<typeof orderTotalsSchema>

export {
  FRETE_FIXO_CENTS,
  FRETE_GRATIS_THRESHOLD,
  PARCELA_2X_THRESHOLD,
  PARCELA_3X_THRESHOLD,
  PAY_ON_DELIVERY_METHODS,
}
