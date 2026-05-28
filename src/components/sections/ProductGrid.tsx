import Link from 'next/link'

import { getSupabaseServer } from '@/lib/supabase/server'
import { ProductCard } from '@/components/product/ProductCard'
import { EmptyState } from '@/components/product/EmptyState'
import type { ProductCardProps } from '@/components/product/ProductCard'
import type { ProductType, ProductUnit, StockStatus } from '@/types/database'
import { cn } from '@/lib/utils'

// ─── Constantes ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 24

const UNIT_LABEL: Record<ProductUnit, string> = {
  KG: 'Por kg',
  UN: 'Por unidade',
  SC: 'Por saco',
  CX: 'Por caixa',
  BL: 'Por bloco',
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ProductGridProps {
  categoria?: string
  q?: string
  pagina?: number
}

interface ProductRow {
  id: string
  name: string
  description: string | null
  category_id: string | null
  product_type: ProductType
  unit: ProductUnit
  price_cents: number
  compare_at_cents: number | null
  increment_grams: number
  stock_status: StockStatus
  image_url: string | null
  categories: { name: string } | null
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function toCardProps(p: ProductRow): ProductCardProps {
  const isGranel = p.product_type === 'granel'

  const discountPercent =
    p.compare_at_cents && p.compare_at_cents > p.price_cents
      ? Math.round((1 - p.price_cents / p.compare_at_cents) * 100)
      : undefined

  return {
    id: p.id,
    name: p.name,
    category: p.categories?.name ?? '',
    variant: isGranel ? 'granel' : 'unit',
    priceInCents: isGranel ? Math.round(p.price_cents / 10) : p.price_cents,
    pricePerKgInCents: isGranel ? p.price_cents : undefined,
    originalPriceInCents: p.compare_at_cents ?? undefined,
    discountPercent,
    packageLabel: isGranel ? 'A granel' : UNIT_LABEL[p.unit],
    imageUrl: p.image_url ?? undefined,
    state:
      p.stock_status === 'out_of_stock'
        ? 'out-of-stock'
        : p.stock_status === 'low_stock'
          ? 'low-stock'
          : discountPercent
            ? 'discount'
            : 'default',
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildHref(pagina: number, categoria?: string, q?: string): string {
  const params = new URLSearchParams()
  if (categoria) params.set('categoria', categoria)
  if (q) params.set('q', q)
  if (pagina > 1) params.set('pagina', String(pagina))
  const qs = params.toString()
  return `/loja${qs ? `?${qs}` : ''}`
}

// ─── Paginação ────────────────────────────────────────────────────────────────

function Paginacao({
  paginaAtual,
  totalPaginas,
  categoria,
  q,
}: {
  paginaAtual: number
  totalPaginas: number
  categoria?: string
  q?: string
}) {
  if (totalPaginas <= 1) return null

  const paginas: (number | 'ellipsis')[] = []

  if (totalPaginas <= 7) {
    for (let i = 1; i <= totalPaginas; i++) paginas.push(i)
  } else {
    const start = Math.max(2, paginaAtual - 1)
    const end = Math.min(totalPaginas - 1, paginaAtual + 1)
    paginas.push(1)
    if (start > 2) paginas.push('ellipsis')
    for (let i = start; i <= end; i++) paginas.push(i)
    if (end < totalPaginas - 1) paginas.push('ellipsis')
    paginas.push(totalPaginas)
  }

  const btnBase =
    'flex items-center justify-center h-9 min-w-[36px] px-2 rounded-input text-sm font-medium transition-colors duration-[180ms]'

  return (
    <nav
      aria-label="Paginação"
      className="flex items-center justify-center gap-1.5 mt-10 flex-wrap"
    >
      {paginaAtual > 1 ? (
        <Link
          href={buildHref(paginaAtual - 1, categoria, q)}
          className={cn(btnBase, 'border border-bd text-t6 hover:bg-g-muted')}
          aria-label="Página anterior"
        >
          ←
        </Link>
      ) : (
        <span
          className={cn(btnBase, 'border border-bd text-t4 opacity-50 cursor-not-allowed')}
          aria-disabled="true"
        >
          ←
        </span>
      )}

      {paginas.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`el-${i}`} className={cn(btnBase, 'text-t4')}>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p, categoria, q)}
            aria-current={p === paginaAtual ? 'page' : undefined}
            className={cn(
              btnBase,
              p === paginaAtual
                ? 'bg-gd text-white'
                : 'border border-bd text-t6 hover:bg-g-muted',
            )}
          >
            {p}
          </Link>
        ),
      )}

      {paginaAtual < totalPaginas ? (
        <Link
          href={buildHref(paginaAtual + 1, categoria, q)}
          className={cn(btnBase, 'border border-bd text-t6 hover:bg-g-muted')}
          aria-label="Próxima página"
        >
          →
        </Link>
      ) : (
        <span
          className={cn(btnBase, 'border border-bd text-t4 opacity-50 cursor-not-allowed')}
          aria-disabled="true"
        >
          →
        </span>
      )}
    </nav>
  )
}

// ─── Componente principal — Server Component ──────────────────────────────────

export default async function ProductGrid({
  categoria,
  q,
  pagina = 1,
}: ProductGridProps) {
  const supabase = getSupabaseServer()

  // Resolver category_id a partir do slug
  let categoryId: string | null = null
  if (categoria) {
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categoria)
      .eq('is_active', true)
      .single()

    if (!catData) {
      return <EmptyState context="filter" />
    }
    categoryId = catData.id
  }

  // Query principal com paginação
  const from = (pagina - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('products')
    .select(
      'id, name, description, category_id, product_type, unit, price_cents, compare_at_cents, increment_grams, stock_status, image_url, categories(name)',
      { count: 'exact' },
    )
    .eq('is_active', true)
    .eq('is_deleted', false)

  if (categoryId !== null) {
    query = query.eq('category_id', categoryId)
  }

  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`)
  }

  const { data, count, error } = await query
    .order('name', { ascending: true })
    .range(from, to)

  if (error) {
    return <EmptyState context="filter" />
  }

  // Normalizar categories — Supabase retorna array em joins com isOneToOne: false
  const products: ProductRow[] = (data ?? []).map((row) => {
    const rawCat = row.categories
    const categories: { name: string } | null =
      rawCat === null || rawCat === undefined
        ? null
        : Array.isArray(rawCat)
          ? ((rawCat[0] as { name: string } | undefined) ?? null)
          : (rawCat as { name: string })

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category_id: row.category_id,
      product_type: row.product_type,
      unit: row.unit,
      price_cents: row.price_cents,
      compare_at_cents: row.compare_at_cents,
      increment_grams: row.increment_grams,
      stock_status: row.stock_status,
      image_url: row.image_url,
      categories,
    }
  })

  const totalPaginas = Math.ceil((count ?? 0) / PAGE_SIZE)

  if (products.length === 0) {
    return <EmptyState context={q ? 'search' : 'filter'} searchTerm={q} />
  }

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} {...toCardProps(p)} />
        ))}
      </div>
      <Paginacao
        paginaAtual={pagina}
        totalPaginas={totalPaginas}
        categoria={categoria}
        q={q}
      />
    </div>
  )
}
