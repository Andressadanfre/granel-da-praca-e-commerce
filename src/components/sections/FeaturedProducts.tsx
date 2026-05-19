import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { ProductCard } from '@/components/product/ProductCard'
import type { ProductCardProps } from '@/components/product/ProductCard'

// ─── Dados mockados — substituir por query Supabase quando tabelas existirem ──
const FEATURED_PRODUCTS: ProductCardProps[] = [
  {
    id: '1',
    name: 'Castanha de Caju W1 Torrada',
    category: 'Oleaginosas',
    variant: 'granel',
    priceInCents: 1290,
    pricePerKgInCents: 12900,
    packageLabel: 'A granel',
    dietBadges: ['Sem Glúten', 'Vegano'],
    state: 'default',
  },
  {
    id: '2',
    name: 'Óleo de Coco Extra Virgem 500ml',
    category: 'Suplementos',
    variant: 'unit',
    priceInCents: 3490,
    originalPriceInCents: 4200,
    discountPercent: 17,
    packageLabel: '500ml',
    state: 'discount',
  },
  {
    id: '3',
    name: 'Granola Artesanal Tropical Sem Açúcar',
    category: 'Grãos',
    variant: 'granel',
    priceInCents: 890,
    pricePerKgInCents: 8900,
    packageLabel: 'A granel',
    dietBadges: ['Orgânico'],
    state: 'default',
  },
  {
    id: '4',
    name: 'Amêndoas Naturais Premium',
    category: 'Superalimentos',
    variant: 'granel',
    priceInCents: 1990,
    pricePerKgInCents: 19900,
    packageLabel: 'A granel',
    dietBadges: ['Sem Glúten'],
    state: 'default',
  },
]

// ─── Componente — Server Component puro ───────────────────────────────────────
export default function FeaturedProducts() {
  return (
    <section
      className="bg-[#F9F5EF] py-14 lg:py-20"
      aria-label="Produtos em destaque"
    >
      <div className="max-w-[1280px] mx-auto px-5 xl:px-0">

        {/* Header — eyebrow + título + link */}
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

        {/* Grid de ProductCards — 2 colunas mobile · 4 desktop */}
        <div className="featured-products__grid grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          {FEATURED_PRODUCTS.map((product) => (
            <ProductCard key={product.id} {...product} className="w-full max-w-none" />
          ))}
        </div>

        {/* Link "Ver todos" visível apenas mobile */}
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
