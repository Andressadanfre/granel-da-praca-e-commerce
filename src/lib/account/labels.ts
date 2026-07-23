import type { OrderStatus, PaymentMethod } from '@/lib/orders/types'

export type AccountStatusBadgeMeta = {
  label: string
  /** Classes Tailwind do badge (bg + text) */
  className: string
  /** Classes Tailwind do dot */
  dotClassName: string
}

// Hex sem token no DS — recebido (âmbar claro antigo) e cancelado soft
const STATUS_RECEBIDO_BG = 'bg-[#FEF3C7]'
const STATUS_RECEBIDO_TX = 'text-[#92400E]'
const STATUS_RECEBIDO_DOT = 'bg-[#92400E]'
const STATUS_CANCEL_BG = 'bg-[#FEF2F2]'

/**
 * Cores da Minha Conta (spec / HTML de referência).
 * Não reutilizar ORDER_STATUS_STYLES do admin — paleta diferente.
 */
export const ACCOUNT_STATUS_BADGE: Record<OrderStatus, AccountStatusBadgeMeta> = {
  recebido: {
    label: 'Recebido',
    className: `${STATUS_RECEBIDO_BG} ${STATUS_RECEBIDO_TX}`,
    dotClassName: STATUS_RECEBIDO_DOT,
  },
  aceito: {
    label: 'Aceito',
    className: 'bg-indigo-bg text-indigo',
    dotClassName: 'bg-indigo',
  },
  em_separacao: {
    label: 'Em separação',
    className: 'bg-indigo-bg text-indigo',
    dotClassName: 'bg-indigo',
  },
  saiu_para_entrega: {
    label: 'Saiu para entrega',
    className: 'bg-warning-bg text-warning-text',
    dotClassName: 'bg-warning-dot',
  },
  pronto_para_retirada: {
    label: 'Pronto para retirada',
    className: 'bg-warning-bg text-warning-text',
    dotClassName: 'bg-warning-dot',
  },
  entregue: {
    label: 'Entregue',
    className: 'bg-badge-diet-bg text-badge-diet-tx',
    dotClassName: 'bg-gd',
  },
  retirado: {
    label: 'Retirado',
    className: 'bg-badge-diet-bg text-badge-diet-tx',
    dotClassName: 'bg-gd',
  },
  cancelado: {
    label: 'Cancelado',
    className: `${STATUS_CANCEL_BG} text-danger`,
    dotClassName: 'bg-danger',
  },
}

/** Labels de pagamento na Minha Conta (tom conversacional, ≠ admin) */
export const ACCOUNT_PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: 'Pago via Pix',
  cartao_credito: 'Cartão de crédito',
  cartao_debito: 'Cartão de débito',
  dinheiro: 'Pago em dinheiro na retirada',
  alelo: 'Pago com Alelo',
}

export function getAccountPaymentLabel(method: PaymentMethod): string {
  return ACCOUNT_PAYMENT_LABELS[method]
}

export function getAccountStatusBadge(status: OrderStatus): AccountStatusBadgeMeta {
  return ACCOUNT_STATUS_BADGE[status]
}
