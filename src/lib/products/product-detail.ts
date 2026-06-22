import { getSupabaseServer } from '@/lib/supabase/server'
import type { Tables } from '@/types/database'
import { pickPrimaryImage } from '@/lib/utils'

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
> & {
  product_images: { url: string; is_primary: boolean }[] | null
  imageUrl: string | null
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
> & {
  product_images: { url: string; is_primary: boolean }[] | null
  imageUrl: string | null
  category: { name: string; slug: string }
}

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
      product_images(url, is_primary),
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

  const rawImages = data.product_images as unknown
  const productImages: { url: string; is_primary: boolean }[] | null =
    Array.isArray(rawImages) ? (rawImages as { url: string; is_primary: boolean }[]) : null

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
    product_images: productImages,
    imageUrl: pickPrimaryImage(productImages),
    category: {
      id: data.categories.id,
      name: data.categories.name,
      slug: data.categories.slug,
    },
  }
}

export async function getRelatedProducts(
  categoryId: number,
  excludeId: number,
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
      product_images(url, is_primary),
      categories!inner(
        name,
        slug
      )
    `)
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .eq('is_deleted', false)
    .neq('id', excludeId)
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data.map((item) => {
    const rawImages = item.product_images as unknown
    const productImages: { url: string; is_primary: boolean }[] | null =
      Array.isArray(rawImages) ? (rawImages as { url: string; is_primary: boolean }[]) : null

    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      unit: item.unit,
      product_type: item.product_type,
      price_cents: item.price_cents,
      compare_at_cents: item.compare_at_cents,
      increment_grams: item.increment_grams,
      stock_status: item.stock_status,
      product_images: productImages,
      imageUrl: pickPrimaryImage(productImages),
      category: {
        name: item.categories.name,
        slug: item.categories.slug,
      },
    }
  })
}
