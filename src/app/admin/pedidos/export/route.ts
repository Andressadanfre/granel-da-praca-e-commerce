import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

import { createLogger, logError } from '@/lib/logger'
import { getAdminOrdersFiltered, parseAdminOrderFilters } from '@/lib/admin/orders'
import {
  DELIVERY_TYPE_LABELS,
  ORDER_STATUS_STYLES,
  PAYMENT_METHOD_LABELS,
  formatOrderDateTime,
} from '@/lib/admin/labels'
import { formatBRL } from '@/lib/utils'
import type { AdminOrderListItem } from '@/types/admin'

export const dynamic = 'force-dynamic'

const CSV_HEADERS = [
  'Código',
  'Cliente',
  'Telefone',
  'Itens',
  'Total (R$)',
  'Pagamento',
  'Status',
  'Tipo de Entrega',
  'Data/Hora',
] as const

function csvField(value: string): string {
  const neutralized = /^[=+\-@|]/.test(value) ? `'${value}` : value
  if (/[",\n\r]/.test(neutralized)) {
    return `"${neutralized.replace(/"/g, '""')}"`
  }
  return neutralized
}

function orderToCsvRow(order: AdminOrderListItem): string {
  return [
    csvField(order.code),
    csvField(order.customer_name ?? ''),
    csvField(order.customer_phone ?? ''),
    csvField(String(order.items_count)),
    csvField(formatBRL(order.total_cents)),
    csvField(PAYMENT_METHOD_LABELS[order.payment_method]),
    csvField(ORDER_STATUS_STYLES[order.status].label),
    csvField(DELIVERY_TYPE_LABELS[order.delivery_type]),
    csvField(formatOrderDateTime(order.created_at)),
  ].join(',')
}

export async function GET(request: NextRequest) {
  const log = createLogger({ action: 'adminPedidosExport' })

  try {
    const filters = parseAdminOrderFilters(Object.fromEntries(request.nextUrl.searchParams.entries()))
    const { orders } = await getAdminOrdersFiltered({ ...filters, pagina: 1 }, true)

    const csv = `\uFEFF${[CSV_HEADERS.join(','), ...orders.map(orderToCsvRow)].join('\n')}`
    const data = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="pedidos-${data}.csv"`,
      },
    })
  } catch (error) {
    logError(log, error, { action: 'adminPedidosExport' }, 'Falha ao exportar pedidos em CSV')
    Sentry.captureException(error, { extra: { action: 'adminPedidosExport' } })
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
