'use client'

import { useState } from 'react'

import { QuantitySelector } from '@/components/ui/QuantitySelector'
import type { QuantityVariant } from '@/components/ui/QuantitySelector'

interface PdpActionsProps {
  productId: string
  productType: 'granel' | 'unit'
  stockStatus: string
}

const OUT_OF_STOCK_STATUS = 'out_of_stock'

export function PdpActions({
  productId,
  productType,
  stockStatus,
}: PdpActionsProps) {
  const isOutOfStock = stockStatus === OUT_OF_STOCK_STATUS
  const variant: QuantityVariant = productType === 'granel' ? 'granel' : 'unit'
  const [isActive, setIsActive] = useState(false)

  const handleAddToCart = () => {
    // TODO: integrar com CartDrawer via localStorage + CustomEvents (Fase 4)
  }

  if (isOutOfStock) {
    return (
      <div data-product-id={productId} className="w-full">
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
    <div data-product-id={productId} className="w-full">
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
          variant={variant}
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
