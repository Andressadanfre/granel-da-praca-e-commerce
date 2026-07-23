'use client'

import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'

import { prepareReorderAction } from '@/app/conta/actions'
import { useCartContext } from '@/components/cart/CartProvider'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import {
  addToCart,
  clearCart,
  getCartItems,
  type CartItem,
} from '@/lib/cart'
import { cn } from '@/lib/utils'

interface BuyAgainButtonProps {
  orderId: string
  className?: string
}

type FeedbackModal =
  | { kind: 'error'; message: string }
  | { kind: 'conflict'; items: CartItem[] }
  | null

function applyItemsToCart(items: CartItem[], mode: 'replace' | 'merge') {
  if (mode === 'replace') clearCart()
  for (const item of items) {
    addToCart(item)
  }
}

export function BuyAgainButton({ orderId, className }: BuyAgainButtonProps) {
  const { openCart } = useCartContext()
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackModal>(null)

  async function handleClick() {
    setLoading(true)
    const result = await prepareReorderAction({ orderId })
    setLoading(false)

    if (!result.success) {
      setFeedback({ kind: 'error', message: result.error })
      return
    }

    if (getCartItems().length > 0) {
      setFeedback({ kind: 'conflict', items: result.items })
      return
    }

    applyItemsToCart(result.items, 'merge')
    openCart()
  }

  function handleReplace() {
    if (feedback?.kind !== 'conflict') return
    applyItemsToCart(feedback.items, 'replace')
    setFeedback(null)
    openCart()
  }

  function handleMerge() {
    if (feedback?.kind !== 'conflict') return
    applyItemsToCart(feedback.items, 'merge')
    setFeedback(null)
    openCart()
  }

  return (
    <>
      <Button
        variant="cart"
        icon={ShoppingCart}
        isLoading={loading}
        onClick={handleClick}
        className={cn('text-[13px]', className)}
      >
        Comprar novamente
      </Button>

      <Modal
        isOpen={feedback?.kind === 'error'}
        onClose={() => setFeedback(null)}
        title="Não foi possível repetir o pedido"
        size="sm"
      >
        <p className="mb-5 text-sm leading-relaxed text-t6 whitespace-pre-line">
          {feedback?.kind === 'error' ? feedback.message : ''}
        </p>
        <Button variant="cart" className="w-full" onClick={() => setFeedback(null)}>
          Entendi
        </Button>
      </Modal>

      <Modal
        isOpen={feedback?.kind === 'conflict'}
        onClose={() => setFeedback(null)}
        title="Seu carrinho já tem itens"
        size="sm"
      >
        <p className="mb-5 text-sm leading-relaxed text-t6">
          Deseja substituir os itens atuais ou adicionar este pedido aos itens existentes?
        </p>
        <div className="flex flex-col gap-2.5">
          <Button variant="cart" className="w-full" onClick={handleReplace}>
            Substituir itens do carrinho
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleMerge}>
            Adicionar aos itens existentes
          </Button>
        </div>
      </Modal>
    </>
  )
}
