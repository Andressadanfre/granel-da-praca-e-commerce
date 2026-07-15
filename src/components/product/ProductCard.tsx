import Link from 'next/link'
import Image from 'next/image'

import { Badge } from '@/components/ui/Badge'
import { AddToCartSelector } from '@/components/product/AddToCartSelector'
import { WishlistButton } from '@/components/product/WishlistButton'
import type { ProductForCart } from '@/lib/cart/types'
import { cn, formatBRL } from '@/lib/utils'

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
  id: number
  name: string
  slug?: string
  categorySlug?: string
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

function getPriceLabel(variant: ProductVariant): string {
  return variant === 'granel' ? 'Preço por 100 gr' : 'Preço por unidade'
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function ProductCard({
  id,
  name,
  slug,
  categorySlug,
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
  const href = slug && categorySlug ? `/loja/${categorySlug}/${slug}` : null
  const isOutOfStock = state === 'out-of-stock'
  const isFeatured   = state === 'featured'
  const isLowStock   = state === 'low-stock'
  const hasDiscount  = !!originalPriceInCents && !!discountPercent

  const productForCart: ProductForCart = {
    id,
    name,
    category,
    productType: variant,
    imageUrl: imageUrl ?? null,
    priceCents: priceInCents,
    incrementGrams: variant === 'granel' ? 100 : 0,
  }

  return (
    <article
      className={cn(
        'product-card relative flex flex-col overflow-hidden cursor-pointer rounded-card bg-white border border-bd shadow-card transition-[transform,box-shadow] duration-[180ms] ease-[cubic-bezier(.4,0,.2,1)] hover:-translate-y-1 hover:shadow-card-hover',
        isFeatured && 'outline outline-2 outline-g',
        isOutOfStock && 'opacity-70',
        className
      )}
    >
      {/* ── Área de imagem ─────────────────────────────────────────── */}
      <div className="product-card__img relative flex-shrink-0 flex items-center justify-center overflow-hidden h-[200px] bg-cream-img rounded-t-card">
        {href ? (
          <Link href={href} className="absolute inset-0 z-0">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={imageAlt ?? name}
                fill
                sizes="(max-width: 768px) 50vw, 302px"
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gdeep opacity-20">
                <Image
                  src="/images/product-placeholder.svg"
                  alt=""
                  width={80}
                  height={80}
                  aria-hidden="true"
                />
              </div>
            )}

            {/* Overlay esgotado */}
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-cream/80 rounded-t-card">
                <span className="font-semibold text-sm text-t6">
                  Produto esgotado
                </span>
              </div>
            )}

            {/* Badges empilhados — constraint Left/Top */}
            <div className="absolute flex flex-col top-3 left-3 gap-[5px]">
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
          </Link>
        ) : (
          <>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={imageAlt ?? name}
                fill
                sizes="(max-width: 768px) 50vw, 302px"
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gdeep opacity-20">
                <Image
                  src="/images/product-placeholder.svg"
                  alt=""
                  width={80}
                  height={80}
                  aria-hidden="true"
                />
              </div>
            )}

            {/* Overlay esgotado */}
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-cream/80 rounded-t-card">
                <span className="font-semibold text-sm text-t6">
                  Produto esgotado
                </span>
              </div>
            )}

            {/* Badges empilhados — constraint Left/Top */}
            <div className="absolute flex flex-col top-3 left-3 gap-[5px]">
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
          </>
        )}

        {/* Wishlist — constraint Right/Top */}
        <WishlistButton id={id} />
      </div>

      {/* ── Card body ──────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 pt-4 pb-5 px-[18px]">
        {href ? (
          <Link href={href} className="flex flex-col flex-1 min-h-0">
            {/* Categoria */}
            <p className="uppercase text-[9.5px] font-semibold text-t4 tracking-[0.08em] mb-1">
              {category}
            </p>

            {/* Nome — reserva exata de 3 linhas */}
            <h3 className="line-clamp-3 text-[13.5px] font-semibold text-t9 leading-[1.4] min-h-[calc(13.5px*1.4*3)]">
              {name}
            </h3>

            {/* Variante/embalagem */}
            <p className="text-[11px] font-medium text-t6 mt-1 min-h-4">
              {packageLabel ?? ''}
            </p>

            {/* Bloco de preço — min-height reserva o caso mais alto */}
            <div className="min-h-[72px] flex flex-col mt-2">
              <p className="text-[10px] font-normal text-t4 mb-0.5">
                {getPriceLabel(variant)}
              </p>

              {/* Preço principal + riscado */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-gdeep tracking-[-0.02em] leading-none">
                  {formatBRL(priceInCents)}
                </span>

                {originalPriceInCents && (
                  <span className="text-xs font-normal text-t5 line-through">
                    {formatBRL(originalPriceInCents)}
                  </span>
                )}
              </div>

              {/* /kg para granel | % desconto para unit */}
              {variant === 'granel' && pricePerKgInCents && (
                <p className="text-[11px] font-normal text-t7 mt-[3px]">
                  {`${formatBRL(pricePerKgInCents)}/kg`}
                </p>
              )}

              {variant === 'unit' && hasDiscount && (
                <p className="text-[11px] font-semibold text-promo mt-[3px]">
                  {discountPercent}% de desconto
                </p>
              )}
            </div>

            {/* Spacer — empurra botão para a base */}
            <div className="flex-1" aria-hidden="true" />
          </Link>
        ) : (
          <>
            {/* Categoria */}
            <p className="uppercase text-[9.5px] font-semibold text-t4 tracking-[0.08em] mb-1">
              {category}
            </p>

            {/* Nome — reserva exata de 3 linhas */}
            <h3 className="line-clamp-3 text-[13.5px] font-semibold text-t9 leading-[1.4] min-h-[calc(13.5px*1.4*3)]">
              {name}
            </h3>

            {/* Variante/embalagem */}
            <p className="text-[11px] font-medium text-t6 mt-1 min-h-4">
              {packageLabel ?? ''}
            </p>

            {/* Bloco de preço — min-height reserva o caso mais alto */}
            <div className="min-h-[72px] flex flex-col mt-2">
              <p className="text-[10px] font-normal text-t4 mb-0.5">
                {getPriceLabel(variant)}
              </p>

              {/* Preço principal + riscado */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-gdeep tracking-[-0.02em] leading-none">
                  {formatBRL(priceInCents)}
                </span>

                {originalPriceInCents && (
                  <span className="text-xs font-normal text-t5 line-through">
                    {formatBRL(originalPriceInCents)}
                  </span>
                )}
              </div>

              {/* /kg para granel | % desconto para unit */}
              {variant === 'granel' && pricePerKgInCents && (
                <p className="text-[11px] font-normal text-t7 mt-[3px]">
                  {`${formatBRL(pricePerKgInCents)}/kg`}
                </p>
              )}

              {variant === 'unit' && hasDiscount && (
                <p className="text-[11px] font-semibold text-promo mt-[3px]">
                  {discountPercent}% de desconto
                </p>
              )}
            </div>

            {/* Spacer — empurra botão para a base */}
            <div className="flex-1" aria-hidden="true" />
          </>
        )}

        {/* QuantitySelector ou estado esgotado */}
        {isOutOfStock ? (
          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center font-semibold h-10 rounded-sel border border-bd bg-surface text-t4 text-[13.5px] cursor-not-allowed font-sans"
          >
            Indisponível
          </button>
        ) : (
          <AddToCartSelector product={productForCart} />
        )}
      </div>
    </article>
  )
}
