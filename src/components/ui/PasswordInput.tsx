'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { tokens } from '@/lib/tokens'
import { cn } from '@/lib/utils'

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'placeholder' | 'type'> {
  label: string
  error?: string
}

/**
 * Input de senha com toggle mostrar/ocultar (ícone de olho).
 * Visual alinhado ao Input do DS; botão à direita é interativo (≠ iconRight decorativo).
 */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className, style, disabled, id, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false)
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const hasError = Boolean(error)
    const errorId = `${inputId}-error`
    const toggleId = `${inputId}-toggle`

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
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            placeholder=" "
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
            className={cn(
              'peer h-full w-full rounded-input bg-transparent pt-4 pl-4 pr-11 text-t9 outline-none',
              'disabled:cursor-not-allowed',
              className,
            )}
            style={{
              fontSize: '14px',
              fontWeight: 400,
              ...style,
            }}
            {...props}
            type={visible ? 'text' : 'password'}
            autoComplete={props.autoComplete ?? 'new-password'}
          />

          <label
            htmlFor={inputId}
            className={cn(
              'pointer-events-none absolute left-4 origin-left text-t4',
              'top-1/2 -translate-y-1/2',
              'peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-t6',
              'peer-[:not(:placeholder-shown)]:top-2',
              'peer-[:not(:placeholder-shown)]:translate-y-0',
              'peer-[:not(:placeholder-shown)]:text-t6',
              'peer-focus:text-[11px]',
              'peer-[:not(:placeholder-shown)]:text-[11px]',
            )}
            style={{
              fontSize: '14px',
              transition: `top ${tokens.ease}, transform ${tokens.ease}, font-size ${tokens.ease}, color ${tokens.ease}`,
            }}
          >
            {label}
          </label>

          <button
            id={toggleId}
            type="button"
            tabIndex={disabled ? -1 : 0}
            disabled={disabled}
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={visible}
            aria-controls={inputId}
            onClick={() => setVisible((v) => !v)}
            className={cn(
              'absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-input text-t4',
              'hover:text-t6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g',
              'disabled:pointer-events-none',
            )}
          >
            {visible ? (
              <EyeOff size={18} strokeWidth={1.6} aria-hidden />
            ) : (
              <Eye size={18} strokeWidth={1.6} aria-hidden />
            )}
          </button>
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

PasswordInput.displayName = 'PasswordInput'
