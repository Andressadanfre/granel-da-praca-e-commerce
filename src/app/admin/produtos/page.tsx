import Image from 'next/image'
import Link from 'next/link'
import { Plus, Package, ImageOff, AlertTriangle, EyeOff, Pencil, ChevronLeft, ChevronRight } from 'lucide-react'

import {
  getAdminProducts,
  getProductTabCounts,
  getActiveCategories,
  type ProductTab,
  type ProductSortBy,
  type AdminProductListItem,
} from '@/lib/admin/products'
import { STOCK_STATUS_STYLES } from '@/lib/admin/labels'
import { ProductFilters } from '@/components/admin/ProductFilters'
import { formatBRL, formatGrams, cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

const TABS: { key: ProductTab; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'sem_foto', label: 'Sem foto' },
  { key: 'estoque_baixo', label: 'Estoque baixo' },
  { key: 'granel', label: 'Granel' },
  { key: 'unit', label: 'Unitário' },
  { key: 'inativos', label: 'Inativos' },
]

const VALID_TABS = TABS.map((t) => t.key)
const VALID_SORTS: ProductSortBy[] = ['nome_asc', 'nome_desc', 'preco_asc', 'preco_desc', 'estoque_critico', 'sem_foto']

const actionBtnClass =
  'flex h-7 w-7 items-center justify-center rounded-input border border-bd bg-white text-t6 transition-colors hover:border-gd hover:bg-badge-diet-bg hover:text-gd'

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function buildQueryString(
  current: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams()
  const merged = { ...current, ...overrides }
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value)
  }
  return params.toString()
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = new Set<number>([1, 2, total - 1, total, current - 1, current, current + 1])
  const filtered = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)

  const result: (number | 'ellipsis')[] = []
  let prev = 0
  for (const p of filtered) {
    if (prev && p - prev > 1) result.push('ellipsis')
    result.push(p)
    prev = p
  }
  return result
}

function formatPriceMain(p: AdminProductListItem): string {
  return p.productType === 'granel' ? formatBRL(Math.round(p.priceCents / 10)) : formatBRL(p.priceCents)
}

function formatPriceLabel(p: AdminProductListItem): string {
  return p.productType === 'granel' ? 'por 100 gr' : 'por unidade'
}

function formatEstoqueLabel(p: AdminProductListItem): string {
  const qty = p.productType === 'granel' ? p.stockQuantityGrams : p.stockQuantityUnits
  const statusLabel = STOCK_STATUS_STYLES[p.stockStatus].label

  if (qty == null) {
    return p.stockStatus === 'in_stock' ? `${statusLabel} · não conferido` : statusLabel
  }

  const quantidade = p.productType === 'granel' ? formatGrams(qty) : `${qty} un`
  return `${quantidade} · ${statusLabel.toLowerCase()}`
}

interface AdminProdutosPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function AdminProdutosPage({ searchParams }: AdminProdutosPageProps) {
  const busca = firstParam(searchParams.busca)
  const categoriaParam = firstParam(searchParams.categoria)
  const tipoParam = firstParam(searchParams.tipo)
  const tabParam = firstParam(searchParams.tab)
  const ordenarParam = firstParam(searchParams.ordenar)
  const paginaParam = firstParam(searchParams.pagina)

  const categoryId = categoriaParam ? Number.parseInt(categoriaParam, 10) : undefined
  const productType = tipoParam === 'granel' || tipoParam === 'unit' ? tipoParam : undefined
  const tab: ProductTab = VALID_TABS.includes(tabParam as ProductTab) ? (tabParam as ProductTab) : 'todos'
  const sortBy: ProductSortBy = VALID_SORTS.includes(ordenarParam as ProductSortBy)
    ? (ordenarParam as ProductSortBy)
    : 'nome_asc'
  const page = paginaParam ? Math.max(1, Number.parseInt(paginaParam, 10) || 1) : 1

  const currentParams: Record<string, string | undefined> = {
    busca,
    categoria: categoriaParam,
    tipo: tipoParam,
    tab: tabParam,
    ordenar: ordenarParam,
    pagina: paginaParam,
  }

  const [{ products, total }, tabCounts, categorias] = await Promise.all([
    getAdminProducts({ search: busca, categoryId, productType, tab, sortBy, page, pageSize: PAGE_SIZE }),
    getProductTabCounts(),
    getActiveCategories(),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const pageNumbers = getPageNumbers(page, totalPages)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-bold text-gdeep">Produtos</h1>
          <span className="text-sm font-medium text-t4">({tabCounts.todos})</span>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="inline-flex items-center gap-1.5 rounded-sel bg-g px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-ghover"
        >
          <Plus size={14} strokeWidth={1.8} aria-hidden />
          Novo produto
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="flex items-center gap-2.5 rounded-inner border border-bd bg-white p-3.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-inner bg-gray-100 text-t6">
            <Package size={16} strokeWidth={1.6} aria-hidden />
          </div>
          <div>
            <div className="text-lg font-bold leading-none text-t9">{tabCounts.todos}</div>
            <div className="mt-0.5 text-[10px] font-medium text-t4">Total de produtos</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-inner border border-warning-dot/30 bg-warning-bg p-3.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-inner bg-warning-dot/15 text-warning-text">
            <ImageOff size={16} strokeWidth={1.6} aria-hidden />
          </div>
          <div>
            <div className="text-lg font-bold leading-none text-warning-text">{tabCounts.semFoto}</div>
            <div className="mt-0.5 text-[10px] font-medium text-warning-text">Sem foto — urgente</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-inner border border-danger/30 bg-danger/5 p-3.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-inner bg-danger/10 text-danger">
            <AlertTriangle size={16} strokeWidth={1.6} aria-hidden />
          </div>
          <div>
            <div className="text-lg font-bold leading-none text-danger">{tabCounts.estoqueBaixo}</div>
            <div className="mt-0.5 text-[10px] font-medium text-danger">Estoque baixo ou crítico</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-inner border border-bd bg-gray-100 p-3.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-inner bg-white text-t4">
            <EyeOff size={16} strokeWidth={1.6} aria-hidden />
          </div>
          <div>
            <div className="text-lg font-bold leading-none text-t6">{tabCounts.inativos}</div>
            <div className="mt-0.5 text-[10px] font-medium text-t4">Produtos inativos</div>
          </div>
        </div>
      </div>

      <div className="mb-3.5 flex flex-wrap gap-1">
        {TABS.map((t) => {
          const isActive = t.key === tab
          const count =
            t.key === 'todos'
              ? tabCounts.todos
              : t.key === 'sem_foto'
                ? tabCounts.semFoto
                : t.key === 'estoque_baixo'
                  ? tabCounts.estoqueBaixo
                  : t.key === 'granel'
                    ? tabCounts.granel
                    : t.key === 'unit'
                      ? tabCounts.unit
                      : tabCounts.inativos

          return (
            <Link
              key={t.key}
              href={`?${buildQueryString(currentParams, { tab: t.key === 'todos' ? undefined : t.key, pagina: undefined })}`}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-sel border px-3 py-1.5 text-[11px] font-medium transition-colors',
                isActive ? 'border-gdeep bg-gdeep font-semibold text-white' : 'border-bd bg-white text-t6 hover:border-g hover:text-g',
              )}
            >
              {t.label}
              <span
                className={cn(
                  'rounded-pill px-1.5 py-0.5 text-[9px] font-bold',
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-t6',
                )}
              >
                {count}
              </span>
            </Link>
          )
        })}
      </div>

      <ProductFilters categorias={categorias} />

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-bd bg-white py-20 shadow-card">
          <p className="text-sm font-semibold text-t9">Nenhum produto encontrado</p>
          <p className="text-[13px] text-t6">Tente ajustar a busca ou os filtros selecionados.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-bd bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-bd bg-gray-100">
                  <th className="px-5 py-2.5 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Produto</th>
                  <th className="px-4 py-2.5 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Tipo</th>
                  <th className="px-4 py-2.5 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Preço</th>
                  <th className="px-4 py-2.5 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Estoque</th>
                  <th className="px-4 py-2.5 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Status</th>
                  <th className="px-4 py-2.5 text-left text-[9.5px] font-semibold uppercase tracking-wider text-t4">Foto</th>
                  <th className="px-5 py-2.5 text-right text-[9.5px] font-semibold uppercase tracking-wider text-t4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const stockStyle = STOCK_STATUS_STYLES[p.stockStatus]

                  return (
                    <tr
                      key={p.id}
                      className={cn(
                        'border-b border-bd last:border-b-0 hover:bg-surface',
                        !p.hasPhoto && 'border-l-[3px] border-l-warning-dot',
                        !p.isActive && 'opacity-55',
                      )}
                    >
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="relative flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center overflow-hidden rounded-inner border border-bd bg-cream text-t4">
                            {p.imageUrl ? (
                              <Image
                                src={p.imageUrl}
                                alt={p.name}
                                fill
                                sizes="42px"
                                className="object-cover"
                              />
                            ) : (
                              <ImageOff size={16} strokeWidth={1.6} aria-hidden />
                            )}
                          </div>
                          <div>
                            <div className="text-[12px] font-semibold text-t9">{p.name}</div>
                            <div className="mt-0.5 text-[10px] text-t6">{p.categoryName ?? '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={cn(
                            'rounded-pill px-2 py-0.5 text-[9.5px] font-semibold',
                            p.productType === 'granel' ? 'bg-badge-diet-bg text-badge-diet-tx' : 'bg-indigo-bg text-indigo',
                          )}
                        >
                          {p.productType === 'granel' ? 'Granel' : 'Unitário'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className={cn('text-[13px] font-bold', p.isActive ? 'text-gdeep' : 'text-t4')}>
                          {formatPriceMain(p)}
                        </div>
                        <div className="mt-0.5 text-[9.5px] text-t4">{formatPriceLabel(p)}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className="inline-flex whitespace-nowrap rounded-pill px-2.5 py-1 text-[10px] font-bold"
                          style={{ backgroundColor: stockStyle.bg, color: stockStyle.text }}
                        >
                          {formatEstoqueLabel(p)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-pill px-2 py-0.5 text-[10px] font-semibold',
                            p.isActive ? 'bg-badge-diet-bg text-badge-diet-tx' : 'bg-gray-100 text-t4',
                          )}
                        >
                          <span className={cn('h-[5px] w-[5px] rounded-full', p.isActive ? 'bg-g' : 'bg-t4')} />
                          {p.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={cn(
                            'rounded-pill px-2 py-0.5 text-[10px] font-semibold',
                            p.hasPhoto ? 'bg-badge-diet-bg text-badge-diet-tx' : 'bg-warning-bg text-warning-text',
                          )}
                        >
                          {p.hasPhoto ? `${p.photoCount} foto${p.photoCount > 1 ? 's' : ''}` : 'Pendente'}
                        </span>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/produtos/${p.id}/editar`}
                            title="Editar produto"
                            aria-label="Editar produto"
                            className={cn(actionBtnClass)}
                          >
                            <Pencil size={13} strokeWidth={1.6} aria-hidden />
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
              Mostrando {products.length} de {total} produtos
            </p>
            <div className="flex gap-1">
              <Link
                href={`?${buildQueryString(currentParams, { pagina: String(Math.max(1, page - 1)) })}`}
                aria-disabled={page <= 1}
                className={cn(
                  'flex h-[30px] w-[30px] items-center justify-center rounded-input border border-bd bg-white text-t6 transition-colors hover:border-g hover:text-g',
                  page <= 1 && 'pointer-events-none opacity-40',
                )}
              >
                <ChevronLeft size={13} strokeWidth={1.6} aria-hidden />
              </Link>

              {pageNumbers.map((p, idx) =>
                p === 'ellipsis' ? (
                  <span key={`ellipsis-${idx}`} className="flex h-[30px] items-center px-1 text-[10px] text-t4">
                    …
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={`?${buildQueryString(currentParams, { pagina: String(p) })}`}
                    className={cn(
                      'flex h-[30px] w-[30px] items-center justify-center rounded-input border text-[11.5px] font-medium transition-colors',
                      p === page ? 'border-gdeep bg-gdeep font-semibold text-white' : 'border-bd bg-white text-t6 hover:border-g hover:text-g',
                    )}
                  >
                    {p}
                  </Link>
                ),
              )}

              <Link
                href={`?${buildQueryString(currentParams, { pagina: String(Math.min(totalPages, page + 1)) })}`}
                aria-disabled={page >= totalPages}
                className={cn(
                  'flex h-[30px] w-[30px] items-center justify-center rounded-input border border-bd bg-white text-t6 transition-colors hover:border-g hover:text-g',
                  page >= totalPages && 'pointer-events-none opacity-40',
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
