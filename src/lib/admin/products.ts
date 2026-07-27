import 'server-only'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { logger, logError } from '@/lib/logger'
import type { Database } from '@/types/database'

export type ProductTab = 'todos' | 'sem_foto' | 'estoque_baixo' | 'granel' | 'unit' | 'inativos'
export type ProductSortBy = 'nome_asc' | 'nome_desc' | 'preco_asc' | 'preco_desc' | 'estoque_critico' | 'sem_foto'

type ProductType = Database['public']['Enums']['product_type']
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export interface AdminProductListItem {
  id: number
  name: string
  slug: string
  categoryName: string | null
  productType: ProductType
  priceCents: number
  compareAtCents: number | null
  stockStatus: StockStatus
  stockQuantityGrams: number | null
  stockQuantityUnits: number | null
  isActive: boolean
  hasPhoto: boolean
  photoCount: number
  createdAt: string
}

export interface GetAdminProductsParams {
  search?: string
  categoryId?: number
  productType?: ProductType
  tab?: ProductTab
  sortBy?: ProductSortBy
  page?: number
  pageSize?: number
}

export interface GetAdminProductsResult {
  products: AdminProductListItem[]
  total: number
  page: number
  pageSize: number
}

const PRODUCTS_SELECT =
  'id, name, slug, product_type, price_cents, compare_at_cents, stock_status, stock_quantity_grams, stock_quantity_units, is_active, created_at, categories(name), product_images(id)'

/** Resolve ids de categorias cujo nome bate com o termo — usado para o OR de busca (nome do produto OU nome da categoria). */
async function resolveCategoryIdsByName(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  term: string,
): Promise<number[]> {
  const { data, error } = await supabase.from('categories').select('id').ilike('name', `%${term}%`)

  if (error) {
    logError(logger, error, { action: 'resolveCategoryIdsByName' }, 'Falha ao buscar categorias para busca de produtos')
    return []
  }

  return (data ?? []).map((c) => c.id)
}

/**
 * Ids de produtos com pelo menos uma foto. Fonte única para o anti-join de "sem foto" —
 * filtrar `.is('product_images.id', null)` no embed não funciona: sem `!inner` o filtro
 * não restringe `products` (LEFT JOIN preservado), e com `!inner` o produto sem nenhuma
 * linha filha nunca chega a ser avaliado pelo `is null`. Usado por getAdminProducts e
 * getProductTabCounts para que tab e badge nunca dessincronizem.
 */
async function getProdutoIdsComFoto(supabase: ReturnType<typeof getSupabaseAdmin>): Promise<number[]> {
  const { data, error } = await supabase.from('product_images').select('product_id')

  if (error) {
    logError(logger, error, { action: 'getProdutoIdsComFoto' }, 'Falha ao buscar produtos com foto')
    return []
  }

  return Array.from(new Set((data ?? []).map((r) => r.product_id)))
}

export async function getAdminProducts(params: GetAdminProductsParams = {}): Promise<GetAdminProductsResult> {
  const { search, categoryId, productType, tab = 'todos', sortBy = 'nome_asc', page = 1, pageSize = 20 } = params
  const supabase = getSupabaseAdmin()

  const resultadoVazio = (): GetAdminProductsResult => ({ products: [], total: 0, page, pageSize })

  try {
    let query = supabase.from('products').select(PRODUCTS_SELECT, { count: 'exact' }).eq('is_deleted', false)

    if (categoryId) query = query.eq('category_id', categoryId)
    if (productType) query = query.eq('product_type', productType)

    switch (tab) {
      case 'sem_foto': {
        const idsComFoto = await getProdutoIdsComFoto(supabase)
        if (idsComFoto.length > 0) query = query.not('id', 'in', `(${idsComFoto.join(',')})`)
        break
      }
      case 'estoque_baixo':
        query = query.in('stock_status', ['low_stock', 'out_of_stock'])
        break
      case 'granel':
        query = query.eq('product_type', 'granel')
        break
      case 'unit':
        query = query.eq('product_type', 'unit')
        break
      case 'inativos':
        query = query.eq('is_active', false)
        break
      case 'todos':
      default:
        break
    }

    if (search && search.trim().length > 0) {
      // Remove caracteres que quebram a sintaxe do filtro or() do PostgREST.
      const term = search.trim().replace(/[,()]/g, '')
      const categoryIds = await resolveCategoryIdsByName(supabase, term)
      const orParts = [`name.ilike.%${term}%`]
      if (categoryIds.length > 0) {
        orParts.push(`category_id.in.(${categoryIds.join(',')})`)
      }
      query = query.or(orParts.join(','))
    }

    switch (sortBy) {
      case 'nome_desc':
        query = query.order('name', { ascending: false })
        break
      case 'preco_asc':
        query = query.order('price_cents', { ascending: true })
        break
      case 'preco_desc':
        query = query.order('price_cents', { ascending: false })
        break
      case 'estoque_critico':
        // Ordem alfabética descendente do enum coincide com a prioridade desejada: out_of_stock > low_stock > in_stock.
        query = query.order('stock_status', { ascending: false })
        break
      case 'sem_foto':
      case 'nome_asc':
      default:
        query = query.order('name', { ascending: true })
        break
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      logError(logger, error, { action: 'getAdminProducts' }, 'Falha ao buscar produtos do admin')
      return resultadoVazio()
    }

    const products: AdminProductListItem[] = (data ?? []).map((p) => {
      const images = (p.product_images ?? []) as { id: number }[]
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        categoryName: (p.categories as { name: string } | null)?.name ?? null,
        productType: p.product_type,
        priceCents: p.price_cents,
        compareAtCents: p.compare_at_cents,
        stockStatus: p.stock_status as StockStatus,
        stockQuantityGrams: p.stock_quantity_grams,
        stockQuantityUnits: p.stock_quantity_units,
        isActive: p.is_active,
        hasPhoto: images.length > 0,
        photoCount: images.length,
        createdAt: p.created_at,
      }
    })

    return { products, total: count ?? 0, page, pageSize }
  } catch (error) {
    logError(logger, error, { action: 'getAdminProducts' }, 'Falha inesperada ao buscar produtos do admin')
    return resultadoVazio()
  }
}

export interface ProductTabCounts {
  todos: number
  semFoto: number
  estoqueBaixo: number
  granel: number
  unit: number
  inativos: number
}

export async function getProductTabCounts(): Promise<ProductTabCounts> {
  const supabase = getSupabaseAdmin()

  const contagemZerada = (): ProductTabCounts => ({
    todos: 0,
    semFoto: 0,
    estoqueBaixo: 0,
    granel: 0,
    unit: 0,
    inativos: 0,
  })

  try {
    const idsComFoto = await getProdutoIdsComFoto(supabase)

    let semFotoQuery = supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_deleted', false)
    if (idsComFoto.length > 0) semFotoQuery = semFotoQuery.not('id', 'in', `(${idsComFoto.join(',')})`)

    const [todos, semFoto, estoqueBaixo, granel, unit, inativos] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
      semFotoQuery,
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .in('stock_status', ['low_stock', 'out_of_stock']),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('product_type', 'granel'),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('product_type', 'unit'),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('is_active', false),
    ])

    const primeiroErro = [todos, semFoto, estoqueBaixo, granel, unit, inativos].find((r) => r.error)?.error
    if (primeiroErro) {
      logError(logger, primeiroErro, { action: 'getProductTabCounts' }, 'Falha ao buscar contagens das tabs de produtos')
      return contagemZerada()
    }

    return {
      todos: todos.count ?? 0,
      semFoto: semFoto.count ?? 0,
      estoqueBaixo: estoqueBaixo.count ?? 0,
      granel: granel.count ?? 0,
      unit: unit.count ?? 0,
      inativos: inativos.count ?? 0,
    }
  } catch (error) {
    logError(logger, error, { action: 'getProductTabCounts' }, 'Falha inesperada ao buscar contagens das tabs de produtos')
    return contagemZerada()
  }
}

export interface CategoriaOption {
  id: number
  name: string
}

export async function getActiveCategories(): Promise<CategoriaOption[]> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    logError(logger, error, { action: 'getActiveCategories' }, 'Falha ao buscar categorias para filtro de produtos')
    return []
  }

  return data ?? []
}
