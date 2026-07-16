export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { Package } from 'lucide-react'

import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/components/product/ProductCard'
import type { ProductCardProps } from '@/components/product/ProductCard'
import { getSupabaseServer } from '@/lib/supabase/server'
import { pickPrimaryImage } from '@/lib/utils'
import type { Tables } from '@/types/database'

export const metadata: Metadata = {
  title: 'Ofertas da semana | Granel da Praça',
  description:
    'Produtos naturais com desconto especial esta semana. Aproveite enquanto durar o estoque.',
  alternates: { canonical: '/ofertas' },
}

const OFERTAS_SELECT =
  'id, name, slug, unit, product_type, price_cents, compare_at_cents, stock_status, product_images(url, is_primary), categories(name, slug)' as const

type OfertaRow = Pick<
  Tables<'products'>,
  | 'id'
  | 'name'
  | 'slug'
  | 'unit'
  | 'product_type'
  | 'price_cents'
  | 'compare_at_cents'
  | 'stock_status'
> & {
  product_images: { url: string; is_primary: boolean }[] | null
  categories: { name: string; slug: string } | null
}

function toCardProps(p: OfertaRow): ProductCardProps {
  const isGranel = p.product_type === 'granel'
  const compareAt = p.compare_at_cents as number
  const discountPercent = Math.round((1 - p.price_cents / compareAt) * 100)

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    categorySlug: p.categories?.slug ?? '',
    category: p.categories?.name ?? '',
    variant: isGranel ? 'granel' : 'unit',
    priceInCents: isGranel ? Math.round(p.price_cents / 10) : p.price_cents,
    pricePerKgInCents: isGranel ? p.price_cents : undefined,
    originalPriceInCents: isGranel ? Math.round(compareAt / 10) : compareAt,
    discountPercent,
    packageLabel: isGranel ? 'A granel' : p.unit,
    imageUrl: pickPrimaryImage(p.product_images) ?? undefined,
    state:
      p.stock_status === 'out_of_stock'
        ? 'out-of-stock'
        : p.stock_status === 'low_stock'
          ? 'low-stock'
          : 'discount',
  }
}

async function loadAllOfertas(): Promise<OfertaRow[]> {
  const supabase = getSupabaseServer()

  // PostgREST: filtro parcial no banco (IS NOT NULL).
  // Comparação coluna×coluna (compare_at_cents > price_cents) fica em memória.
  const { data, error } = await supabase
    .from('products')
    .select(OFERTAS_SELECT)
    .eq('is_active', true)
    .eq('is_deleted', false)
    .not('compare_at_cents', 'is', null)

  if (error || !data) return []

  return (data as OfertaRow[]).filter(
    (p) => p.compare_at_cents !== null && p.compare_at_cents > p.price_cents
  )
}

export default async function OfertasPage() {
  const rows = await loadAllOfertas()
  const products = rows.map(toCardProps)

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-cream">
        <section className="mx-auto max-w-[1280px] px-5 pb-14 pt-10 xl:px-0 lg:pb-20">
          <div className="mb-8">
            <h1 className="text-2xl font-bold leading-tight text-gdeep">
              Ofertas da semana
            </h1>
            <p className="mt-1 text-sm text-t6">
              Descontos especiais selecionados para esta semana.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-icon-bg text-gd">
                <Package size={32} strokeWidth={1.6} aria-hidden="true" />
              </div>
              <p className="text-base font-semibold text-t9">
                Nenhuma oferta ativa no momento
              </p>
              <p className="max-w-xs text-[13px] leading-relaxed text-t6">
                Volte em breve — selecionamos novos descontos toda semana.
              </p>
              <Link
                href="/loja"
                className="mt-2 inline-flex h-10 items-center justify-center rounded-sel bg-g px-6 text-[13px] font-semibold text-white transition-[background-color] duration-[180ms] hover:bg-ghover"
              >
                Explorar produtos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  className="w-full max-w-none"
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
