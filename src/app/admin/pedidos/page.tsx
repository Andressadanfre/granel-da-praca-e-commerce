import Link from 'next/link'

import { getAdminOrders } from '@/lib/admin/orders'
import {
  ORDER_STATUS_STYLES,
  DELIVERY_TYPE_LABELS,
  getPaymentStatusStyle,
  formatOrderDateTime,
} from '@/lib/admin/labels'
import { formatBRL } from '@/lib/utils'

export const dynamic = 'force-dynamic'

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
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              <tr className="border-b border-bd bg-gray-100">
                <th className="px-4 py-2.5 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Código</th>
                <th className="px-4 py-2.5 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Cliente</th>
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
                    <td className="px-4 py-2.5 text-[12px] text-t9">{order.customer_name ?? '—'}</td>
                    <td className="px-4 py-2.5 text-[12px] font-bold text-gdeep">{formatBRL(order.total_cents)}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className="inline-flex items-center rounded-pill px-2 py-0.5 text-[10px] font-semibold"
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
                      <Link href={`/admin/pedidos/${order.id}`} className="text-[11.5px] font-semibold text-gd hover:text-ghover">
                        Ver →
                      </Link>
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
