'use client'

import { QuantitySelector } from '@/components/ui/QuantitySelector'
import type { QuantityVariant } from '@/components/ui/QuantitySelector'

interface AddToCartSelectorProps {
  id: string
  variant: QuantityVariant
}

export function AddToCartSelector({ id, variant }: AddToCartSelectorProps) {
  return (
    <div data-product-id={id} className="w-full">
      <QuantitySelector variant={variant} />
    </div>
  )
}
