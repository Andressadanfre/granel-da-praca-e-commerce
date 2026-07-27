import Link from 'next/link'
import { TrendingUp, TrendingDown, ShoppingBag, AlertTriangle, AlertCircle, Package, CreditCard, ImageOff } from 'lucide-react'
import { CutoffCountdown } from '@/components/admin/CutoffCountdown'
import { cn, formatBRL } from '@/lib/utils'
import { PAYMENT_METHOD_LABELS } from '@/lib/admin/labels'
import {
  getKpisHoje,
  getFaturamento7Dias,
  getPedidosRecentes,
  getEstoqueBaixo,
  getAlertasDoDia,
  getFormasDePagamentoHoje,
} from '@/lib/admin/dashboard'

export const dynamic = 'force-dynamic'

const STATUS_BADGE_TAILWIND: Record<string, string> = {
  's-recebido': 'bg-[#FEF3C7] text-[#92400E]',
  's-separacao': 'bg-[#F3E8FF] text-[#6B21A8]',
  's-saiu': 'bg-badge-diet-bg text-gd',
  's-entregue': 'bg-[#DCFCE7] text-[#166534]',
  's-cancelado': 'bg-[#FEE2E2] text-[#991B1B]',
}

const DIAS_SEMANA_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function formatDataLonga(): string {
  const agora = new Date()
  const dataSP = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const dia = DIAS_SEMANA_PT[dataSP.getDay()]
  const dataFormatada = agora
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo' })
    .replace('.', '')
  return `${dia}, ${dataFormatada}`
}

export default async function AdminDashboardPage() {
  const [kpis, faturamento7Dias, pedidosRecentes, estoqueBaixo, alertas, pagamentos] = await Promise.all([
    getKpisHoje(),
    getFaturamento7Dias(),
    getPedidosRecentes(6),
    getEstoqueBaixo(5),
    getAlertasDoDia(),
    getFormasDePagamentoHoje(),
  ])

  const maiorValor = Math.max(...faturamento7Dias.map((d) => d.totalCents), 1)
  const totalSemana = faturamento7Dias.reduce((acc, d) => acc + d.totalCents, 0)
  const mediaDia = Math.round(totalSemana / 7)
  const melhorDia = faturamento7Dias.reduce((max, d) => (d.totalCents > max.totalCents ? d : max), faturamento7Dias[0])

  const deltaFaturamento = kpis.faturamentoOntemCents > 0
    ? Math.round(((kpis.faturamentoHojeCents - kpis.faturamentoOntemCents) / kpis.faturamentoOntemCents) * 100)
    : null

  return (
    <div>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-t9">Bom dia, Andressa</h1>
          <p className="mt-0.5 text-xs text-t4">
            Aqui está o resumo de hoje · seg–sex entregas até 17h30 · sábado até 11h30
          </p>
        </div>
        <div className="rounded-input border border-bd bg-white px-3 py-1.5 text-[11px] font-medium capitalize text-t6">
          {formatDataLonga()}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-4 gap-3.5">
        <div className="rounded-card border border-bd bg-white p-[18px_20px] shadow-card transition-shadow hover:shadow-card-hover">
          <div className="mb-3 flex items-start justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-t4">Faturamento hoje</span>
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-inner bg-badge-diet-bg text-gd">
              <TrendingUp size={16} strokeWidth={1.6} />
            </div>
          </div>
          <div className="mb-1.5 text-[26px] font-bold tabular-nums tracking-tight text-t9">
            {formatBRL(kpis.faturamentoHojeCents)}
          </div>
          {deltaFaturamento !== null && (
            <div className={cn('flex items-center gap-1 text-[11px] font-medium', deltaFaturamento >= 0 ? 'text-gd' : 'text-danger')}>
              {deltaFaturamento >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {deltaFaturamento >= 0 ? '+' : ''}{deltaFaturamento}% vs ontem ({formatBRL(kpis.faturamentoOntemCents)})
            </div>
          )}
        </div>

        <div className="rounded-card border border-bd bg-white p-[18px_20px] shadow-card transition-shadow hover:shadow-card-hover">
          <div className="mb-3 flex items-start justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-t4">Pedidos hoje</span>
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-inner bg-indigo-bg text-indigo">
              <ShoppingBag size={16} strokeWidth={1.6} />
            </div>
          </div>
          <div className="mb-1.5 text-[26px] font-bold tabular-nums tracking-tight text-t9">{kpis.pedidosHoje}</div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-t4">
            {kpis.pedidosNovosAgora} novos agora · {kpis.pedidosEntreguesHoje} entregues
          </div>
        </div>

        <div className="rounded-card border border-bd bg-white p-[18px_20px] shadow-card transition-shadow hover:shadow-card-hover">
          <div className="mb-3 flex items-start justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-t4">Ticket médio</span>
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-inner bg-warning-bg text-warning-text">
              <TrendingUp size={16} strokeWidth={1.6} />
            </div>
          </div>
          <div className="text-[26px] font-bold tabular-nums tracking-tight text-t9">
            {formatBRL(kpis.ticketMedioCents)}
          </div>
        </div>

        <CutoffCountdown />
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-4">
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-card border border-bd bg-white shadow-card">
            <div className="flex items-center gap-2 border-b border-bd px-[18px] py-3.5">
              <span className="flex-1 text-[13px] font-semibold text-t9">Faturamento — últimos 7 dias</span>
            </div>
            <div className="px-[18px] pb-3 pt-4">
              <div className="mb-1.5 flex h-[72px] items-end gap-1.5">
                {faturamento7Dias.map((dia) => (
                  <div
                    key={dia.data}
                    className={cn('relative flex-1 rounded-t transition-colors', dia.isHoje ? 'bg-g' : 'bg-badge-diet-bg')}
                    style={{ height: `${Math.max((dia.totalCents / maiorValor) * 100, 2)}%` }}
                    title={formatBRL(dia.totalCents)}
                  >
                    {dia.isHoje && (
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold text-gd">
                        {formatBRL(dia.totalCents)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                {faturamento7Dias.map((dia) => (
                  <div
                    key={dia.data}
                    className={cn('flex-1 text-center text-[9px] font-medium', dia.isHoje ? 'font-semibold text-g' : 'text-t4')}
                  >
                    {dia.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-5 border-t border-gray-100 px-[18px] py-3">
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-wide text-t4">Total 7 dias</div>
                <div className="mt-0.5 text-sm font-bold tabular-nums text-t9">{formatBRL(totalSemana)}</div>
              </div>
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-wide text-t4">Média/dia</div>
                <div className="mt-0.5 text-sm font-bold tabular-nums text-t9">{formatBRL(mediaDia)}</div>
              </div>
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-wide text-t4">Melhor dia</div>
                <div className="mt-0.5 text-sm font-bold tabular-nums text-t9">
                  {melhorDia.label} · {formatBRL(melhorDia.totalCents)}
                </div>
              </div>
            </div>
          </div>

          {/* PEDIDOS RECENTES */}
          <div className="overflow-hidden rounded-card border border-bd bg-white shadow-card">
            <div className="flex items-center gap-2 border-b border-bd px-[18px] py-3.5">
              <span className="flex-1 text-[13px] font-semibold text-t9">Pedidos recentes</span>
              <Link href="/admin/pedidos" className="text-[11px] font-semibold text-g transition-colors hover:text-ghover">
                Ver todos
              </Link>
            </div>
            {pedidosRecentes.length === 0 ? (
              <div className="px-[18px] py-8 text-center text-sm text-t4">Nenhum pedido ainda.</div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border-b border-bd px-[18px] py-2 text-left text-[9.5px] font-semibold uppercase tracking-wide text-t4">Código</th>
                    <th className="border-b border-bd px-[18px] py-2 text-left text-[9.5px] font-semibold uppercase tracking-wide text-t4">Cliente</th>
                    <th className="border-b border-bd px-[18px] py-2 text-left text-[9.5px] font-semibold uppercase tracking-wide text-t4">Total</th>
                    <th className="border-b border-bd px-[18px] py-2 text-left text-[9.5px] font-semibold uppercase tracking-wide text-t4">Tipo</th>
                    <th className="border-b border-bd px-[18px] py-2 text-left text-[9.5px] font-semibold uppercase tracking-wide text-t4">Pagamento</th>
                    <th className="border-b border-bd px-[18px] py-2 text-left text-[9.5px] font-semibold uppercase tracking-wide text-t4">Status</th>
                    <th className="border-b border-bd px-[18px] py-2 text-left text-[9.5px] font-semibold uppercase tracking-wide text-t4">Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosRecentes.map((pedido) => (
                    <tr key={pedido.id} className="border-b border-bd transition-colors last:border-none hover:bg-surface">
                      <td className="px-[18px] py-2.5 text-xs font-semibold text-t9">#{pedido.code}</td>
                      <td className="px-[18px] py-2.5 text-xs text-t9">{pedido.customer_name ?? 'Cliente'}</td>
                      <td className="px-[18px] py-2.5 text-xs font-semibold tabular-nums text-t9">{formatBRL(pedido.total_cents)}</td>
                      <td className="px-[18px] py-2.5">
                        <span className={cn(
                          'rounded-pill px-1.5 py-0.5 text-[9px] font-semibold',
                          pedido.delivery_type === 'entrega' ? 'bg-indigo-bg text-indigo' : 'bg-warning-bg text-warning-text'
                        )}>
                          {pedido.delivery_type === 'entrega' ? 'Entrega' : 'Retirada'}
                        </span>
                      </td>
                      <td className="px-[18px] py-2.5 text-xs text-t9">{PAYMENT_METHOD_LABELS[pedido.payment_method]}</td>
                      <td className="px-[18px] py-2.5">
                        <span className={cn('inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[10px] font-semibold', STATUS_BADGE_TAILWIND[pedido.statusClasse])}>
                          <span className="h-1 w-1 rounded-full bg-current" />
                          {pedido.statusLabel}
                        </span>
                      </td>
                      <td className="px-[18px] py-2.5 text-[11px] text-t4">
                        {new Date(pedido.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* ALERTAS DO DIA */}
          {alertas.length > 0 && (
            <div className="overflow-hidden rounded-card border border-bd bg-white shadow-card">
              <div className="flex items-center gap-2 border-b border-bd px-[18px] py-3.5">
                <AlertTriangle size={14} strokeWidth={1.6} className="text-danger" />
                <span className="flex-1 text-[13px] font-semibold text-t9">Alertas do dia</span>
                <span className="rounded-pill bg-[#FEE2E2] px-1.5 py-0.5 text-[11px] font-bold text-[#991B1B]">
                  {alertas.length}
                </span>
              </div>
              <div className="px-3 py-3">
                {alertas.map((alerta, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'mb-1.5 flex items-start gap-2.5 rounded-inner p-2.5 last:mb-0',
                      alerta.tipo === 'estoque_critico' ? 'border border-[#FECACA] bg-[#FEF2F2]' : 'border border-[#FDE68A] bg-[#FFFBEB]'
                    )}
                  >
                    <div className={cn(
                      'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                      alerta.tipo === 'estoque_critico' ? 'bg-[#FEE2E2] text-danger' : 'bg-warning-bg text-warning-text'
                    )}>
                      <AlertCircle size={14} strokeWidth={1.6} />
                    </div>
                    <div>
                      <div className="text-[11.5px] font-semibold text-t9">{alerta.titulo}</div>
                      <div className="mt-0.5 text-[10px] leading-tight text-t6">{alerta.subtitulo}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ESTOQUE BAIXO */}
          <div className="overflow-hidden rounded-card border border-bd bg-white shadow-card">
            <div className="flex items-center gap-2 border-b border-bd px-[18px] py-3.5">
              <Package size={14} strokeWidth={1.6} className="text-t6" />
              <span className="flex-1 text-[13px] font-semibold text-t9">Estoque baixo</span>
            </div>
            <div className="px-[18px] py-1">
              {estoqueBaixo.length === 0 ? (
                <div className="py-6 text-center text-xs text-t4">Nenhum produto com estoque baixo.</div>
              ) : (
                estoqueBaixo.map((produto) => (
                  <div key={produto.id} className="flex items-center gap-2.5 border-b border-bd py-2.5 last:border-none">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-inner bg-cream">
                      <ImageOff size={16} strokeWidth={1.6} className="text-t4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[11.5px] font-semibold text-t9">{produto.name}</div>
                      <div className="mt-0.5 text-[9.5px] text-t4">{produto.category ?? 'Sem categoria'}</div>
                    </div>
                    <span className={cn(
                      'whitespace-nowrap rounded-pill px-2 py-0.5 text-[10px] font-bold',
                      produto.stockStatus === 'out_of_stock' ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#FEF3C7] text-[#92400E]'
                    )}>
                      {produto.quantidade != null ? `${produto.quantidade}${produto.unidade}` : (produto.stockStatus === 'out_of_stock' ? 'Sem estoque' : 'Baixo')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* FORMAS DE PAGAMENTO */}
          <div className="overflow-hidden rounded-card border border-bd bg-white shadow-card">
            <div className="flex items-center gap-2 border-b border-bd px-[18px] py-3.5">
              <CreditCard size={14} strokeWidth={1.6} className="text-t6" />
              <span className="flex-1 text-[13px] font-semibold text-t9">Formas de pagamento hoje</span>
            </div>
            <div className="px-[18px] py-2">
              {pagamentos.length === 0 ? (
                <div className="py-6 text-center text-xs text-t4">Nenhum pedido hoje ainda.</div>
              ) : (
                pagamentos.map((p) => (
                  <div key={p.method} className="flex items-center gap-2.5 border-b border-bd py-2 last:border-none">
                    <span className="flex-1 text-[11.5px] text-t6">{p.label}</span>
                    <div className="h-1.5 w-20 overflow-hidden rounded-pill bg-gray-100">
                      <div className="h-full rounded-pill bg-g" style={{ width: `${p.percentage}%` }} />
                    </div>
                    <span className="w-8 text-right text-[11px] font-semibold tabular-nums text-t9">{p.percentage}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
