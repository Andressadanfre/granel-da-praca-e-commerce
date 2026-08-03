import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { OfertaCard } from '@/components/product/OfertaCard'
import { OfertasCountdown } from '@/components/sections/OfertasCountdown'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Tables } from '@/types/database'

/** Accent do HTML aprovado (pulse + destaque do H2) — sem token no DS ainda */
const OFERTAS_MINT = '#86EFAC'

const OFERTAS_SELECT =
  'id, name, slug, unit, product_type, price_cents, compare_at_cents, increment_grams, image_url, categories(name, slug)' as const

type OfertaRow = Pick<
  Tables<'products'>,
  | 'id'
  | 'name'
  | 'slug'
  | 'unit'
  | 'product_type'
  | 'price_cents'
  | 'compare_at_cents'
  | 'increment_grams'
  | 'image_url'
> & {
  categories: { name: string; slug: string } | null
}

async function loadOfertas(): Promise<OfertaRow[]> {
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

  return (data as OfertaRow[])
    .filter(
      (p) =>
        p.compare_at_cents !== null &&
        p.compare_at_cents > p.price_cents &&
        Boolean(p.categories?.slug)
    )
    .slice(0, 3)
}

export default async function OfertasSection() {
  const rows = await loadOfertas()
  if (rows.length === 0) return null

  return (
    <section className="bg-cream py-14 lg:py-20" aria-label="Ofertas da semana">
      <div className="mx-auto max-w-container px-5 xl:px-0">
        <div className="relative grid min-h-[440px] grid-cols-1 items-end gap-10 overflow-hidden rounded-[20px] bg-gradient-to-br from-[#012504] via-gdeep to-[#001802] px-4 pt-7 md:gap-14 md:rounded-[28px] md:px-9 md:pt-12 lg:grid-cols-2 lg:gap-14 lg:px-[60px] lg:pt-[60px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-[100px] -top-40 h-[560px] w-[560px] rounded-full bg-[radial-gradient(ellipse,rgba(0,178,7,.18)_0%,rgba(0,100,4,.08)_40%,transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 left-[28%] h-[340px] w-[340px] rounded-full bg-[radial-gradient(ellipse,rgba(44,116,47,.14)_0%,transparent_65%)]"
          />

          <div className="relative z-[1] pb-10 md:pb-12 lg:pb-[60px]">
            <div className="mb-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/75">
              <span
                className="h-2 w-2 animate-pulse-oferta rounded-full"
                style={{ backgroundColor: OFERTAS_MINT }}
                aria-hidden="true"
              />
              Apenas esta semana
            </div>

            <h2 className="mb-3.5 text-[clamp(22px,7vw,32px)] font-extrabold leading-[1.08] tracking-[-0.025em] text-white md:text-[clamp(28px,3vw,42px)]">
              Descontos que
              <br />
              fazem{' '}
              <span style={{ color: OFERTAS_MINT }}>diferença</span>
            </h2>

            <p className="mb-9 max-w-[360px] text-[14.5px] leading-[1.65] text-white/75">
              Selecionamos toda semana produtos com preços especiais. Aproveite
              enquanto durar o estoque.
            </p>

            <OfertasCountdown />

            <Link
              href="/ofertas"
              className="inline-flex h-[52px] w-full items-center justify-center gap-2.5 rounded-pill bg-g px-8 text-sm font-bold tracking-[0.03em] text-white shadow-[0_4px_0_rgba(0,100,4,.6),0_6px_20px_rgba(0,178,7,.35)] transition-[background,box-shadow,transform] duration-[180ms] hover:-translate-y-0.5 hover:bg-ghover hover:shadow-[0_6px_0_rgba(0,80,3,.7),0_12px_32px_rgba(0,178,7,.45)] active:translate-y-px md:w-auto"
            >
              Ver todas as ofertas
              <ArrowRight size={14} strokeWidth={1.6} aria-hidden="true" />
            </Link>
          </div>

          <div className="relative z-[1] flex flex-col gap-3 pb-9 md:gap-4 md:pb-12 lg:pb-12">
            {rows.map((p) => {
              const isGranel = p.product_type === 'granel'
              const compareAt = p.compare_at_cents as number

              return (
                <OfertaCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  categorySlug={p.categories!.slug}
                  name={p.name}
                  imageUrl={p.image_url}
                  unit={isGranel ? 'granel' : 'unit'}
                  priceInCents={
                    isGranel ? Math.round(p.price_cents / 10) : p.price_cents
                  }
                  compareAtCents={
                    isGranel ? Math.round(compareAt / 10) : compareAt
                  }
                  incrementGrams={p.increment_grams}
                  category={p.categories!.name}
                />
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
