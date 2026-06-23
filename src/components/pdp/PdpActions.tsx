'use client'

import { useState } from 'react'

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
  const [isActive, setIsActive] = useState(false)
  const [quantity, setQuantity] = useState(0)

  const priceLabel = isGranel ? 'Preço por 100 gr' : 'Preço por unidade'

  /**
   * SOMENTE EXIBIÇÃO. O total de cobrança real é recalculado no servidor no
   * checkout (Fase 5) — nunca confiar neste valor vindo do cliente.
   */
  function calcDisplayTotal(q: number): number {
    return isGranel
      ? Math.round((product.priceCents * q) / 100)
      : product.priceCents * q
  }

  return (
    <div data-product-id={product.id} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-[9.5px] font-semibold text-t4 uppercase tracking-[0.08em]">
          {product.category}
        </p>
        <h1 className="text-2xl font-bold text-t9 leading-tight">
          {product.name}
        </h1>
        {isLowStock && <Badge variant="low-stock">Últimas unidades</Badge>}
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-normal text-t4">{priceLabel}</p>
        <span className="text-[28px] font-bold text-gdeep tracking-[-0.02em] leading-none">
          {formatBRL(product.priceCents)}
        </span>
        {isGranel && (
          <p className="text-sm text-t7">
            {formatBRL(pricePerKgCents(product.priceCents))}/kg
          </p>
        )}
      </div>

      {isOutOfStock ? (
        <div>
          <p className="text-danger font-semibold text-sm">Produto esgotado</p>
          <button
            type="button"
            disabled
            className="mt-2 h-10 w-full rounded-inner bg-g font-semibold text-white opacity-60 cursor-not-allowed"
          >
            Adicionar ao carrinho
          </button>
        </div>
      ) : !isActive ? (
        <button
          type="button"
          onClick={() => setIsActive(true)}
          className="h-10 w-full rounded-inner bg-g text-sm font-semibold text-white hover:bg-ghover"
        >
          + Adicionar
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <QuantitySelector
            variant={product.productType}
            className="rounded-inner"
            onAddToCart={(q) => addToCart({ ...product, quantity: q })}
            onQuantityChange={(q) => {
              setQuantity(q)
              if (q === 0) setIsActive(false)
            }}
          />
          {quantity > 0 && (
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-t6">Subtotal</span>
              <span className="text-xl font-bold text-gdeep">
                {formatBRL(calcDisplayTotal(quantity))}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
