'use client'

import { QuantitySelector } from '@/components/ui/QuantitySelector'
import type { QuantityVariant } from '@/components/ui/QuantitySelector'

interface AddToCartSelectorProps {
  id: string
  variant: QuantityVariant
}

export function AddToCartSelector({ id, variant }: AddToCartSelectorProps) {
  function handleAddToCart(quantity: number) {
    // TODO: despachar para o store do carrinho (Zustand) quando implementado
    void id
    void quantity
  }

  function handleQuantityChange(quantity: number) {
    // TODO: sincronizar com o store do carrinho (Zustand) quando implementado
    void quantity
  }

  return (
    <QuantitySelector
      variant={variant}
      onAddToCart={handleAddToCart}
      onQuantityChange={handleQuantityChange}
    />
  )
}
