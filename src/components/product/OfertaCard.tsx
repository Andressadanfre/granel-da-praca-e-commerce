'use client'

import Link from 'next/link'
import Image from 'next/image'

import { AddToCartSelector } from '@/components/product/AddToCartSelector'
import type { ProductForCart } from '@/lib/cart/types'
import { cn, formatBRL } from '@/lib/utils'

/** Texto do badge de desconto — contraste ~11:1 sobre lime (HTML aprovado) */
const OFERTA_DISC_TEXT = '#1A3A00'

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
        'relative z-[1] flex flex-col gap-3 rounded-[18px] bg-white/[0.07] px-5 py-4 backdrop-blur-[12px] transition-[background,transform,box-shadow] duration-[180ms] hover:-translate-x-1.5 hover:bg-white/[0.14] hover:shadow-[0_8px_28px_rgba(0,0,0,.2)] md:flex-row md:items-center md:gap-4',
        className
      )}
    >
      <Link
        href={href}
        aria-label={`Ver ${name}, categoria ${category}`}
        className="flex min-w-0 flex-1 items-center gap-3 md:gap-4"
      >
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-white/15 bg-cream-img md:h-[52px] md:w-[52px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes="(min-width: 768px) 52px, 44px"
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

        <div className="min-w-0 flex-1">
          <p className="mb-1 line-clamp-2 text-[13px] font-semibold leading-[1.3] text-white">
            {name}
          </p>
          <p className="text-[10.5px] text-white/65">{meta}</p>
        </div>
      </Link>

      <div className="flex w-full min-w-0 items-center gap-3 md:w-auto md:shrink-0">
        <div className="shrink-0">
          <p className="text-[17px] font-extrabold leading-none tracking-[-0.02em] text-white">
            {formatBRL(priceInCents)}
          </p>
          <p className="mt-1 text-[10.5px] text-white/55 line-through">
            {formatBRL(compareAtCents)}
          </p>
        </div>
        {discountPercent > 0 && (
          <span
            className="shrink-0 rounded-pill bg-lime px-2 py-1 text-[10px] font-extrabold tracking-[0.02em] shadow-[0_2px_6px_rgba(0,0,0,.2)]"
            style={{ color: OFERTA_DISC_TEXT }}
          >
            {`−${discountPercent}%`}
          </span>
        )}
        <div className="ml-auto min-w-0 flex-1 md:ml-0 md:w-40 md:flex-none">
          <AddToCartSelector product={productForCart} showTotal={false} />
        </div>
      </div>
    </article>
  )
}
