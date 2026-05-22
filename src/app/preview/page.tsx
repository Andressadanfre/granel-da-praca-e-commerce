import { notFound } from 'next/navigation'
import { Mail, Search } from 'lucide-react'

import { Footer } from '@/components/layout/Footer'
import { Navigation } from '@/components/layout/Navigation'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Button, type ButtonVariant } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { QuantitySelector } from '@/components/ui/QuantitySelector'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton'
import { EmptyState } from '@/components/product/EmptyState'
import { HeroBanner } from '@/components/sections/HeroBanner'

const buttonVariants: ButtonVariant[] = [
  'primary',
  'cart',
  'secondary',
  'ghost',
  'danger',
]

const badgeVariants: { variant: BadgeVariant; label: string }[] = [
  { variant: 'diet',      label: 'Sem glúten' },
  { variant: 'promo',     label: 'Promoção' },
  { variant: 'unit',      label: 'Por unidade' },
  { variant: 'discount',  label: '-15%' },
  { variant: 'low-stock', label: 'Últimas unidades' },
  { variant: 'featured',  label: 'Destaque' },
]

export default function PreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <>
      <Navigation />
      <HeroBanner />
      <main
      className="min-h-screen bg-cream"
      style={{ padding: '40px' }}
    >
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '32px' }}>
        Preview — componentes UI
      </h1>

      {/* ── Button ─────────────────────────────────────────────────── */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          Button
        </h2>
        {(['md', 'lg'] as const).map((size) => (
          <div key={size} style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '14px', marginBottom: '12px' }}>size: {size}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {buttonVariants.map((variant) => (
                <Button key={`${variant}-${size}`} variant={variant} size={size}>
                  {variant}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── Badge ──────────────────────────────────────────────────── */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          Badge
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {badgeVariants.map(({ variant, label }) => (
            <Badge key={variant} variant={variant}>
              {label}
            </Badge>
          ))}
        </div>
      </section>

      {/* ── Input ──────────────────────────────────────────────────── */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          Input
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
          <Input label="E-mail" name="email" type="email" />
          <Input label="Nome" iconLeft={Mail} name="name" />
          <Input label="Buscar" iconRight={Search} name="search" />
          <Input
            label="Senha"
            name="password"
            type="password"
            error="Senha deve ter no mínimo 8 caracteres"
          />
        </div>
      </section>

      {/* ── QuantitySelector ───────────────────────────────────────── */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          QuantitySelector
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <p style={{ fontSize: '14px', marginBottom: '12px' }}>variant: granel (default)</p>
            <div className="max-w-[302px]">
              <QuantitySelector />
            </div>
          </div>
          <div>
            <p style={{ fontSize: '14px', marginBottom: '12px' }}>variant: unit</p>
            <div className="max-w-[302px]">
              <QuantitySelector variant="unit" />
            </div>
          </div>
        </div>
      </section>

      {/* ── ProductCard ────────────────────────────────────────────── */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          ProductCard
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>

          <div>
            <p style={{ fontSize: '12px', marginBottom: '12px', color: '#9CA3AF' }}>granel — default</p>
            <ProductCard
              id="prev-1"
              name="Castanha de Caju W1 Torrada e Salgada"
              category="Oleaginosas"
              variant="granel"
              priceInCents={1290}
              pricePerKgInCents={12900}
              dietBadges={['Sem Glúten', 'Vegano']}
              state="default"
            />
          </div>

          <div>
            <p style={{ fontSize: '12px', marginBottom: '12px', color: '#9CA3AF' }}>unit — discount</p>
            <ProductCard
              id="prev-2"
              name="Óleo de Coco Extra Virgem"
              category="Suplementos"
              variant="unit"
              priceInCents={3490}
              originalPriceInCents={4200}
              discountPercent={17}
              packageLabel="500ml"
              state="discount"
            />
          </div>

          <div>
            <p style={{ fontSize: '12px', marginBottom: '12px', color: '#9CA3AF' }}>granel — low-stock</p>
            <ProductCard
              id="prev-3"
              name="Amêndoas Cruas Importadas Premium"
              category="Oleaginosas"
              variant="granel"
              priceInCents={2890}
              pricePerKgInCents={28900}
              state="low-stock"
            />
          </div>

          <div>
            <p style={{ fontSize: '12px', marginBottom: '12px', color: '#9CA3AF' }}>unit — out-of-stock</p>
            <ProductCard
              id="prev-4"
              name="Proteína de Ervilha Baunilha"
              category="Suplementos"
              variant="unit"
              priceInCents={8990}
              packageLabel="Pote 500g"
              state="out-of-stock"
            />
          </div>

          <div>
            <p style={{ fontSize: '12px', marginBottom: '12px', color: '#9CA3AF' }}>granel — featured</p>
            <ProductCard
              id="prev-5"
              name="Quinoa Real Boliviana"
              category="Grãos e Cereais"
              variant="granel"
              priceInCents={890}
              pricePerKgInCents={8900}
              state="featured"
            />
          </div>

        </div>
      </section>

      {/* ── ProductCardSkeleton ────────────────────────────────────── */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          ProductCardSkeleton
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 302px)', gap: '24px' }}>
          <ProductCardSkeleton count={4} />
        </div>
      </section>

      {/* ── EmptyState ── */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          EmptyState
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          {/* href="#" previne navegação real — só para preview */}
          <EmptyState context="filter"   ctaHref="#" />
          <EmptyState context="search"   searchTerm="castanha orgânica" ctaHref="#" />
          <EmptyState context="cart"     ctaHref="#" />
          <EmptyState context="wishlist" ctaHref="#" />
          <EmptyState context="orders"   ctaHref="#" />
        </div>
      </section>

      </main>
    <Footer />
    </>
  )
}
