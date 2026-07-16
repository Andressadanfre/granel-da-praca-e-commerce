'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Plus } from 'lucide-react'

import { addToCart } from '@/lib/cart'
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
  /** Step do QuantitySelector — quantidade padrão no quick-add */
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

  function handleQuickAdd() {
    addToCart({
      id,
      name,
      category,
      productType: unit,
      imageUrl: imageUrl ?? null,
      priceCents: priceInCents,
      incrementGrams: isGranel ? incrementGrams : 0,
      quantity: isGranel ? incrementGrams : 1,
    })
  }

  return (
    <article
      className={cn(
        'relative z-[1] flex items-center gap-4 rounded-[18px] border border-white/12 bg-white/[0.08] px-5 py-4 backdrop-blur-[12px] transition-[background,border-color,transform,box-shadow] duration-[180ms] hover:-translate-x-1.5 hover:border-white/22 hover:bg-white/[0.14] hover:shadow-[0_8px_28px_rgba(0,0,0,.2)]',
        className
      )}
    >
      <Link
        href={href}
        aria-label={`Ver ${name}, categoria ${category}`}
        className="flex min-w-0 flex-1 items-center gap-4"
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

        <div className="min-w-0 flex-1">
          <p className="mb-0.5 truncate text-[13px] font-semibold text-white">
            {name}
          </p>
          <p className="text-[10.5px] text-white/65">{meta}</p>
        </div>
      </Link>

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

      <button
        type="button"
        onClick={handleQuickAdd}
        aria-label={`Adicionar ${name} ao carrinho`}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-white/20 bg-white/10 text-white/80 transition-[background,border-color,transform,color] duration-[180ms] hover:scale-110 hover:border-g hover:bg-g hover:text-white"
      >
        <Plus size={14} strokeWidth={2} aria-hidden="true" />
      </button>
    </article>
  )
}
