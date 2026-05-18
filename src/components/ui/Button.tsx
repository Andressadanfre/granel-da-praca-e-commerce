import * as React from 'react'
import { Loader2, type LucideIcon } from 'lucide-react'

import { tokens } from '@/lib/tokens'
import { cn } from '@/lib/utils'

export type ButtonVariant =
  | 'primary'
  | 'cart'
  | 'secondary'
  | 'ghost'
  | 'danger'

export type ButtonSize = 'md' | 'lg'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  icon?: LucideIcon
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-g text-white hover:bg-ghover',
  cart: 'bg-gd text-white hover:bg-ghover',
  secondary:
    'border-[1.5px] border-g bg-transparent text-g hover:bg-g-muted',
  ghost: 'bg-transparent text-g hover:underline',
  danger: 'bg-danger-btn text-white hover:bg-danger-btn-hover',
}

const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-10 px-6 py-3',
  lg: 'h-[52px] px-8 py-[14px]',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant,
      size = 'md',
      isLoading = false,
      icon: Icon,
      className,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold',
          variant !== 'ghost' && 'rounded-sel',
          variantClasses[variant],
          sizeClasses[size],
          isDisabled && 'cursor-not-allowed opacity-50',
          className,
        )}
        style={{
          fontSize: '14px',
          transition: `background-color ${tokens.ease}, color ${tokens.ease}, border-color ${tokens.ease}`,
        }}
        {...props}
      >
        {isLoading ? (
          <Loader2
            size={16}
            strokeWidth={1.6}
            className="animate-spin"
            aria-hidden
          />
        ) : (
          <>
            {Icon && (
              <Icon size={16} strokeWidth={1.6} aria-hidden />
            )}
            {children}
          </>
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'
