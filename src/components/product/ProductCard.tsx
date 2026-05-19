import Image from 'next/image'

import { Badge } from '@/components/ui/Badge'
import { AddToCartSelector } from '@/components/product/AddToCartSelector'
import { WishlistButton } from '@/components/product/WishlistButton'
import { tokens } from '@/lib/tokens'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductVariant = 'granel' | 'unit'

export type ProductState =
  | 'default'
  | 'out-of-stock'
  | 'low-stock'
  | 'featured'
  | 'discount'

export type DietBadge =
  | 'Sem Glúten'
  | 'Vegano'
  | 'Orgânico'
  | 'Sem Lactose'
  | 'Integral'

export interface ProductCardProps {
  id: string
  name: string
  category: string
  variant: ProductVariant
  /** Preço principal em centavos */
  priceInCents: number
  /** Preço original em centavos — só informar se houver desconto ativo */
  originalPriceInCents?: number
  /** Preço por kg em centavos — exclusivo para variant granel */
  pricePerKgInCents?: number
  /** Ex: "500ml", "250gr", "Pote 1kg" */
  packageLabel?: string
  imageUrl?: string
  imageAlt?: string
  dietBadges?: DietBadge[]
  state?: ProductState
  /** Percentual já calculado ex: 17 → exibe "17% de desconto" */
  discountPercent?: number
  className?: string
}

// ─── Helpers puros ────────────────────────────────────────────────────────────

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatPerKg(cents: number): string {
  return `${(cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })}/kg`
}

function getPriceLabel(variant: ProductVariant): string {
  return variant === 'granel' ? 'Preço por 100 gr' : 'Preço por unidade'
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function ProductCard({
  id,
  name,
  category,
  variant,
  priceInCents,
  originalPriceInCents,
  pricePerKgInCents,
  packageLabel,
  imageUrl,
  imageAlt,
  dietBadges = [],
  state = 'default',
  discountPercent,
  className,
}: ProductCardProps) {
  const isOutOfStock = state === 'out-of-stock'
  const isFeatured   = state === 'featured'
  const isLowStock   = state === 'low-stock'
  const hasDiscount  = !!originalPriceInCents && !!discountPercent

  return (
    <article
      className={cn('product-card relative flex flex-col overflow-hidden cursor-pointer', className)}
      style={{
        width:        '302px',
        borderRadius: tokens.radius.card,
        background:   tokens.colors.cream,
        border:       `1px solid ${tokens.colors.bd}`,
        boxShadow:    tokens.shadow.card,
        outline:      isFeatured ? `2px solid ${tokens.colors.g}` : undefined,
        opacity:      isOutOfStock ? 0.7 : 1,
      }}
    >
      {/* ── Área de imagem ─────────────────────────────────────────── */}
      <div
        className="product-card__img relative flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{
          height:       '200px',
          background:   tokens.colors.creamImg,
          borderRadius: '20px 20px 0 0',
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? name}
            fill
            sizes="302px"
            className="object-cover"
          />
        ) : (
          <svg
            width="72"
            height="72"
            viewBox="0 0 88 88"
            fill="none"
            aria-hidden="true"
            style={{ opacity: 0.18 }}
          >
            <rect x="8" y="28" width="72" height="52" rx="6" fill={tokens.colors.gdeep} />
            <ellipse cx="44" cy="28" rx="20" ry="8" fill={tokens.colors.gdeep} />
            <circle cx="44" cy="22" r="5" fill={tokens.colors.gdeep} />
          </svg>
        )}

        {/* Overlay esgotado */}
        {isOutOfStock && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background:   'rgba(249,245,239,0.80)',
              borderRadius: '20px 20px 0 0',
            }}
          >
            <span
              className="font-semibold text-sm"
              style={{ color: tokens.colors.t6 }}
            >
              Produto esgotado
            </span>
          </div>
        )}

        {/* Badges empilhados — constraint Left/Top */}
        <div
          className="absolute flex flex-col"
          style={{ top: '12px', left: '12px', gap: '5px' }}
        >
          {dietBadges.map((label) => (
            <Badge key={label} variant="diet">{label}</Badge>
          ))}
          {variant === 'unit' && (
            <Badge variant="unit">Por unidade</Badge>
          )}
          {isLowStock && (
            <Badge variant="low-stock">Últimas unidades</Badge>
          )}
          {/* Badge de desconto empilhado junto com os demais */}
          {hasDiscount && (
            <Badge variant="promo">{`${discountPercent}% OFF`}</Badge>
          )}
        </div>

        {/* Wishlist — constraint Right/Top */}
        <WishlistButton id={id} />
      </div>

      {/* ── Card body ──────────────────────────────────────────────── */}
      <div
        className="flex flex-col flex-1"
        style={{ padding: '16px 18px 20px' }}
      >
        {/* Categoria */}
        <p
          className="uppercase"
          style={{
            fontSize:      '9.5px',
            fontWeight:    600,
            color:         tokens.colors.t4,
            letterSpacing: '0.08em',
            marginBottom:  '4px',
          }}
        >
          {category}
        </p>

        {/* Nome — reserva exata de 3 linhas */}
        <h3
          className="line-clamp-3"
          style={{
            fontSize:   '13.5px',
            fontWeight: 600,
            color:      tokens.colors.t9,
            lineHeight: 1.4,
            minHeight:  'calc(13.5px * 1.4 * 3)',
          }}
        >
          {name}
        </h3>

        {/* Variante/embalagem */}
        <p
          style={{
            fontSize:   '11px',
            fontWeight: 500,
            color:      tokens.colors.t6,
            marginTop:  '4px',
            minHeight:  '16px',
          }}
        >
          {packageLabel ?? ''}
        </p>

        {/* Bloco de preço — min-height reserva o caso mais alto */}
        <div
          style={{
            minHeight:     '72px',
            display:       'flex',
            flexDirection: 'column',
            marginTop:     '8px',
          }}
        >
          <p
            style={{
              fontSize:     '10px',
              fontWeight:   400,
              color:        tokens.colors.t4,
              marginBottom: '2px',
            }}
          >
            {getPriceLabel(variant)}
          </p>

          {/* Preço principal + riscado */}
          <div className="flex items-baseline" style={{ gap: '6px' }}>
            <span
              style={{
                fontSize:      '20px',
                fontWeight:    700,
                color:         tokens.colors.gdeep,
                letterSpacing: '-0.02em',
                lineHeight:    1,
              }}
            >
              {formatBRL(priceInCents)}
            </span>

            {originalPriceInCents && (
              <span
                style={{
                  fontSize:       '12px',
                  fontWeight:     400,
                  color:          '#6B7280',
                  textDecoration: 'line-through',
                }}
              >
                {formatBRL(originalPriceInCents)}
              </span>
            )}
          </div>

          {/* /kg para granel | % desconto para unit */}
          {variant === 'granel' && pricePerKgInCents && (
            <p
              style={{
                fontSize:   '11px',
                fontWeight: 400,
                color:      '#374151',
                marginTop:  '3px',
              }}
            >
              {formatPerKg(pricePerKgInCents)}
            </p>
          )}

          {variant === 'unit' && hasDiscount && (
            <p
              style={{
                fontSize:   '11px',
                fontWeight: 600,
                color:      tokens.colors.promo,
                marginTop:  '3px',
              }}
            >
              {discountPercent}% de desconto
            </p>
          )}
        </div>

        {/* Spacer — empurra botão para a base */}
        <div style={{ flex: 1 }} aria-hidden="true" />

        {/* QuantitySelector ou estado esgotado */}
        {isOutOfStock ? (
          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center font-semibold"
            style={{
              height:       '40px',
              borderRadius: tokens.radius.sel,
              border:       `1px solid ${tokens.colors.bd}`,
              background:   tokens.colors.surface,
              color:        tokens.colors.t4,
              fontSize:     '13.5px',
              cursor:       'not-allowed',
              fontFamily:   'var(--font-poppins), sans-serif',
            }}
          >
            Indisponível
          </button>
        ) : (
          <AddToCartSelector id={id} variant={variant} />
        )}
      </div>
    </article>
  )
}
