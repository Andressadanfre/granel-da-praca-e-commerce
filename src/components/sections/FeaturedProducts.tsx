import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { getSupabaseAdmin } from '@/lib/supabase/server'
import { ProductCard } from '@/components/product/ProductCard'
import type { ProductCardProps } from '@/components/product/ProductCard'

// ─── Tipo interno do retorno da query ────────────────────────────────────────
type ProductRow = {
  id: number
  name: string
  unit: string
  product_type: string
  price_cents: number
  compare_at_cents: number | null
  stock_status: string
  categories: { name: string }[] | null
}

// ─── Mapper banco → ProductCardProps ─────────────────────────────────────────
function toCardProps(p: ProductRow): ProductCardProps {
  const isGranel = p.product_type === 'granel'

  const discountPercent =
    p.compare_at_cents && p.compare_at_cents > p.price_cents
      ? Math.round((1 - p.price_cents / p.compare_at_cents) * 100)
      : undefined

  return {
    id: String(p.id),
    name: p.name,
    category: Array.isArray(p.categories) ? (p.categories[0]?.name ?? '') : '',
    variant: isGranel ? 'granel' : 'unit',
    // granel: card exibe preço por 100 gr → price_cents já está em centavos/kg
    priceInCents: isGranel ? Math.round(p.price_cents / 10) : p.price_cents,
    pricePerKgInCents: isGranel ? p.price_cents : undefined,
    originalPriceInCents: p.compare_at_cents ?? undefined,
    discountPercent,
    packageLabel: isGranel ? 'A granel' : p.unit,
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

// ─── Server Component ─────────────────────────────────────────────────────────
export default async function FeaturedProducts() {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('products')
    .select('id, name, unit, product_type, price_cents, compare_at_cents, stock_status, categories(name)')
    .eq('is_active', true)
    .eq('is_deleted', false)
    .eq('is_featured', true)
    .limit(4)

  // Fallback: se nenhum marcado como featured, pega os 4 mais recentes
  const rows: ProductRow[] =
    !error && data && data.length > 0
      ? (data as unknown as ProductRow[])
      : await supabase
          .from('products')
          .select(
            'id, name, unit, product_type, price_cents, compare_at_cents, stock_status, categories(name)',
          )
          .eq('is_active', true)
          .eq('is_deleted', false)
          .order('id', { ascending: false })
          .limit(4)
          .then(({ data: d }) => (d as unknown as ProductRow[]) ?? [])

  const products = rows.map(toCardProps)

  return (
    <section
      className="bg-[#F9F5EF] py-14 lg:py-20"
      aria-label="Produtos em destaque"
    >
      <div className="max-w-[1280px] mx-auto px-5 xl:px-0">

        {/* Header */}
        <div className="flex items-end justify-between mb-8 lg:mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B207]" aria-hidden="true" />
              <span className="text-[12px] font-semibold text-[#2C742F] uppercase tracking-[.08em]">
                Mais vendidos
              </span>
            </div>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[#002603] leading-tight">
              Produtos em destaque
            </h2>
          </div>

          <Link
            href="/loja"
            className="hidden md:inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#2C742F] hover:text-[#00B207] transition-colors duration-[180ms] whitespace-nowrap"
          >
            Ver todos os produtos
            <ArrowRight size={14} strokeWidth={1.6} />
          </Link>
        </div>

        {/* Grid */}
        <div className="featured-products__grid grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} className="w-full max-w-none" />
          ))}
        </div>

        {/* Link mobile */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href="/loja"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#2C742F] hover:text-[#00B207] transition-colors duration-[180ms]"
          >
            Ver todos os produtos
            <ArrowRight size={14} strokeWidth={1.6} />
          </Link>
        </div>

      </div>
    </section>
  )
}
