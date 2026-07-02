import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Printer } from 'lucide-react'

import { getAdminOrderById } from '@/lib/admin/orders'
import {
  ORDER_STATUS_STYLES,
  DELIVERY_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  getPaymentStatusStyle,
  formatOrderDateTime,
} from '@/lib/admin/labels'
import { OrderActions } from '@/components/admin/OrderActions'
import { OrderItemsClient } from '@/components/admin/OrderItemsClient'
import { formatBRL } from '@/lib/utils'

interface Props {
  params: { id: string }
}

interface DeliveryAddressSnapshot {
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  zip?: string
}

export default async function AdminPedidoDetailPage({ params }: Props) {
  const order = await getAdminOrderById(params.id)

  if (!order) notFound()

  const statusStyle = ORDER_STATUS_STYLES[order.status]
  const paymentStyle = getPaymentStatusStyle(order.payment_status)
  const items = order.order_items ?? []
  const deliveryAddress = order.delivery_type === 'entrega'
    ? (order.delivery_address as DeliveryAddressSnapshot | null)
    : null

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/pedidos" className="flex items-center gap-1.5 text-[12px] font-medium text-t4 hover:text-gd">
          <ArrowLeft size={14} strokeWidth={1.6} />
          Voltar
        </Link>
        <span className="h-4 w-px bg-bd" />
        <h1 className="text-[18px] font-bold text-gdeep">Pedido {order.code}</h1>
        <span
          className="inline-flex items-center rounded-pill px-2.5 py-0.5 text-[10px] font-semibold"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
        >
          {statusStyle.label}
        </span>
        <span className="text-[11px] text-t4">{formatOrderDateTime(order.created_at)}</span>
        <div className="flex-1" />
        <Link
          href={`/admin/pedidos/${order.id}/imprimir`}
          target="_blank"
          className="flex items-center gap-1.5 rounded-input border border-bd bg-white px-3 py-1.5 text-[11.5px] font-medium text-t6 hover:border-gd hover:text-gd"
        >
          <Printer size={14} strokeWidth={1.6} />
          Imprimir cupom
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-4">
          <div className="rounded-card border border-bd bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-bd px-5 py-3.5">
              <h2 className="text-[13px] font-semibold text-t9">Itens do pedido</h2>
              <span className="text-[11px] text-t4">{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-bd bg-gray-100">
                  <th className="px-3 py-2 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Produto</th>
                  <th className="px-3 py-2 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Quantidade</th>
                  <th className="px-3 py-2 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Preço unit.</th>
                  <th className="px-3 py-2 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Subtotal</th>
                  <th className="px-3 py-2 text-right text-[9.5px] font-semibold uppercase tracking-wider text-t4">Separado</th>
                </tr>
              </thead>
              <OrderItemsClient items={items} />
            </table>
          </div>

          <div className="rounded-card border border-bd bg-white p-5 shadow-card">
            <h2 className="mb-2 text-[13px] font-semibold text-t9">Observações</h2>
            <p className="text-[12px] text-t6">{order.notes ?? '—'}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <OrderActions order={order} />

          <div className="rounded-card border border-bd bg-white p-5 shadow-card">
            <h2 className="mb-3 text-[13px] font-semibold text-t9">Cliente</h2>
            <dl className="flex flex-col gap-1.5 text-[12px]">
              <div className="flex justify-between gap-2">
                <dt className="text-t4">Nome</dt>
                <dd className="text-right font-medium text-t9">{order.customer_name ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-t4">Telefone</dt>
                <dd className="text-right font-medium text-t9">{order.customer_phone ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-t4">E-mail</dt>
                <dd className="text-right font-medium text-t9">{order.customer_email ?? '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-card border border-bd bg-white p-5 shadow-card">
            <h2 className="mb-3 text-[13px] font-semibold text-t9">Entrega</h2>
            <p className="mb-2 text-[12px] font-medium text-t9">{DELIVERY_TYPE_LABELS[order.delivery_type]}</p>
            {deliveryAddress && (
              <p className="text-[12px] leading-relaxed text-t6">
                {deliveryAddress.street}, {deliveryAddress.number}
                {deliveryAddress.complement && `, ${deliveryAddress.complement}`}
                <br />
                {deliveryAddress.neighborhood} — {deliveryAddress.city ?? 'Uberlândia'}/MG
                {deliveryAddress.zip && ` · ${deliveryAddress.zip}`}
              </p>
            )}
          </div>

          <div className="rounded-card border border-bd bg-white p-5 shadow-card">
            <h2 className="mb-3 text-[13px] font-semibold text-t9">Resumo financeiro</h2>
            <div className="flex flex-col gap-1.5 text-[12px]">
              <div className="flex justify-between">
                <span className="text-t4">Subtotal</span>
                <span className="font-medium text-t6">{formatBRL(order.subtotal_cents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-t4">Frete</span>
                <span className="font-medium text-t6">
                  {order.shipping_cents === 0 ? 'Grátis' : formatBRL(order.shipping_cents)}
                </span>
              </div>
              {order.discount_cents > 0 && (
                <div className="flex justify-between">
                  <span className="text-t4">Desconto</span>
                  <span className="font-medium text-promo">− {formatBRL(order.discount_cents)}</span>
                </div>
              )}
              <div className="mt-1.5 flex justify-between border-t border-bd pt-1.5">
                <span className="text-[13px] font-semibold text-t9">Total</span>
                <span className="text-[15px] font-bold text-gdeep">{formatBRL(order.total_cents)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-card border border-bd bg-white p-5 shadow-card">
            <h2 className="mb-3 text-[13px] font-semibold text-t9">Pagamento</h2>
            <div className="flex flex-col gap-1.5 text-[12px]">
              <div className="flex justify-between">
                <span className="text-t4">Método</span>
                <span className="font-medium text-t9">{PAYMENT_METHOD_LABELS[order.payment_method]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-t4">Status</span>
                <span
                  className="inline-flex items-center rounded-pill px-2 py-0.5 text-[10px] font-semibold"
                  style={{ backgroundColor: paymentStyle.bg, color: paymentStyle.text }}
                >
                  {paymentStyle.label}
                </span>
              </div>
              {order.mp_payment_id && (
                <div className="flex justify-between">
                  <span className="text-t4">ID transação</span>
                  <span className="font-mono text-[10px] text-t4">{order.mp_payment_id}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
