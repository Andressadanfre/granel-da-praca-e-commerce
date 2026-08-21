'use client'

import { useEffect, useState } from 'react'

import { QuantitySelector } from '@/components/ui/QuantitySelector'
import {
  getCartItems,
  addToCart,
  updateQuantity,
  removeFromCart,
  CART_UPDATED_EVENT,
} from '@/lib/cart'
import type { ProductForCart } from '@/lib/cart/types'
import { formatBRL } from '@/lib/utils'

interface AddToCartSelectorProps {
  product: ProductForCart
  /** Quando false, omite a linha "Total: R$ X" abaixo do seletor. Default true (ProductCard). */
  showTotal?: boolean
}

function readCartQuantity(id: number): number {
  return getCartItems().find((i) => i.id === id)?.quantity ?? 0
}

export function AddToCartSelector({
  product,
  showTotal = true,
}: AddToCartSelectorProps) {
  const isGranel = product.productType === 'granel'
  const [quantity, setQuantity] = useState(0)

  useEffect(() => {
    setQuantity(readCartQuantity(product.id))

    function sync() {
      setQuantity(readCartQuantity(product.id))
    }
    window.addEventListener(CART_UPDATED_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [product.id])

  /**
   * SOMENTE EXIBIÇÃO. product.priceCents JÁ é o preço por 100gr (convertido
   * na camada de dados via price_cents/10) — por isso o divisor é /100, não
   * /1000. A fórmula price_cents*qty/1000 só vale sobre o price_cents CRU do
   * banco (server-side, Fase 5). Aqui o dado já está convertido. Não trocar.
   * Total de cobrança real é recalculado no servidor no checkout.
   */
  const displayTotalCents = isGranel
    ? Math.round((product.priceCents * quantity) / 100)
    : product.priceCents * quantity

  function handleQuantityChange(next: number) {
    if (next === 0) {
      removeFromCart(product.id)
      return
    }
    const exists = readCartQuantity(product.id) > 0
    if (exists) {
      updateQuantity(product.id, next)
    } else {
      addToCart({ ...product, quantity: next })
    }
  }

  return (
    <div data-product-id={product.id} className="w-full">
      <QuantitySelector
        key={quantity}
        variant={product.productType}
        initialQuantity={quantity}
        onQuantityChange={handleQuantityChange}
      />
      {showTotal && quantity > 0 && (
        <p className="mt-2 text-right text-xs text-t4">
          Total:{' '}
          <strong className="font-bold text-gdeep">
            {formatBRL(displayTotalCents)}
          </strong>
        </p>
      )}
    </div>
  )
}
