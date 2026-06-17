'use client'

import { QuantitySelector } from '@/components/ui/QuantitySelector'
import { addToCart } from '@/lib/cart'
import type { ProductForCart } from '@/lib/cart/types'

interface AddToCartSelectorProps {
  product: ProductForCart
}

export function AddToCartSelector({ product }: AddToCartSelectorProps) {
  return (
    <div data-product-id={product.id} className="w-full">
      <QuantitySelector
        variant={product.productType}
        onAddToCart={(quantity) => addToCart({ ...product, quantity })}
      />
    </div>
  )
}
