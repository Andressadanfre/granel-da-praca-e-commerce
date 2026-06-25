import type { MetadataRoute } from 'next'
import { getSupabaseServer } from '@/lib/supabase/server'

export const revalidate = 3600

const BASE_URL = 'https://graneldapraca.com.br'

const staticRoutes: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/`, lastModified: new Date(), priority: 1.0 },
  { url: `${BASE_URL}/loja`, lastModified: new Date(), priority: 0.9 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = getSupabaseServer()

    const [categoriesResult, productsResult] = await Promise.all([
      supabase
        .from('categories')
        .select('slug')
        .eq('is_active', true),
      supabase
        .from('products')
        .select('slug, categories!inner(slug)')
        .eq('is_active', true)
        .eq('is_deleted', false),
    ])

    const categoryRoutes: MetadataRoute.Sitemap = (categoriesResult.data ?? []).map((cat) => ({
      url: `${BASE_URL}/loja/${cat.slug}`,
      lastModified: new Date(),
      priority: 0.8,
    }))

    const productRoutes: MetadataRoute.Sitemap = (productsResult.data ?? []).flatMap((product) => {
      const cat = product.categories as { slug: string } | null
      if (!cat?.slug) return []
      return [
        {
          url: `${BASE_URL}/loja/${cat.slug}/${product.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        },
      ]
    })

    return [...staticRoutes, ...categoryRoutes, ...productRoutes]
  } catch {
    return staticRoutes
  }
}
