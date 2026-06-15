'use client'
import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCartContext } from '@/components/cart/CartProvider'

const STORAGE_KEY = 'granel:cart_count'

function readCount(): number {
  try {
    return Math.max(0, parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10))
  } catch {
    return 0
  }
}

export function CartIcon() {
  const { openCart } = useCartContext()
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(readCount())

    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setCount(Math.max(0, Number(e.newValue ?? 0)))
    }
    function onCartUpdate(e: Event) {
      setCount((e as CustomEvent<number>).detail)
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('cart:updated', onCartUpdate)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('cart:updated', onCartUpdate)
    }
  }, [])

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Carrinho com ${count} ${count === 1 ? 'item' : 'itens'}`}
      className="relative flex h-11 shrink-0 items-center gap-2 rounded-sel bg-gd px-3 text-[13px] font-semibold text-white transition-colors duration-[180ms] ease-[cubic-bezier(.4,0,.2,1)] hover:bg-ghover"
    >
      <ShoppingCart size={16} strokeWidth={1.6} aria-hidden="true" />
      <span className="hidden md:inline">Carrinho</span>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-1.5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white bg-g text-[9px] font-bold text-white"
        >
          {`${count}`}
        </span>
      )}
    </button>
  )
}
