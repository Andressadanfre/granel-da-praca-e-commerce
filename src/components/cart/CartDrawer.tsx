'use client'
import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ShoppingCart,
  X,
  Truck,
  Trash2,
  CreditCard,
  ImageOff,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/ToastProvider'
import type { CartItem, ProductType } from '@/lib/cart'
import {
  getCartItems,
  updateQuantity,
  removeFromCart,
  calcItemTotal,
  calcSubtotal,
  calcFrete,
  calcTotal,
  calcFreteProgress,
  calcParcelamento,
  CART_UPDATED_EVENT,
  FRETE_GRATIS_THRESHOLD,
  PARCELA_2X_THRESHOLD,
} from '@/lib/cart'
import { formatBRL, formatGrams } from '@/lib/utils'

export interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const MOBILE_QUERY = '(max-width: 767px)'
const DRAWER_TRANSITION = { duration: 0.25, ease: [0.4, 0, 0.2, 1] } as const

/**
 * EXCEÇÃO DE DESIGN SYSTEM (DS v3.1)
 * O banner de parcelamento usa cores sem token no DS, replicando fielmente o
 * HTML aprovado (html-referencias/mini_cart_final_3.html):
 *   • Estado bloqueado: borda #C7D2FE (fundo/texto usam tokens indigo-bg/indigo)
 *   • Estado desbloqueado: fundo #ECFDF5 · borda #6EE7B7 · texto #065F46
 * Mantidas como classes arbitrárias Tailwind, isoladas a este componente.
 */

// ── Funções puras ────────────────────────────────────────────────────────────

function getBadgeProps(type: ProductType): { variant: BadgeVariant; label: string } | null {
  return type === 'unit'
    ? { variant: 'unit' as BadgeVariant, label: 'Unidade' }
    : null
}

function getItemMeta(item: CartItem): string {
  return item.productType === 'granel'
    ? `${formatBRL(item.priceCents)} / 100gr`
    : `${formatBRL(item.priceCents)} / un.`
}

function getQtyLabel(item: CartItem): string {
  return item.productType === 'granel'
    ? formatGrams(item.quantity)
    : `${item.quantity} un.`
}

function getStep(item: CartItem): number {
  return item.productType === 'granel' ? item.incrementGrams : 1
}

// ── Componente ───────────────────────────────────────────────────────────────

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const drawerRef = React.useRef<HTMLDivElement>(null)
  const previousFocusRef = React.useRef<HTMLElement | null>(null)
  const [items, setItems] = React.useState<CartItem[]>([])
  const [failedImages, setFailedImages] = React.useState<Set<number>>(new Set())
  const [isMobile, setIsMobile] = React.useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_QUERY).matches : false,
  )

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia(MOBILE_QUERY)
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  React.useEffect(() => {
    setItems(getCartItems())
    const refresh = () => setItems(getCartItems())
    window.addEventListener(CART_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(CART_UPDATED_EVENT, refresh)
  }, [isOpen])

  React.useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    previousFocusRef.current = document.activeElement as HTMLElement | null
    drawerRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [isOpen, onClose])

  const { showToast } = useToast()

  const handleRemove = (item: CartItem) => {
    removeFromCart(item.id)
    showToast(`${item.name} removido do carrinho`, 'success')
  }

  const handleDecrease = (item: CartItem) => {
    const next = item.quantity - getStep(item)
    if (next <= 0) {
      handleRemove(item)
      return
    }
    updateQuantity(item.id, next)
  }

  const handleIncrease = (item: CartItem) => {
    updateQuantity(item.id, item.quantity + getStep(item))
  }

  const markImageFailed = (id: number) => {
    setFailedImages((prev) => new Set(prev).add(id))
  }

  const subtotal = calcSubtotal(items)
  const frete = calcFrete(subtotal)
  const total = calcTotal(subtotal)
  const freteProgress = calcFreteProgress(subtotal)
  const freteRemaining = Math.max(FRETE_GRATIS_THRESHOLD - subtotal, 0)
  const freteUnlocked = frete === 0
  const parc = calcParcelamento(subtotal)
  const parcProgress = Math.min((subtotal / PARCELA_2X_THRESHOLD) * 100, 100)

  const drawerMotion = isMobile
    ? { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }
    : { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } }

  return (
    <>
      <motion.div
        key="cart-overlay"
        className="fixed inset-0 z-40 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={DRAWER_TRANSITION}
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        key="cart-drawer"
        ref={drawerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho de compras"
        className="fixed bottom-0 left-0 right-0 z-50 flex h-[85vh] w-full flex-col rounded-t-modal bg-cream shadow-drawer outline-none md:bottom-auto md:left-auto md:right-0 md:top-0 md:h-screen md:w-[420px] md:rounded-none"
        initial={drawerMotion.initial}
        animate={drawerMotion.animate}
        exit={drawerMotion.exit}
        transition={DRAWER_TRANSITION}
      >
        {/* Drag handle — somente mobile */}
        <div
          className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-pill bg-bd md:hidden"
          aria-hidden="true"
        />

        {/* HEADER */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-bd px-6 pb-4 pt-4">
          <div className="flex items-center gap-2 text-[15px] font-bold text-t9">
            <ShoppingCart size={20} strokeWidth={1.6} className="text-gd" aria-hidden="true" />
            Seu Carrinho
            {items.length > 0 && (
              <span className="rounded-pill bg-g px-2.5 py-0.5 text-[10px] font-bold text-white">
                {`${items.length} ${items.length === 1 ? 'produto' : 'produtos'}`}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar carrinho"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-input text-t6 transition-colors hover:bg-surface hover:text-t9"
          >
            <X size={20} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingCart size={56} strokeWidth={1.6} className="text-t4" aria-hidden="true" />
            <p className="text-sm font-semibold text-t6">Seu carrinho está vazio</p>
            <Link
              href="/loja"
              onClick={onClose}
              className="text-sm font-semibold text-g transition-colors hover:text-ghover"
            >
              Ver produtos
            </Link>
          </div>
        ) : (
          <>
            {/* BARRA DE FRETE */}
            <div className="flex-shrink-0 border-b border-bd px-6 pb-3 pt-3.5">
              <p className="mb-2.5 text-[11px] leading-snug text-t6">
                {freteUnlocked ? (
                  <span className="font-bold text-g">🎉 Frete Grátis desbloqueado!</span>
                ) : (
                  <>
                    Adicione mais{' '}
                    <span className="font-bold text-g">{formatBRL(freteRemaining)}</span>{' '}
                    e economize R$15 no frete
                  </>
                )}
              </p>
              <div className="relative h-2">
                <div className="h-2 w-full overflow-hidden rounded-pill bg-bd">
                  <div
                    className="h-full rounded-pill bg-g transition-[width] duration-500 ease-out"
                    style={{ width: `${freteProgress}%` }}
                  />
                </div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 transition-[left] duration-500 ease-out"
                  style={{ left: `calc(${freteProgress}% - 8px)` }}
                >
                  <Truck size={16} strokeWidth={1.6} className="text-gd" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-1.5 flex justify-between text-[9px] font-medium text-t4">
                <span>R$ 0</span>
                <span>R$ 100 — Grátis 🎉</span>
              </div>
            </div>

            {/* LISTA DE ITENS */}
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-6 py-3">
              {items.map((item) => {
                const badge = getBadgeProps(item.productType)
                const showImage = item.imageUrl && !failedImages.has(item.id)
                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2.5 rounded-inner border border-bd bg-surface p-3.5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-inner bg-cream-img">
                        {showImage ? (
                          <Image
                            src={item.imageUrl as string}
                            alt={item.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                            onError={() => markImageFailed(item.id)}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-t4">
                            <ImageOff size={20} strokeWidth={1.6} aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-1.5">
                          <span className="text-[9.5px] font-medium uppercase tracking-wide text-t4">
                            {item.category}
                          </span>
                          {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
                        </div>
                        <p className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-t9">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-t4">{getItemMeta(item)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        aria-label={`Remover ${item.name}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-input text-t4 transition-colors hover:text-danger"
                      >
                        <Trash2 size={16} strokeWidth={1.6} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-10 items-center gap-1 rounded-sel bg-gray-100 px-1">
                        <button
                          type="button"
                          onClick={() => handleDecrease(item)}
                          aria-label="Diminuir quantidade"
                          className="flex h-8 w-8 items-center justify-center rounded-input text-gd transition-colors hover:bg-g-muted"
                        >
                          <Minus size={14} strokeWidth={1.6} aria-hidden="true" />
                        </button>
                        <span className="min-w-[56px] text-center text-xs font-bold text-t9">
                          {getQtyLabel(item)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleIncrease(item)}
                          aria-label="Aumentar quantidade"
                          className="flex h-8 w-8 items-center justify-center rounded-input text-gd transition-colors hover:bg-g-muted"
                        >
                          <Plus size={14} strokeWidth={1.6} aria-hidden="true" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-gdeep">
                        {formatBRL(calcItemTotal(item))}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* FOOTER */}
            <div className="flex-shrink-0 border-t border-bd bg-cream px-6 pb-6 pt-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-t4">Subtotal</span>
                  <span className="text-xs font-medium text-t6">{formatBRL(subtotal)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-gd">
                  <Truck size={14} strokeWidth={1.6} aria-hidden="true" />
                  Entrega rápida em Uberlândia
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-t4">Frete</span>
                  {freteUnlocked ? (
                    <span className="text-xs font-bold text-g">Grátis 🎉</span>
                  ) : (
                    <span className="text-xs font-medium text-t6">{formatBRL(frete)}</span>
                  )}
                </div>
              </div>

              {/* BANNER PARCELAMENTO */}
              {parc.unlocked ? (
                <div className="mt-3 flex items-start gap-2.5 rounded-inner border border-[#6EE7B7] bg-[#ECFDF5] px-3 py-2.5">
                  <CreditCard
                    size={16}
                    strokeWidth={1.6}
                    className="mt-0.5 shrink-0 text-[#065F46]"
                    aria-hidden="true"
                  />
                  <div className="text-[11px] leading-relaxed text-[#065F46]">
                    <strong className="block text-xs font-bold">Parcelamento liberado</strong>
                    Parcelamento em {parc.parcelas}x sem juros disponível!
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex items-start gap-2.5 rounded-inner border border-[#C7D2FE] bg-indigo-bg px-3 py-2.5">
                  <CreditCard
                    size={16}
                    strokeWidth={1.6}
                    className="mt-0.5 shrink-0 text-indigo"
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <strong className="block text-xs font-bold text-indigo">
                      Parcele em 2x sem juros
                    </strong>
                    <span className="text-[11px] leading-relaxed text-indigo">
                      Faltam {formatBRL(parc.faltam)} para parcelar em 2x sem juros no cartão
                    </span>
                    <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-pill bg-[#C7D2FE]">
                      <div
                        className="h-full rounded-pill bg-indigo transition-[width] duration-300 ease-out"
                        style={{ width: `${parcProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-4 mt-3 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-t9">Total</span>
                <span className="text-xl font-bold text-gdeep">{formatBRL(total)}</span>
              </div>

              <Link
                href="/checkout"
                onClick={onClose}
                className="mb-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-sel bg-g font-semibold text-white transition-colors hover:bg-ghover"
              >
                Finalizar Compra
                <ArrowRight size={18} strokeWidth={1.6} aria-hidden="true" />
              </Link>

              <button
                type="button"
                onClick={onClose}
                className="flex w-full items-center justify-center gap-1.5 text-center text-sm text-t4 transition-colors hover:text-t6"
              >
                <ArrowLeft size={14} strokeWidth={1.6} aria-hidden="true" />
                Continuar comprando
              </button>
            </div>
          </>
        )}
      </motion.div>
    </>
  )
}
