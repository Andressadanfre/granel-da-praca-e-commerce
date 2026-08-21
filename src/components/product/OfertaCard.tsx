'use client'

import Link from 'next/link'
import Image from 'next/image'

import { AddToCartSelector } from '@/components/product/AddToCartSelector'
import type { ProductForCart } from '@/lib/cart/types'
import { cn, formatBRL } from '@/lib/utils'

/** Texto do badge de desconto — contraste ~11:1 sobre lime (HTML aprovado) */
const OFERTA_DISC_TEXT = '#1A3A00'

/** Largura média de glifo em em (Poppins 600) — conservador para caber sem overflow */
const OFERTA_NAME_GLYPH_EM = 0.6
const OFERTA_NAME_FONT_MAX_PX = 13
const OFERTA_NAME_FONT_MIN_PX = 9

export interface OfertaCardProps {
  id: number
  slug: string
  categorySlug: string
  name: string
  imageUrl?: string | null
  unit: 'granel' | 'unit'
  /** Preço de exibição em centavos (granel: por 100 gr; unit: preço cheio) */
  priceInCents: number
  /** Preço riscado de exibição em centavos (mesma unidade que priceInCents) */
  compareAtCents: number
  /** Step do QuantitySelector — gravado no item do carrinho */
  incrementGrams: number
  /** Nome da categoria — ProductForCart + aria-label do Link */
  category: string
  className?: string
}

export function OfertaCard({
  id,
  slug,
  categorySlug,
  name,
  imageUrl,
  unit,
  priceInCents,
  compareAtCents,
  incrementGrams,
  category,
  className,
}: OfertaCardProps) {
  const href = `/loja/${categorySlug}/${slug}`
  const isGranel = unit === 'granel'
  const discountPercent = Math.round((1 - priceInCents / compareAtCents) * 100)
  const meta = isGranel ? 'Granel · preço por 100g' : 'Unidade'

  const productForCart: ProductForCart = {
    id,
    name,
    category,
    productType: unit,
    imageUrl: imageUrl ?? null,
    priceCents: priceInCents,
    incrementGrams: isGranel ? incrementGrams : 0,
  }

  return (
    <article
      className={cn(
        'relative z-[1] flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[18px] border border-white/12 bg-white/[0.08] px-5 py-4 backdrop-blur-[12px] transition-[background,border-color,transform,box-shadow] duration-[180ms] hover:-translate-x-1.5 hover:border-white/22 hover:bg-white/[0.14] hover:shadow-[0_8px_28px_rgba(0,0,0,.2)] md:flex-nowrap',
        className
      )}
    >
      <Link
        href={href}
        aria-label={`Ver ${name}, categoria ${category}`}
        className="order-1 flex min-w-0 flex-1 items-center gap-4"
      >
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-white/15 bg-cream-img">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <Image
              src="/images/product-placeholder.svg"
              alt=""
              width={26}
              height={26}
              aria-hidden="true"
              className="opacity-35"
            />
          )}
        </div>

        <div className="min-w-0 flex-1 [container-type:inline-size]">
          <p
            className="mb-0.5 line-clamp-2 whitespace-normal text-[13px] font-semibold leading-[1.3] text-white md:line-clamp-none md:whitespace-nowrap"
            style={{
              fontSize: `min(${OFERTA_NAME_FONT_MAX_PX}px, max(${OFERTA_NAME_FONT_MIN_PX}px, calc(100cqi / (${Math.max(name.length, 1)} * ${OFERTA_NAME_GLYPH_EM}))))`,
            }}
          >
            {name}
          </p>
          <p className="text-[10.5px] text-white/65">{meta}</p>
        </div>
      </Link>

      <div className="order-2 flex w-full min-w-0 items-center gap-3 md:w-auto md:shrink-0 md:flex-col md:items-stretch md:gap-2">
        <div className="shrink-0 text-right">
          <p className="text-[17px] font-extrabold leading-none tracking-[-0.02em] text-white">
            {formatBRL(priceInCents)}
          </p>
          <p className="mt-0.5 text-[10.5px] text-white/55 line-through">
            {formatBRL(compareAtCents)}
          </p>
          {discountPercent > 0 && (
            <span
              className="mt-1 inline-block rounded-pill bg-lime px-2 py-0.5 text-[10px] font-extrabold tracking-[0.02em] shadow-[0_2px_6px_rgba(0,0,0,.2)]"
              style={{ color: OFERTA_DISC_TEXT }}
            >
              {`−${discountPercent}%`}
            </span>
          )}
        </div>
        <div className="min-w-36 flex-1 md:w-40 md:flex-none">
          <AddToCartSelector product={productForCart} showTotal={false} />
        </div>
      </div>
    </article>
  )
}
