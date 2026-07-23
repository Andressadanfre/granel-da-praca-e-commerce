import Link from 'next/link'
import { Eye, Printer } from 'lucide-react'

import { AcceptOrderButton } from '@/components/admin/AcceptOrderButton'
import { getAdminOrders } from '@/lib/admin/orders'
import {
  ORDER_STATUS_STYLES,
  DELIVERY_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  getPaymentStatusStyle,
  formatOrderDateTime,
} from '@/lib/admin/labels'
import { formatBRL, cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const actionBtnClass =
  'flex h-7 w-7 items-center justify-center rounded-input border border-bd bg-white text-t6 transition-colors hover:border-gd hover:bg-badge-diet-bg hover:text-gd'

export default async function AdminPedidosPage() {
  const orders = await getAdminOrders()

  return (
    <div>
      <div className="mb-6 flex items-baseline gap-2">
        <h1 className="text-2xl font-bold text-gdeep">Pedidos</h1>
        <span className="text-sm font-medium text-t4">({orders.length})</span>
      </div>

      {orders.length === 0 ? (
        <div className="flex items-center justify-center rounded-card border border-bd bg-white py-20 shadow-card">
          <p className="text-sm text-t4">Nenhum pedido ainda.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-bd bg-white shadow-card">
          <table className="w-full min-w-[960px] border-collapse">
            <thead>
              <tr className="border-b border-bd bg-gray-100">
                <th className="px-4 py-2.5 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Código</th>
                <th className="px-4 py-2.5 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Cliente</th>
                <th className="px-4 py-2.5 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Itens</th>
                <th className="px-4 py-2.5 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Total</th>
                <th className="px-4 py-2.5 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Pagamento</th>
                <th className="px-4 py-2.5 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Status</th>
                <th className="px-4 py-2.5 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Entrega</th>
                <th className="px-4 py-2.5 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Data</th>
                <th className="px-4 py-2.5 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const statusStyle = ORDER_STATUS_STYLES[order.status]
                const paymentStyle = getPaymentStatusStyle(order.payment_status)

                return (
                  <tr key={order.id} className="border-b border-bd last:border-b-0 hover:bg-surface">
                    <td className="px-4 py-2.5">
                      <Link href={`/admin/pedidos/${order.id}`} className="font-mono text-[12px] font-bold text-gd hover:underline">
                        {order.code}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[12px] text-t9">{order.customer_name ?? '—'}</span>
                        {order.customer_phone && (
                          <span className="text-[11px] text-t4">{order.customer_phone}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-t6">
                      {order.items_count} {order.items_count === 1 ? 'item' : 'itens'}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] font-bold text-gdeep">{formatBRL(order.total_cents)}</td>
                    <td className="px-4 py-2.5">
                      <p className="text-[11px] text-t6">
                        {PAYMENT_METHOD_LABELS[order.payment_method]}
                      </p>
                      <span
                        className="mt-0.5 inline-flex items-center rounded-pill px-2 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: paymentStyle.bg, color: paymentStyle.text }}
                      >
                        {paymentStyle.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="inline-flex items-center rounded-pill px-2 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                      >
                        {statusStyle.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-t6">{DELIVERY_TYPE_LABELS[order.delivery_type]}</td>
                    <td className="px-4 py-2.5 text-[11px] text-t4">{formatOrderDateTime(order.created_at)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          title="Ver detalhes"
                          aria-label="Ver detalhes"
                          className={cn(actionBtnClass)}
                        >
                          <Eye size={13} strokeWidth={1.6} aria-hidden />
                        </Link>

                        {order.status === 'recebido' && (
                          <AcceptOrderButton
                            orderId={order.id}
                            deliveryType={order.delivery_type}
                          />
                        )}

                        <Link
                          href={`/admin/pedidos/${order.id}/imprimir`}
                          target="_blank"
                          title="Imprimir cupom"
                          aria-label="Imprimir cupom"
                          className={cn(actionBtnClass)}
                        >
                          <Printer size={13} strokeWidth={1.6} aria-hidden />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
