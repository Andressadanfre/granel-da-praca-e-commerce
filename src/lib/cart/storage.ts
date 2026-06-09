'use client'
import type { CartItem } from './types'
import { CART_STORAGE_KEY, CART_COUNT_KEY, CART_UPDATED_EVENT } from './constants'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function getCartItems(): CartItem[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]): void {
  if (!isBrowser()) return
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  const count = items.reduce((acc, item) => {
    if (item.productType === 'granel') return acc + 1
    return acc + item.quantity
  }, 0)
  localStorage.setItem(CART_COUNT_KEY, String(count))
  window.dispatchEvent(
    new CustomEvent(CART_UPDATED_EVENT, { detail: count })
  )
}

export function addToCart(item: CartItem): void {
  const items = getCartItems()
  const existing = items.find((i) => i.id === item.id)
  if (existing) {
    existing.quantity += item.quantity
    saveCart(items)
    return
  }
  saveCart([...items, item])
}

export function updateQuantity(id: string, quantity: number): void {
  const items = getCartItems()
  const updated = items.map((i) =>
    i.id === id ? { ...i, quantity } : i
  )
  saveCart(updated.filter((i) => i.quantity > 0))
}

export function removeFromCart(id: string): void {
  const items = getCartItems()
  saveCart(items.filter((i) => i.id !== id))
}

export function clearCart(): void {
  saveCart([])
}
