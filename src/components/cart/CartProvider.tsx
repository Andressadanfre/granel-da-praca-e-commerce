'use client'
import * as React from 'react'
import { AnimatePresence } from 'framer-motion'
import { CartDrawer } from './CartDrawer'

interface CartContextValue {
  openCart: () => void
  closeCart: () => void
}

const CartContext = React.createContext<CartContextValue | null>(null)

export function useCartContext(): CartContextValue {
  const ctx = React.useContext(CartContext)
  if (!ctx) throw new Error('useCartContext deve ser usado dentro de CartProvider')
  return ctx
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)

  const openCart = React.useCallback(() => setIsOpen(true), [])
  const closeCart = React.useCallback(() => setIsOpen(false), [])

  return (
    <CartContext.Provider value={{ openCart, closeCart }}>
      {children}
      <AnimatePresence>
        {isOpen && <CartDrawer isOpen={isOpen} onClose={closeCart} />}
      </AnimatePresence>
    </CartContext.Provider>
  )
}
