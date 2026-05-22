// src/components/layout/CartIcon.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

const STORAGE_KEY = 'granel:cart_count'

function readCount(): number {
  try {
    return Math.max(0, parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10))
  } catch {
    return 0
  }
}

export function CartIcon() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(readCount())

    // Cross-tab: storage event só dispara em outras abas
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setCount(Math.max(0, Number(e.newValue ?? 0)))
    }
    // Same-tab: CustomEvent disparado pelo módulo de carrinho
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
    <Link
      href="/carrinho"
      aria-label={`Carrinho com ${count} ${count === 1 ? 'item' : 'itens'}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        height: '44px',
        padding: '0 12px',
        backgroundColor: '#2C742F',
        color: '#ffffff',
        borderRadius: '10px',
        textDecoration: 'none',
        fontSize: '13px',
        fontWeight: 600,
        position: 'relative',
        transition: 'background-color .18s cubic-bezier(.4,0,.2,1)',
        flexShrink: 0,
      }}
    >
      <ShoppingCart size={16} strokeWidth={1.6} />
      <span className="hidden md:inline">Carrinho</span>

      {count > 0 && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            width: '18px',
            height: '18px',
            borderRadius: '9px',
            backgroundColor: '#00B207',
            color: '#ffffff',
            fontSize: '9px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #ffffff',
          }}
        >
          {`${count}`}
        </span>
      )}
    </Link>
  )
}
