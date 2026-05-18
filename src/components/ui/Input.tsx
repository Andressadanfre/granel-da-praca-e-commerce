import * as React from 'react'
import type { LucideIcon } from 'lucide-react'

import { tokens } from '@/lib/tokens'
import { cn } from '@/lib/utils'

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
  label: string
  error?: string
  iconLeft?: LucideIcon
  iconRight?: LucideIcon
}

// Limitação conhecida: floating label não sobe automaticamente com `value` controlado
// sem interação do usuário. Workaround: adicionar `placeholder=" "` e garantir que
// o input seja uncontrolled, ou usar a variante com pt-4 fixo para formulários controlados.
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      iconLeft: IconLeft,
      iconRight: IconRight,
      className,
      style,
      disabled,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const hasError = Boolean(error)
    const errorId = `${inputId}-error`

    return (
      <div className="w-full">
        <div
          className={cn(
            'relative h-12 rounded-input border bg-surface',
            'border-bd focus-within:border-g',
            hasError && 'border-danger focus-within:border-danger',
            disabled && 'cursor-not-allowed bg-gray-100 opacity-50',
          )}
          style={{ transition: `border-color ${tokens.ease}` }}
        >
          {IconLeft && (
            <IconLeft
              size={18}
              strokeWidth={1.6}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 shrink-0 text-t4"
              aria-hidden
            />
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            placeholder=" "
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
            className={cn(
              'peer h-full w-full rounded-input bg-transparent pt-4 text-t9 outline-none',
              'disabled:cursor-not-allowed',
              IconLeft ? 'pl-11' : 'pl-4',
              IconRight ? 'pr-11' : 'pr-4',
              className,
            )}
            style={{
              fontSize: '14px',
              fontWeight: 400,
              ...style,
            }}
            {...props}
          />

          <label
            htmlFor={inputId}
            className={cn(
              'pointer-events-none absolute origin-left text-t4',
              'top-1/2 -translate-y-1/2',
              'peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-t6',
              'peer-[:not(:placeholder-shown)]:top-2',
              'peer-[:not(:placeholder-shown)]:translate-y-0',
              'peer-[:not(:placeholder-shown)]:text-t6',
              'peer-focus:text-[11px]',
              'peer-[:not(:placeholder-shown)]:text-[11px]',
              IconLeft ? 'left-11' : 'left-4',
            )}
            style={{
              fontSize: '14px',
              transition: `top ${tokens.ease}, transform ${tokens.ease}, font-size ${tokens.ease}, color ${tokens.ease}`,
            }}
          >
            {label}
          </label>

          {IconRight && (
            <IconRight
              size={18}
              strokeWidth={1.6}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 shrink-0 text-t4"
              aria-hidden
            />
          )}
        </div>

        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-1 text-danger"
            style={{ fontSize: '12px' }}
          >
            {error}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
