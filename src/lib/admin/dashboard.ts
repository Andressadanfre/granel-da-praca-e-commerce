import 'server-only'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { logger, logError } from '@/lib/logger'
import { formatBRL } from '@/lib/utils'
import { PAYMENT_METHOD_LABELS } from '@/lib/admin/labels'
import type { AdminOrderListItem } from '@/types/admin'

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
