import * as React from 'react'

import { tokens } from '@/lib/tokens'
import { cn } from '@/lib/utils'

export type BadgeVariant =
  | 'diet'
  | 'promo'
  | 'unit'
  | 'discount'
  | 'low-stock'
  | 'featured'

/**
 * EXCEÇÃO DE DESIGN SYSTEM:
 * O hexadecimal #86EFAC é um verde-claro decorativo utilizado exclusivamente
 * para bordas de elementos em destaque (featured). Por decisão intencional de
 * escopo no DS v3.1, este valor não foi promovido a token global, sendo isolado
 * localmente neste componente.
 */
const DECORATIVE_FEATURED_BORDER = '1px solid #86EFAC'

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  diet: {
    backgroundColor: tokens.colors.badgeDietBg,
    color:           tokens.colors.badgeDietTx,
    border:          `1px solid ${tokens.colors.badgeDietBd}`,
  },
  promo: {
    backgroundColor: tokens.colors.promo,
    color:           tokens.colors.white,
  },
  unit: {
    backgroundColor: tokens.colors.indigoBg,
    color:           tokens.colors.indigo,
  },
  discount: {
    backgroundColor: tokens.colors.promoBg,
    color:           tokens.colors.promo,
  },
  'low-stock': {
    backgroundColor: tokens.colors.warningBg,
    color:           tokens.colors.warningText,
  },
  featured: {
    backgroundColor: tokens.colors.iconBg,
    color:           tokens.colors.gd,
    border:          DECORATIVE_FEATURED_BORDER,
  },
}

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  variant: BadgeVariant
  children: string
  className?: string
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant, children, className, style, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center whitespace-nowrap rounded-pill font-bold uppercase',
          'py-1 px-[10px]',
          className,
        )}
        style={{
          fontSize: '9px',
          letterSpacing: '0.04em',
          ...variantStyles[variant],
          ...style,
        }}
        {...props}
      >
        {children}
      </span>
    )
  },
)

Badge.displayName = 'Badge'
