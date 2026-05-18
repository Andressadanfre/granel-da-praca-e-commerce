'use client'

import * as React from 'react'
import { Minus, Plus } from 'lucide-react'

import { tokens } from '@/lib/tokens'
import { cn } from '@/lib/utils'

export type QuantityVariant = 'granel' | 'unit'

export interface QuantitySelectorProps {
  variant?: QuantityVariant
  onQuantityChange?: (quantity: number) => void
  onAddToCart?: (quantity: number) => void
  initialQuantity?: number
  className?: string
}

function getIncrement(variant: QuantityVariant): number {
  return variant === 'granel' ? 100 : 1
}

function formatQuantity(qty: number, variant: QuantityVariant): string {
  if (variant === 'unit') {
    return `${qty} un.`
  }

  if (qty < 1000) {
    return `${qty} gr`
  }

  const kg = qty / 1000
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(kg)

  return `${formatted} kg`
}

const transitionStyle: React.CSSProperties = {
  transition: `background-color ${tokens.ease}`,
}

export const QuantitySelector = React.forwardRef<
  HTMLDivElement,
  QuantitySelectorProps
>(
  (
    {
      variant = 'granel',
      onQuantityChange,
      onAddToCart,
      initialQuantity = 0,
      className,
    },
    ref,
  ) => {
    const [quantity, setQuantity] = React.useState(initialQuantity)
    const increment = getIncrement(variant)
    const isActive = quantity > 0

    const ariaLabel =
      variant === 'granel'
        ? 'Quantidade em gramas'
        : 'Quantidade em unidades'

    const handleAdd = () => {
      setQuantity(increment)
      onAddToCart?.(increment)
      onQuantityChange?.(increment)
    }

    const handleDecrease = () => {
      if (quantity <= increment) {
        setQuantity(0)
        onQuantityChange?.(0)
        return
      }
      const next = quantity - increment
      setQuantity(next)
      onQuantityChange?.(next)
    }

    const handleIncrease = () => {
      const next = quantity + increment
      setQuantity(next)
      onQuantityChange?.(next)
    }

    if (!isActive) {
      return (
        <div ref={ref} className={cn('w-full', className)}>
          <button
            type="button"
            onClick={handleAdd}
            className="flex h-10 w-full items-center justify-center rounded-sel bg-gd font-semibold text-white hover:bg-ghover"
            style={{ fontSize: '14px', ...transitionStyle }}
          >
            + Adicionar
          </button>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        role="spinbutton"
        aria-label={ariaLabel}
        aria-valuemin={increment}
        aria-valuenow={quantity}
        className={cn(
          'grid h-10 w-full grid-cols-[1fr_2fr_1fr] rounded-sel bg-gd px-3',
          className,
        )}
        style={transitionStyle}
      >
        <button
          type="button"
          onClick={handleDecrease}
          aria-label="Diminuir quantidade"
          className="flex items-center justify-center text-white"
          style={transitionStyle}
        >
          <Minus size={16} strokeWidth={1.6} aria-hidden />
        </button>

        <span
          className="flex items-center justify-center border-x border-white/20 font-bold text-white"
          style={{ fontSize: '14px' }}
          aria-hidden
        >
          {formatQuantity(quantity, variant)}
        </span>

        <button
          type="button"
          onClick={handleIncrease}
          aria-label="Aumentar quantidade"
          className="flex items-center justify-center text-white"
          style={transitionStyle}
        >
          <Plus size={16} strokeWidth={1.6} aria-hidden />
        </button>
      </div>
    )
  },
)

QuantitySelector.displayName = 'QuantitySelector'
