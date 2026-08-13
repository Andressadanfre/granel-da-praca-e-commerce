import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { logger, logError } from '@/lib/logger'
import type {
  AdminOrder,
  AdminOrderFilters,
  AdminOrderListItem,
  AdminOrderStatusFilter,
} from '@/types/admin'

export const PAGE_SIZE = 15

const SP_TZ = 'America/Sao_Paulo'
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const ORDERS_LIST_SELECT =
  'id, code, status, payment_status, payment_method, delivery_type, total_cents, customer_name, customer_phone, created_at, order_items(count)'

const STATUS_COUNT_KEYS: readonly AdminOrderStatusFilter[] = [
  'todos',
  'recebido',
  'aceito',
  'em_separacao',
  'saiu_para_entrega',
  'pronto_para_retirada',
  'entregue_retirado',
  'cancelado',
]

type SharedOrderFilters = Omit<AdminOrderFilters, 'status' | 'pagina'>

type PeriodRange = { gte?: string; lt?: string }

function isIsoDate(value: string | undefined): value is string {
  if (!value || !ISO_DATE.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const utc = new Date(Date.UTC(year, month - 1, day))
  return utc.getUTCFullYear() === year && utc.getUTCMonth() === month - 1 && utc.getUTCDate() === day
}

function ymdInSaoPaulo(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: SP_TZ })
}

function addCalendarDays(ymd: string, days: number): string {
  const [year, month, day] = ymd.split('-').map(Number)
  const utc = new Date(Date.UTC(year, month - 1, day + days))
  const y = String(utc.getUTCFullYear())
  const m = String(utc.getUTCMonth() + 1).padStart(2, '0')
  const d = String(utc.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Instant UTC correspondente a 00:00:00.000 no relógio de America/Sao_Paulo. */
function saoPauloMidnightUtcIso(ymd: string): string {
  const utcGuess = new Date(`${ymd}T00:00:00.000Z`)
  const spWall = utcGuess.toLocaleString('sv-SE', { timeZone: SP_TZ })
  const spAsUtc = new Date(`${spWall.replace(' ', 'T')}Z`)
  const offsetMs = spAsUtc.getTime() - utcGuess.getTime()
  return new Date(utcGuess.getTime() - offsetMs).toISOString()
}

function hojeRange(): { gte: string; lt: string } {
  const hoje = ymdInSaoPaulo(new Date())
  return { gte: saoPauloMidnightUtcIso(hoje), lt: saoPauloMidnightUtcIso(addCalendarDays(hoje, 1)) }
}

function resolvePeriodRange(filters: Pick<AdminOrderFilters, 'periodo' | 'de' | 'ate'>): PeriodRange {
  // 'sempre' existe para telas que precisam do conjunto completo de pedidos
  // (ex: dashboard). Não aplica filtro de created_at — evita data sentinela
  // de negócio (tipo 2020-01-01) representando "sem filtro".
  if (filters.periodo === 'sempre') return {}

  if (filters.periodo === 'hoje') return hojeRange()

  if (filters.periodo === 'ontem') {
    const hoje = ymdInSaoPaulo(new Date())
    const ontem = addCalendarDays(hoje, -1)
    return { gte: saoPauloMidnightUtcIso(ontem), lt: saoPauloMidnightUtcIso(hoje) }
  }

  if (filters.periodo === '7dias') {
    const inicio = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return { gte: inicio.toISOString() }
  }

  if (isIsoDate(filters.de) && isIsoDate(filters.ate)) {
    const inicio = filters.de <= filters.ate ? filters.de : filters.ate
    const fim = filters.de <= filters.ate ? filters.ate : filters.de
    return {
      gte: saoPauloMidnightUtcIso(inicio),
      lt: saoPauloMidnightUtcIso(addCalendarDays(fim, 1)),
    }
  }

  return hojeRange()
}

function sanitizeSearchTerm(busca: string | undefined): string | null {
  if (!busca) return null
  const term = busca.trim().replace(/[%_,()]/g, '')
  return term.length > 0 ? term : null
}

const TIPO_FILTER_VALUES = ['todos', 'entrega', 'retirada'] as const
const PAGAMENTO_FILTER_VALUES = [
  'todos',
  'pix',
  'cartao_credito',
  'cartao_debito',
  'dinheiro',
  'alelo',
] as const
const PERIODO_FILTER_VALUES = ['hoje', 'ontem', '7dias', 'personalizado', 'sempre'] as const

type SearchParamsInput = { [key: string]: string | string[] | undefined }

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function isAllowedValue<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): value is T {
  return value !== undefined && (allowed as readonly string[]).includes(value)
}

export function parseAdminOrderFilters(searchParams: SearchParamsInput): AdminOrderFilters {
  const statusRaw = firstSearchParam(searchParams.status)
  const tipoRaw = firstSearchParam(searchParams.tipo)
  const pagamentoRaw = firstSearchParam(searchParams.pagamento)
  const periodoRaw = firstSearchParam(searchParams.periodo)
  const paginaRaw = firstSearchParam(searchParams.pagina)
  const buscaRaw = firstSearchParam(searchParams.busca)?.trim()
  const deRaw = firstSearchParam(searchParams.de)
  const ateRaw = firstSearchParam(searchParams.ate)

  const paginaParsed = paginaRaw ? Number.parseInt(paginaRaw, 10) : 1
  const pagina = Number.isFinite(paginaParsed) && paginaParsed > 0 ? Math.floor(paginaParsed) : 1

  const periodo = isAllowedValue(periodoRaw, PERIODO_FILTER_VALUES) ? periodoRaw : 'sempre'

  return {
    status: isAllowedValue(statusRaw, STATUS_COUNT_KEYS) ? statusRaw : 'todos',
    tipo: isAllowedValue(tipoRaw, TIPO_FILTER_VALUES) ? tipoRaw : 'todos',
    pagamento: isAllowedValue(pagamentoRaw, PAGAMENTO_FILTER_VALUES) ? pagamentoRaw : 'todos',
    periodo,
    ...(periodo === 'personalizado' && isIsoDate(deRaw) ? { de: deRaw } : {}),
    ...(periodo === 'personalizado' && isIsoDate(ateRaw) ? { ate: ateRaw } : {}),
    ...(buscaRaw ? { busca: buscaRaw.slice(0, 100) } : {}),
    pagina,
  }
}

export function buildFilterUrl(
  current: AdminOrderFilters,
  overrides: Partial<AdminOrderFilters> = {},
): string {
  const merged: AdminOrderFilters = { ...current, ...overrides }
  const params = new URLSearchParams()

  if (merged.status !== 'todos') params.set('status', merged.status)
  if (merged.tipo !== 'todos') params.set('tipo', merged.tipo)
  if (merged.pagamento !== 'todos') params.set('pagamento', merged.pagamento)
  if (merged.periodo !== 'sempre') params.set('periodo', merged.periodo)
  if (merged.periodo === 'personalizado') {
    if (merged.de) params.set('de', merged.de)
    if (merged.ate) params.set('ate', merged.ate)
  }
  const busca = merged.busca?.trim()
  if (busca) params.set('busca', busca)
  if (merged.pagina > 1) params.set('pagina', String(merged.pagina))

  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

type ResolvedOrderFilters = {
  statusEq: Exclude<AdminOrderStatusFilter, 'todos' | 'entregue_retirado'> | null
  statusIn: Array<'entregue' | 'retirado'> | null
  tipo: 'entrega' | 'retirada' | null
  pagamento: Exclude<AdminOrderFilters['pagamento'], 'todos'> | null
  range: PeriodRange
  search: string | null
}

function resolveOrderFilters(
  filters: SharedOrderFilters,
  status: AdminOrderStatusFilter,
): ResolvedOrderFilters {
  return {
    statusEq: status !== 'todos' && status !== 'entregue_retirado' ? status : null,
    statusIn: status === 'entregue_retirado' ? ['entregue', 'retirado'] : null,
    tipo: filters.tipo !== 'todos' ? filters.tipo : null,
    pagamento: filters.pagamento !== 'todos' ? filters.pagamento : null,
    range: resolvePeriodRange(filters),
    search: sanitizeSearchTerm(filters.busca),
  }
}

export async function getAdminOrdersFiltered(
  filters: AdminOrderFilters,
  semPaginacao = false,
): Promise<{ orders: AdminOrderListItem[]; total: number }> {
  const supabase = getSupabaseAdmin()
  const pagina = Number.isFinite(filters.pagina) && filters.pagina > 0 ? Math.floor(filters.pagina) : 1
  const from = (pagina - 1) * PAGE_SIZE
  const to = pagina * PAGE_SIZE - 1
  const resolved = resolveOrderFilters(filters, filters.status)

  try {
    let query = supabase
      .from('orders')
      .select(ORDERS_LIST_SELECT, { count: 'exact' })
      .eq('is_deleted', false)

    if (resolved.statusEq) query = query.eq('status', resolved.statusEq)
    if (resolved.statusIn) query = query.in('status', resolved.statusIn)
    if (resolved.tipo) query = query.eq('delivery_type', resolved.tipo)
    if (resolved.pagamento) query = query.eq('payment_method', resolved.pagamento)
    if (resolved.range.gte) query = query.gte('created_at', resolved.range.gte)
    if (resolved.range.lt) query = query.lt('created_at', resolved.range.lt)
    if (resolved.search) {
      query = query.or(
        `code.ilike.%${resolved.search}%,customer_name.ilike.%${resolved.search}%,customer_phone.ilike.%${resolved.search}%`,
      )
    }

    const ordered = query.order('created_at', { ascending: false })
    const { data, error, count } = semPaginacao
      ? await ordered
      : await ordered.range(from, to)

    if (error) {
      logError(logger, error, { action: 'getAdminOrdersFiltered' }, 'Falha ao buscar pedidos do admin')
      Sentry.captureException(error, { extra: { action: 'getAdminOrdersFiltered' } })
      return { orders: [], total: 0 }
    }

    return {
      orders: (data ?? []).map((row) => {
        const itemsRelation = row.order_items as { count: number }[] | null
        const items_count = itemsRelation?.[0]?.count ?? 0
        const { order_items: _omit, ...rest } = row
        void _omit
        return { ...rest, items_count }
      }),
      total: count ?? 0,
    }
  } catch (error) {
    logError(logger, error, { action: 'getAdminOrdersFiltered' }, 'Falha inesperada ao buscar pedidos do admin')
    Sentry.captureException(error, { extra: { action: 'getAdminOrdersFiltered' } })
    return { orders: [], total: 0 }
  }
}

export async function getAdminOrderStatusCounts(
  filters: Omit<AdminOrderFilters, 'status' | 'pagina'>,
): Promise<Record<AdminOrderStatusFilter, number>> {
  const supabase = getSupabaseAdmin()
  const zerado = (): Record<AdminOrderStatusFilter, number> => ({
    todos: 0,
    recebido: 0,
    aceito: 0,
    em_separacao: 0,
    saiu_para_entrega: 0,
    pronto_para_retirada: 0,
    entregue_retirado: 0,
    cancelado: 0,
  })

  try {
    const resultados = await Promise.all(
      STATUS_COUNT_KEYS.map(async (status) => {
        const resolved = resolveOrderFilters(filters, status)
        let query = supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('is_deleted', false)

        if (resolved.statusEq) query = query.eq('status', resolved.statusEq)
        if (resolved.statusIn) query = query.in('status', resolved.statusIn)
        if (resolved.tipo) query = query.eq('delivery_type', resolved.tipo)
        if (resolved.pagamento) query = query.eq('payment_method', resolved.pagamento)
        if (resolved.range.gte) query = query.gte('created_at', resolved.range.gte)
        if (resolved.range.lt) query = query.lt('created_at', resolved.range.lt)
        if (resolved.search) {
          query = query.or(
            `code.ilike.%${resolved.search}%,customer_name.ilike.%${resolved.search}%,customer_phone.ilike.%${resolved.search}%`,
          )
        }

        const { count, error } = await query
        return { status, count: count ?? 0, error }
      }),
    )

    const primeiroErro = resultados.find((r) => r.error)?.error
    if (primeiroErro) {
      logError(logger, primeiroErro, { action: 'getAdminOrderStatusCounts' }, 'Falha ao contar pedidos por status')
      Sentry.captureException(primeiroErro, { extra: { action: 'getAdminOrderStatusCounts' } })
      return zerado()
    }

    const counts = zerado()
    for (const resultado of resultados) {
      counts[resultado.status] = resultado.count
    }
    return counts
  } catch (error) {
    logError(logger, error, { action: 'getAdminOrderStatusCounts' }, 'Falha inesperada ao contar pedidos por status')
    Sentry.captureException(error, { extra: { action: 'getAdminOrderStatusCounts' } })
    return zerado()
  }
}

export async function getAdminTodaySummary(): Promise<{ count: number; totalCents: number }> {
  const supabase = getSupabaseAdmin()
  const range = hojeRange()

  try {
    let query = supabase
      .from('orders')
      .select('total_cents', { count: 'exact' })
      .eq('is_deleted', false)
      .eq('payment_status', 'pago')
      .gte('created_at', range.gte)

    if (range.lt) query = query.lt('created_at', range.lt)

    const { data, error, count } = await query

    if (error) {
      logError(logger, error, { action: 'getAdminTodaySummary' }, 'Falha ao buscar resumo de pedidos de hoje')
      Sentry.captureException(error, { extra: { action: 'getAdminTodaySummary' } })
      return { count: 0, totalCents: 0 }
    }

    const totalCents = (data ?? []).reduce((sum, row) => sum + row.total_cents, 0)
    return { count: count ?? 0, totalCents }
  } catch (error) {
    logError(logger, error, { action: 'getAdminTodaySummary' }, 'Falha inesperada ao buscar resumo de pedidos de hoje')
    Sentry.captureException(error, { extra: { action: 'getAdminTodaySummary' } })
    return { count: 0, totalCents: 0 }
  }
}

export async function getAdminOrderById(id: string): Promise<AdminOrder | null> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('orders')
    .select(
      `id, code, tracking_token, user_id, delivery_type, status, payment_method,
       payment_status, mp_payment_id, subtotal_cents, shipping_cents, discount_cents,
       total_cents, delivery_address, customer_name, customer_phone, customer_email,
       notes, cancelled_reason, cancelled_by, cancelled_at, is_deleted, created_at, updated_at,
       order_items(id, order_id, product_id, product_name, product_code, product_type,
         price_cents_snapshot, quantity_grams, quantity_units, item_total_cents,
         is_separated, separated_at)`,
    )
    .eq('id', id)
    .eq('is_deleted', false)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function isAdminUser(authUserId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', authUserId)
    .eq('is_active', true)
    .limit(1)

  if (error) {
    throw new Error(error.message)
  }

  return data !== null && data.length > 0
}
