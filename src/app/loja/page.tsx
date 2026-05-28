export const dynamic = 'force-dynamic'

import { Suspense } from 'react'

import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import CategoryGrid from '@/components/sections/CategoryGrid'
import ProductGrid from '@/components/sections/ProductGrid'
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton'
import { getSupabaseServer } from '@/lib/supabase/server'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type SearchValue = string | string[] | undefined

interface LojaPageProps {
  searchParams: {
    categoria?: SearchValue
    q?: SearchValue
    pagina?: SearchValue
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function first(v: SearchValue): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

async function fetchCategoryName(slug: string): Promise<string> {
  const supabase = getSupabaseServer()
  const { data } = await supabase
    .from('categories')
    .select('name')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data?.name ?? slug
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LojaPage({ searchParams }: LojaPageProps) {
  const categoria = first(searchParams.categoria)
  const q = first(searchParams.q)?.trim() || undefined
  const paginaStr = first(searchParams.pagina)
  const pagina = Math.max(1, paginaStr ? (Number.parseInt(paginaStr, 10) || 1) : 1)

  const titulo = categoria
    ? await fetchCategoryName(categoria)
    : 'Todos os produtos'

  return (
    <>
      <Navigation />
      <main className="bg-cream min-h-screen">
        <CategoryGrid selectedSlug={categoria} />

        <section className="max-w-[1280px] mx-auto px-5 xl:px-0 pb-14 lg:pb-20">
          <div className="mb-6 pt-10">
            <h1 className="text-2xl font-bold text-gdeep leading-tight">
              {titulo}
            </h1>
            {q && (
              <p className="mt-1 text-sm text-t6">
                Resultados para:{' '}
                <span className="font-semibold text-t9">&ldquo;{q}&rdquo;</span>
              </p>
            )}
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                <ProductCardSkeleton count={24} />
              </div>
            }
          >
            <ProductGrid categoria={categoria} q={q} pagina={pagina} />
          </Suspense>
        </section>
      </main>
      <Footer />
    </>
  )
}
