import { getSupabaseServer } from '@/lib/supabase/server'
import type { Tables } from '@/types/database'

type ProductRow = Tables<'products'>
type CategoryRow = Tables<'categories'>

export type ProductDetail = Pick<
  ProductRow,
  | 'id'
  | 'name'
  | 'slug'
  | 'description'
  | 'unit'
  | 'product_type'
  | 'price_cents'
  | 'compare_at_cents'
  | 'increment_grams'
  | 'stock_status'
  | 'is_featured'
  | 'image_url'
> & {
  category: Pick<CategoryRow, 'id' | 'name' | 'slug'>
}

export type RelatedProduct = Pick<
  ProductRow,
  | 'id'
  | 'name'
  | 'slug'
  | 'unit'
  | 'product_type'
  | 'price_cents'
  | 'compare_at_cents'
  | 'increment_grams'
  | 'stock_status'
  | 'image_url'
  | 'category_id'
>

export async function getProductDetail(
  categoriaSlug: string,
  produtoSlug: string,
): Promise<ProductDetail | null> {
  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      description,
      unit,
      product_type,
      price_cents,
      compare_at_cents,
      increment_grams,
      stock_status,
      is_featured,
      image_url,
      categories!inner(
        id,
        name,
        slug
      )
    `)
    .eq('is_active', true)
    .eq('is_deleted', false)
    .eq('slug', produtoSlug)
    .maybeSingle()

  if (error || !data || !data.categories) return null
  if (data.categories.slug !== categoriaSlug) return null

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    unit: data.unit,
    product_type: data.product_type,
    price_cents: data.price_cents,
    compare_at_cents: data.compare_at_cents,
    increment_grams: data.increment_grams,
    stock_status: data.stock_status,
    is_featured: data.is_featured,
    image_url: data.image_url,
    category: {
      id: data.categories.id,
      name: data.categories.name,
      slug: data.categories.slug,
    },
  }
}

export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  limit = 8,
): Promise<RelatedProduct[]> {
  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      unit,
      product_type,
      price_cents,
      compare_at_cents,
      increment_grams,
      stock_status,
      image_url,
      category_id
    `)
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .eq('is_deleted', false)
    .neq('id', excludeId)
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data as RelatedProduct[]
}
