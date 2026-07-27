import 'server-only'
import type { OrderStatus, DeliveryType, PaymentMethod } from '@/types/admin'
import type { PaymentStatus } from '@/lib/orders/types'

interface StatusStyle {
  bg: string
  text: string
  label: string
}

export const ORDER_STATUS_STYLES: Record<OrderStatus, StatusStyle> = {
  recebido:             { bg: '#FEF3C7', text: '#92400E', label: 'Recebido' },
  aceito:               { bg: '#EEF2FF', text: '#3730A3', label: 'Aceito' },
  em_separacao:         { bg: '#F3E8FF', text: '#6B21A8', label: 'Em separação' },
  saiu_para_entrega:    { bg: '#EAF7EA', text: '#2C742F', label: 'Saiu p/ entrega' },
  pronto_para_retirada: { bg: '#EAF7EA', text: '#2C742F', label: 'Pronto p/ retirada' },
  entregue:             { bg: '#DCFCE7', text: '#166534', label: 'Entregue' },
  retirado:             { bg: '#DCFCE7', text: '#166534', label: 'Retirado' },
  cancelado:            { bg: '#FEE2E2', text: '#991B1B', label: 'Cancelado' },
}

export const STOCK_STATUS_STYLES: Record<'in_stock' | 'low_stock' | 'out_of_stock', StatusStyle> = {
  in_stock:     { bg: '#EAF7EA', text: '#2C742F', label: 'Disponível' },
  low_stock:    { bg: '#FEF3C7', text: '#92400E', label: 'Estoque baixo' },
  out_of_stock: { bg: '#FEE2E2', text: '#991B1B', label: 'Indisponível' },
}

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, StatusStyle> = {
  pago:        { bg: '#DCFCE7', text: '#166534', label: 'Pago' },
  pendente:    { bg: '#FEF9C3', text: '#854D0E', label: 'Pendente' },
  falhou:      { bg: '#FEE2E2', text: '#991B1B', label: 'Falhou' },
  reembolsado: { bg: '#F3F4F6', text: '#374151', label: 'Reembolsado' },
}

export function getPaymentStatusStyle(status: string): StatusStyle {
  return PAYMENT_STATUS_STYLES[status as PaymentStatus] ?? { bg: '#F3F4F6', text: '#374151', label: status }
}

export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  entrega: 'Entrega',
  retirada: 'Retirada',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX',
  cartao_credito: 'Cartão de crédito',
  cartao_debito: 'Cartão de débito',
  dinheiro: 'Dinheiro',
  alelo: 'Alelo',
}

export function formatOrderDateTime(iso: string): string {
  const date = new Date(iso)
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}
