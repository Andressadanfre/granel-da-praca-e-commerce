'use client'

import { useState } from 'react'
import { Heart, Share2, ShoppingCart, Truck, ShieldCheck, Leaf } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { QuantitySelector } from '@/components/ui/QuantitySelector'
import { addToCart } from '@/lib/cart'
import type { ProductForCart } from '@/lib/cart/types'
import { formatBRL } from '@/lib/utils'

interface PdpActionsProps {
  product: ProductForCart
  stockStatus: string
}

const OUT_OF_STOCK_STATUS = 'out_of_stock'
const LOW_STOCK_STATUS = 'low_stock'

/** Preço por kg derivado do preço por 100gr (só granel). priceCents já chega como price_cents/10. */
function pricePerKgCents(priceCents: number): number {
  return priceCents * 10
}

export function PdpActions({ product, stockStatus }: PdpActionsProps) {
  const isOutOfStock = stockStatus === OUT_OF_STOCK_STATUS
  const isLowStock = stockStatus === LOW_STOCK_STATUS
  const isGranel = product.productType === 'granel'
  const increment = isGranel ? 100 : 1

  const [quantity, setQuantity] = useState(increment)
  const [isFavorited, setIsFavorited] = useState(false)
  const [added, setAdded] = useState(false)

  /**
   * SOMENTE EXIBIÇÃO. O total de cobrança real é recalculado no servidor no
   * checkout (Fase 5) — nunca confiar neste valor vindo do cliente.
   */
  const displayTotalCents = isGranel
    ? Math.round((product.priceCents * quantity) / 100)
    : product.priceCents * quantity

  function handleAddToCart() {
    addToCart({ ...product, quantity })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div data-product-id={product.id} className="flex flex-col">
      <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-t4">
        {product.category}
      </p>
      <h1 className="mt-1 text-[26px] font-bold leading-tight text-t9">
        {product.name}
      </h1>

      <hr className="my-5 border-bd" />

      <p className="text-[11px] text-t4">
        {isGranel ? 'Preço por 100 gr' : 'Preço por unidade'}
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-4xl font-bold leading-none tracking-[-0.03em] text-gdeep">
          {formatBRL(product.priceCents)}
        </span>
        {isGranel && (
          <span className="text-[13px] font-medium text-t6">/ 100 gr</span>
        )}
      </div>
      {isGranel && (
        <p className="mt-1 text-[11px] text-t4">
          {formatBRL(pricePerKgCents(product.priceCents))}/kg
        </p>
      )}

      {isLowStock && (
        <Badge variant="low-stock" className="mt-3 self-start">
          Últimas unidades
        </Badge>
      )}

      {isOutOfStock ? (
        <p className="mt-6 text-sm font-semibold text-danger">
          Produto esgotado
        </p>
      ) : (
        <>
          <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.05em] text-t6">
            Quantidade
          </p>
          <QuantitySelector
            variant={product.productType}
            appearance="split"
            initialQuantity={increment}
            onQuantityChange={setQuantity}
          />

          <p className="mb-4 mt-2 text-right text-xs text-t4">
            Total:{' '}
            <strong className="font-semibold text-t9">
              {formatBRL(displayTotalCents)}
            </strong>
          </p>

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex h-[52px] w-full items-center justify-center gap-[10px] rounded-inner bg-g text-[15px] font-bold tracking-[0.02em] text-white transition-colors hover:bg-ghover active:bg-gdeep"
          >
            <ShoppingCart size={18} strokeWidth={1.6} aria-hidden />
            {added ? 'Adicionado!' : 'Adicionar ao Carrinho'}
          </button>

          <div className="mt-3 flex gap-[10px]">
            <button
              type="button"
              onClick={() => setIsFavorited((v) => !v)}
              aria-pressed={isFavorited}
              className="flex h-11 flex-1 items-center justify-center gap-[7px] rounded-input border-[1.5px] border-bd bg-white text-[13px] font-medium text-t6 transition-colors hover:border-gd hover:text-gd"
            >
              <Heart
                size={16}
                strokeWidth={1.6}
                fill={isFavorited ? 'currentColor' : 'none'}
                className={isFavorited ? 'text-promo' : undefined}
                aria-hidden
              />
              <span className={isFavorited ? 'text-promo' : undefined}>
                Favoritar
              </span>
            </button>
            <button
              type="button"
              className="flex h-11 flex-1 items-center justify-center gap-[7px] rounded-input border-[1.5px] border-bd bg-white text-[13px] font-medium text-t6 transition-colors hover:border-gd hover:text-gd"
            >
              <Share2 size={16} strokeWidth={1.6} aria-hidden />
              Compartilhar
            </button>
          </div>

          <div className="mt-5 flex overflow-hidden rounded-input border border-bd bg-white">
            <div className="flex flex-1 items-center gap-2 border-r border-bd px-3 py-2">
              <Truck size={16} strokeWidth={1.6} className="text-gd" aria-hidden />
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] font-semibold text-t9">Entrega em Uberlândia</span>
                <span className="text-[10px] text-t4">seg–sex e sábado</span>
              </span>
            </div>
            <div className="flex flex-1 items-center gap-2 border-r border-bd px-3 py-2">
              <ShieldCheck size={16} strokeWidth={1.6} className="text-gd" aria-hidden />
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] font-semibold text-t9">Frete grátis</span>
                <span className="text-[10px] text-t4">acima de R$ 100</span>
              </span>
            </div>
            <div className="flex flex-1 items-center gap-2 px-3 py-2">
              <Leaf size={16} strokeWidth={1.6} className="text-gd" aria-hidden />
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] font-semibold text-t9">100% natural</span>
                <span className="text-[10px] text-t4">sem aditivos</span>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
