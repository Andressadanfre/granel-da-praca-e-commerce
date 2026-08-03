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
  'id, name, slug, product_type, price_cents, compare_at_cents, stock_status, stock_quantity_grams, stock_quantity_units, is_active, created_at, categories(name), image_url'

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

export async function getAdminProducts(params: GetAdminProductsParams = {}): Promise<GetAdminProductsResult> {
  const { search, categoryId, productType, tab = 'todos', sortBy = 'nome_asc', page = 1, pageSize = 20 } = params
  const supabase = getSupabaseAdmin()

  const resultadoVazio = (): GetAdminProductsResult => ({ products: [], total: 0, page, pageSize })

  try {
    let query = supabase.from('products').select(PRODUCTS_SELECT, { count: 'exact' }).eq('is_deleted', false)

    if (categoryId) query = query.eq('category_id', categoryId)
    if (productType) query = query.eq('product_type', productType)

    switch (tab) {
      case 'sem_foto':
        query = query.is('image_url', null)
        break
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

    const products: AdminProductListItem[] = (data ?? []).map((p) => ({
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
      hasPhoto: !!p.image_url,
      photoCount: p.image_url ? 1 : 0,
      createdAt: p.created_at,
    }))

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
    const semFotoQuery = supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .is('image_url', null)

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

export interface AdminProductForEdit {
  id: number
  categoryId: number
  categoryName: string | null
  categorySlug: string | null
  name: string
  slug: string
  description: string | null
  unit: Database['public']['Enums']['product_unit']
  productType: ProductType
  priceCents: number
  compareAtCents: number | null
  isActive: boolean
  isFeatured: boolean
  isDeleted: boolean
  stockStatus: StockStatus
  stockQuantityGrams: number | null
  stockQuantityUnits: number | null
  lowStockThresholdGrams: number
  lowStockThresholdUnits: number
  incrementGrams: number
  imageUrl: string | null
  nutritionalTableImageUrl: string | null
  updatedAt: string
}

const PRODUCT_EDIT_SELECT =
  'id, category_id, name, slug, description, unit, product_type, price_cents, compare_at_cents, is_active, is_featured, is_deleted, stock_status, stock_quantity_grams, stock_quantity_units, low_stock_threshold_grams, low_stock_threshold_units, increment_grams, image_url, nutritional_table_image_url, updated_at, categories(name, slug)'

/**
 * Produto completo para a tela de edição. Retorna null se não existir ou estiver soft-deleted
 * (is_deleted=true) — a página chama notFound() nesses casos.
 */
export async function getAdminProductForEdit(id: number): Promise<AdminProductForEdit | null> {
  const supabase = getSupabaseAdmin()

  try {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_EDIT_SELECT)
      .eq('id', id)
      .eq('is_deleted', false)
      .maybeSingle()

    if (error) {
      logError(logger, error, { action: 'getAdminProductForEdit', productId: id }, 'Falha ao buscar produto para edição')
      return null
    }

    if (!data) return null

    const category = data.categories as { name: string; slug: string } | null

    return {
      id: data.id,
      categoryId: data.category_id,
      categoryName: category?.name ?? null,
      categorySlug: category?.slug ?? null,
      name: data.name,
      slug: data.slug,
      description: data.description,
      unit: data.unit,
      productType: data.product_type,
      priceCents: data.price_cents,
      compareAtCents: data.compare_at_cents,
      isActive: data.is_active,
      isFeatured: data.is_featured,
      isDeleted: data.is_deleted,
      stockStatus: data.stock_status as StockStatus,
      stockQuantityGrams: data.stock_quantity_grams,
      stockQuantityUnits: data.stock_quantity_units,
      lowStockThresholdGrams: data.low_stock_threshold_grams,
      lowStockThresholdUnits: data.low_stock_threshold_units,
      incrementGrams: data.increment_grams,
      imageUrl: data.image_url,
      nutritionalTableImageUrl: data.nutritional_table_image_url,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    logError(logger, error, { action: 'getAdminProductForEdit', productId: id }, 'Falha inesperada ao buscar produto para edição')
    return null
  }
}
