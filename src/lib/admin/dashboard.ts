import 'server-only'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { logger, logError } from '@/lib/logger'
import { formatBRL } from '@/lib/utils'
import { getAdminOrders } from '@/lib/admin/orders'
import { ORDER_STATUS_STYLES, PAYMENT_METHOD_LABELS } from '@/lib/admin/labels'
import { PAY_ON_DELIVERY_METHODS, type PaymentMethod } from '@/lib/orders/types'
import type { AdminOrderListItem } from '@/types/admin'

/** Converte um timestamp UTC do banco para a data local (America/Sao_Paulo) no formato YYYY-MM-DD. */
function paraDataLocal(timestampUTC: string): string {
  return new Date(timestampUTC).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

const DIAS_SEMANA_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export interface DashboardKpis {
  faturamentoHojeCents: number
  faturamentoOntemCents: number
  pedidosHoje: number
  pedidosNovosAgora: number
  pedidosEntreguesHoje: number
  ticketMedioCents: number
}

export async function getKpisHoje(): Promise<DashboardKpis> {
  const supabase = getSupabaseAdmin()

  const kpisZerados = (): DashboardKpis => ({
    faturamentoHojeCents: 0,
    faturamentoOntemCents: 0,
    pedidosHoje: 0,
    pedidosNovosAgora: 0,
    pedidosEntreguesHoje: 0,
    ticketMedioCents: 0,
  })

  const agora = new Date()
  const hoje = agora.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
  const ontem = new Date(agora.getTime() - 86_400_000).toLocaleDateString('en-CA', {
    timeZone: 'America/Sao_Paulo',
  })
  const amanha = new Date(agora.getTime() + 86_400_000).toLocaleDateString('en-CA', {
    timeZone: 'America/Sao_Paulo',
  })

  const { data, error } = await supabase
    .from('orders')
    .select('total_cents, status, payment_status, payment_method, created_at')
    .eq('is_deleted', false)
    .gte('created_at', `${ontem}T00:00:00-03:00`)
    .lt('created_at', `${amanha}T00:00:00-03:00`)

  if (error) {
    logError(logger, error, { action: 'getKpisHoje' }, 'Falha ao buscar KPIs do dashboard')
    return kpisZerados()
  }

  const pedidos = data ?? []
  const ehFaturamentoValido = (p: (typeof pedidos)[number]) =>
    p.status !== 'cancelado' &&
    (p.payment_status === 'pago' || (PAY_ON_DELIVERY_METHODS as readonly PaymentMethod[]).includes(p.payment_method))

  const pedidosHoje = pedidos.filter((p) => paraDataLocal(p.created_at) === hoje)
  const pedidosOntem = pedidos.filter((p) => paraDataLocal(p.created_at) === ontem)

  const faturamentoHoje = pedidosHoje.filter(ehFaturamentoValido).reduce((acc, p) => acc + p.total_cents, 0)
  const faturamentoOntem = pedidosOntem.filter(ehFaturamentoValido).reduce((acc, p) => acc + p.total_cents, 0)
  const pedidosValidosHoje = pedidosHoje.filter((p) => p.status !== 'cancelado')

  return {
    faturamentoHojeCents: faturamentoHoje,
    faturamentoOntemCents: faturamentoOntem,
    pedidosHoje: pedidosValidosHoje.length,
    pedidosNovosAgora: pedidosHoje.filter((p) => p.status === 'recebido').length,
    pedidosEntreguesHoje: pedidosHoje.filter((p) => p.status === 'entregue' || p.status === 'retirado').length,
    ticketMedioCents: pedidosValidosHoje.length > 0 ? Math.round(faturamentoHoje / pedidosValidosHoje.length) : 0,
  }
}

export interface DiaFaturamento {
  data: string
  label: string
  totalCents: number
  isHoje: boolean
}

export async function getFaturamento7Dias(): Promise<DiaFaturamento[]> {
  const supabase = getSupabaseAdmin()

  const agora = new Date()
  const hoje = agora.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
  const amanha = new Date(agora.getTime() + 86_400_000).toLocaleDateString('en-CA', {
    timeZone: 'America/Sao_Paulo',
  })
  const seteDiasAtras = new Date(agora.getTime() - 6 * 86_400_000).toLocaleDateString('en-CA', {
    timeZone: 'America/Sao_Paulo',
  })

  const diasVazios = (): DiaFaturamento[] =>
    Array.from({ length: 7 }, (_, idx) => {
      const dataISO = new Date(agora.getTime() - (6 - idx) * 86_400_000).toLocaleDateString('en-CA', {
        timeZone: 'America/Sao_Paulo',
      })
      return {
        data: dataISO,
        label: DIAS_SEMANA_PT[new Date(`${dataISO}T12:00:00-03:00`).getDay()],
        totalCents: 0,
        isHoje: dataISO === hoje,
      }
    })

  const { data, error } = await supabase
    .from('orders')
    .select('total_cents, status, payment_status, payment_method, created_at')
    .eq('is_deleted', false)
    .gte('created_at', `${seteDiasAtras}T00:00:00-03:00`)
    .lt('created_at', `${amanha}T00:00:00-03:00`)

  if (error) {
    logError(logger, error, { action: 'getFaturamento7Dias' }, 'Falha ao buscar faturamento dos últimos 7 dias')
    return diasVazios()
  }

  const pedidos = data ?? []
  const ehFaturamentoValido = (p: (typeof pedidos)[number]) =>
    p.status !== 'cancelado' &&
    (p.payment_status === 'pago' || (PAY_ON_DELIVERY_METHODS as readonly PaymentMethod[]).includes(p.payment_method))

  const dias: DiaFaturamento[] = []
  for (let i = 6; i >= 0; i--) {
    const dataISO = new Date(agora.getTime() - i * 86_400_000).toLocaleDateString('en-CA', {
      timeZone: 'America/Sao_Paulo',
    })
    const diaSemana = DIAS_SEMANA_PT[new Date(`${dataISO}T12:00:00-03:00`).getDay()]

    const totalCents = pedidos
      .filter((p) => paraDataLocal(p.created_at) === dataISO && ehFaturamentoValido(p))
      .reduce((acc, p) => acc + p.total_cents, 0)

    dias.push({ data: dataISO, label: diaSemana, totalCents, isHoje: dataISO === hoje })
  }

  return dias
}

const STATUS_VISUAL_CLASS: Record<AdminOrderListItem['status'], string> = {
  recebido: 's-recebido',
  aceito: 's-separacao',
  em_separacao: 's-separacao',
  saiu_para_entrega: 's-saiu',
  pronto_para_retirada: 's-saiu',
  entregue: 's-entregue',
  retirado: 's-entregue',
  cancelado: 's-cancelado',
}

export interface PedidoRecente extends AdminOrderListItem {
  statusClasse: string
  statusLabel: string
}

export async function getPedidosRecentes(limit = 6): Promise<PedidoRecente[]> {
  const todos = await getAdminOrders()

  return todos.slice(0, limit).map((pedido) => ({
    ...pedido,
    statusClasse: STATUS_VISUAL_CLASS[pedido.status],
    statusLabel: ORDER_STATUS_STYLES[pedido.status].label,
  }))
}

export type AlertaTipo = 'estoque_critico' | 'estoque_baixo' | 'pagamento_pendente'

export interface AlertaDia {
  tipo: AlertaTipo
  titulo: string
  subtitulo: string
}

const CARTAO_METHODS: ReadonlyArray<AdminOrderListItem['payment_method']> = [
  'pix',
  'cartao_credito',
  'cartao_debito',
]

export async function getAlertasDoDia(): Promise<AlertaDia[]> {
  const supabase = getSupabaseAdmin()
  const alertas: AlertaDia[] = []

  const { data: produtos, error: erroProdutos } = await supabase
    .from('products')
    .select('name, stock_status, product_type, stock_quantity_grams, stock_quantity_units')
    .in('stock_status', ['out_of_stock', 'low_stock'])
    .eq('is_active', true)
    .eq('is_deleted', false)
    .order('stock_status', { ascending: true })

  if (erroProdutos) {
    logError(logger, erroProdutos, { action: 'getAlertasDoDia.produtos' }, 'Falha ao buscar alertas de estoque')
  } else {
    for (const p of produtos ?? []) {
      const qtd = p.product_type === 'granel' ? p.stock_quantity_grams : p.stock_quantity_units
      const unidade = p.product_type === 'granel' ? 'gr' : 'un'
      alertas.push({
        tipo: p.stock_status === 'out_of_stock' ? 'estoque_critico' : 'estoque_baixo',
        titulo: `${p.name} — ${p.stock_status === 'out_of_stock' ? 'Sem estoque' : 'Estoque baixo'}`,
        subtitulo: qtd != null ? `${qtd}${unidade} restantes` : 'Quantidade não informada — revisar',
      })
    }
  }

  const trintaMinAtras = new Date(Date.now() - 30 * 60 * 1000).toISOString()
  const { data: pedidosPendentes, error: erroPedidos } = await supabase
    .from('orders')
    .select('code, total_cents, payment_method, created_at')
    .eq('payment_status', 'pendente')
    .eq('is_deleted', false)
    .neq('status', 'cancelado')
    .in('payment_method', CARTAO_METHODS)
    .lt('created_at', trintaMinAtras)
    .order('created_at', { ascending: true })

  if (erroPedidos) {
    logError(logger, erroPedidos, { action: 'getAlertasDoDia.pedidos' }, 'Falha ao buscar alertas de pagamento pendente')
  } else {
    for (const pedido of pedidosPendentes ?? []) {
      const minutos = Math.floor((Date.now() - new Date(pedido.created_at).getTime()) / 60_000)
      alertas.push({
        tipo: 'pagamento_pendente',
        titulo: `Pagamento pendente há ${minutos} min`,
        subtitulo: `Pedido #${pedido.code} · ${PAYMENT_METHOD_LABELS[pedido.payment_method]} não confirmado · ${formatBRL(pedido.total_cents)}`,
      })
    }
  }

  return alertas
}
