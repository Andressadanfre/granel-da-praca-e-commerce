'use client'

import { useState } from 'react'

import { QuantitySelector } from '@/components/ui/QuantitySelector'
import { addToCart } from '@/lib/cart'
import type { ProductForCart } from '@/lib/cart/types'

interface PdpActionsProps {
  product: ProductForCart
  stockStatus: string
}

const OUT_OF_STOCK_STATUS = 'out_of_stock'

export function PdpActions({
  product,
  stockStatus,
}: PdpActionsProps) {
  const isOutOfStock = stockStatus === OUT_OF_STOCK_STATUS
  const [isActive, setIsActive] = useState(false)

  const handleAddToCart = (quantity: number) => {
    addToCart({ ...product, quantity })
  }

  if (isOutOfStock) {
    return (
      <div data-product-id={product.id} className="w-full">
        <p className="text-danger font-semibold text-sm">Produto esgotado</p>
        <button
          type="button"
          disabled
          className="mt-2 h-10 w-full rounded-inner bg-g font-semibold text-white opacity-60 cursor-not-allowed"
        >
          Adicionar ao carrinho
        </button>
      </div>
    )
  }

  return (
    <div data-product-id={product.id} className="w-full">
      {!isActive ? (
        <button
          type="button"
          onClick={() => setIsActive(true)}
          className="h-10 w-full rounded-inner bg-g text-sm font-semibold text-white hover:bg-ghover"
        >
          + Adicionar
        </button>
      ) : (
        <QuantitySelector
          variant={product.productType}
          className="rounded-inner"
          onAddToCart={handleAddToCart}
          onQuantityChange={(q) => {
            if (q === 0) setIsActive(false)
          }}
        />
      )}
    </div>
  )
}
