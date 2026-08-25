import Link from 'next/link'
import { ChevronLeft, ChevronRight, Download, Eye, Printer } from 'lucide-react'

import { AcceptOrderButton } from '@/components/admin/AcceptOrderButton'
import { PeriodoFilterInputs } from '@/components/admin/PeriodoFilterInputs'
import {
  PAGE_SIZE,
  buildFilterUrl,
  getAdminOrderStatusCounts,
  getAdminOrdersFiltered,
  getAdminTodaySummary,
  parseAdminOrderFilters,
} from '@/lib/admin/orders'
import {
  ORDER_STATUS_STYLES,
  DELIVERY_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  STATUS_TAB_LABELS,
  getPaymentStatusStyle,
  formatOrderDateTime,
} from '@/lib/admin/labels'
import { formatBRL, cn } from '@/lib/utils'
import type { AdminOrderStatusFilter } from '@/types/admin'

export const dynamic = 'force-dynamic'

const actionBtnClass =
  'flex h-7 w-7 items-center justify-center rounded-input border border-bd bg-white text-t6 transition-colors hover:border-gd hover:bg-badge-diet-bg hover:text-gd'

const selectClass =
  'h-9 rounded-input border border-bd bg-white px-2.5 text-[12px] text-t6 outline-none focus:border-g'

const STATUS_TABS = Object.entries(STATUS_TAB_LABELS) as [AdminOrderStatusFilter, string][]

function formatDataHoje(): string {
  return new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const filters = parseAdminOrderFilters(searchParams)

  const [{ orders, total }, statusCounts, todaySummary] = await Promise.all([
    getAdminOrdersFiltered(filters),
    getAdminOrderStatusCounts({
      tipo: filters.tipo,
      pagamento: filters.pagamento,
      periodo: filters.periodo,
      de: filters.de,
      ate: filters.ate,
      busca: filters.busca,
    }),
    getAdminTodaySummary(),
  ])

  const isDefaultFilters =
    filters.status === 'todos' &&
    filters.tipo === 'todos' &&
    filters.pagamento === 'todos' &&
    filters.periodo === 'sempre' &&
    !filters.busca

  const inicio = total === 0 ? 0 : (filters.pagina - 1) * PAGE_SIZE + 1
  const fim = Math.min(filters.pagina * PAGE_SIZE, total)
  const hasPrev = filters.pagina > 1
  const hasNext = filters.pagina * PAGE_SIZE < total
  const exportHref = `/admin/pedidos/export${buildFilterUrl(filters)}`

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gdeep">Pedidos</h1>
          <p className="mt-0.5 text-xs text-t4">
            {formatDataHoje()} · {todaySummary.count}{' '}
            {todaySummary.count === 1 ? 'pedido' : 'pedidos'} hoje · {formatBRL(todaySummary.totalCents)} faturados
          </p>
        </div>
        <Link
          href={exportHref}
          className="inline-flex items-center gap-1.5 rounded-sel bg-g px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-ghover"
        >
          <Download size={14} strokeWidth={1.6} aria-hidden />
          Exportar CSV
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {STATUS_TABS.map(([key, label]) => {
          const isActive = key === filters.status
          return (
            <Link
              key={key}
              href={`/admin/pedidos${buildFilterUrl(filters, { status: key, pagina: 1 })}`}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-sel border px-3.5 py-1.5 text-[11.5px] font-medium transition-colors',
                isActive
                  ? 'border-gdeep bg-gdeep font-semibold text-white'
                  : 'border-bd bg-white text-t6 hover:border-gd hover:text-gd',
              )}
            >
              {label}
              <span
                className={cn(
                  'rounded-pill px-1.5 py-0.5 text-[9.5px] font-bold',
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-t6',
                )}
              >
                {statusCounts[key]}
              </span>
            </Link>
          )
        })}
      </div>

      <form method="GET" action="/admin/pedidos" className="mb-4 flex flex-wrap items-center gap-2.5">
        <input type="hidden" name="status" value={filters.status} />
        <input
          type="text"
          name="busca"
          defaultValue={filters.busca ?? ''}
          placeholder="Buscar por código, cliente ou telefone..."
          className="h-9 min-w-[240px] flex-1 rounded-input border border-bd bg-white px-3 text-[12px] text-t9 outline-none placeholder:text-t4 focus:border-g"
        />
        <select name="tipo" defaultValue={filters.tipo} className={selectClass}>
          <option value="todos">Todos</option>
          <option value="entrega">Entrega</option>
          <option value="retirada">Retirada</option>
        </select>
        <select name="pagamento" defaultValue={filters.pagamento} className={selectClass}>
          <option value="todos">Todos</option>
          <option value="pix">Pix</option>
          <option value="cartao_credito">Cartão Crédito</option>
          <option value="cartao_debito">Cartão Débito</option>
          <option value="dinheiro">Dinheiro</option>
          <option value="alelo">Alelo</option>
        </select>
        <PeriodoFilterInputs
          periodoInicial={filters.periodo}
          deInicial={filters.de}
          ateInicial={filters.ate}
        />
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-sel bg-g px-4 text-[12px] font-semibold text-white transition-colors hover:bg-ghover"
        >
          Filtrar
        </button>
      </form>

      {orders.length === 0 ? (
        <div className="flex items-center justify-center rounded-card border border-bd bg-white py-20 shadow-card">
          <p className="text-sm text-t4">
            {isDefaultFilters
              ? 'Nenhum pedido ainda.'
              : 'Nenhum pedido encontrado com os filtros selecionados.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-bd bg-white shadow-card">
          <div className="overflow-x-auto">
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
                              paymentStatus={order.payment_status}
                              paymentMethod={order.payment_method}
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

          <div className="flex items-center justify-between border-t border-bd bg-gray-100 px-5 py-3">
            <p className="text-[11px] text-t4">
              Mostrando {inicio}–{fim} de {total} pedidos
            </p>
            <div className="flex gap-1">
              <Link
                href={`/admin/pedidos${buildFilterUrl(filters, { pagina: filters.pagina - 1 })}`}
                aria-label="Página anterior"
                aria-disabled={!hasPrev}
                className={cn(
                  'flex h-[30px] w-[30px] items-center justify-center rounded-input border border-bd bg-white text-t6 transition-colors hover:border-g hover:text-g',
                  !hasPrev && 'pointer-events-none opacity-40',
                )}
              >
                <ChevronLeft size={13} strokeWidth={1.6} aria-hidden />
              </Link>
              <Link
                href={`/admin/pedidos${buildFilterUrl(filters, { pagina: filters.pagina + 1 })}`}
                aria-label="Próxima página"
                aria-disabled={!hasNext}
                className={cn(
                  'flex h-[30px] w-[30px] items-center justify-center rounded-input border border-bd bg-white text-t6 transition-colors hover:border-g hover:text-g',
                  !hasNext && 'pointer-events-none opacity-40',
                )}
              >
                <ChevronRight size={13} strokeWidth={1.6} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
