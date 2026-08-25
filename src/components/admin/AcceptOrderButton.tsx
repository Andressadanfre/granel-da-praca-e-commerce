'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'

import { updateOrderStatus } from '@/lib/admin/actions'
import type { DeliveryType } from '@/types/admin'
import { cn } from '@/lib/utils'

interface AcceptOrderButtonProps {
  orderId: string
  deliveryType: DeliveryType
}

const actionBtnClass =
  'flex h-7 w-7 items-center justify-center rounded-input border border-bd bg-white text-t6 transition-colors hover:border-gd hover:bg-badge-diet-bg hover:text-gd disabled:cursor-not-allowed disabled:opacity-50'

export function AcceptOrderButton({ orderId, deliveryType }: AcceptOrderButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    setError(null)
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, 'aceito', deliveryType)
      if (!result.success) {
        setError(result.error ?? 'Erro interno')
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="relative flex flex-col items-center">
      <button
        type="button"
        title={isPending ? 'Aceitando…' : 'Aceitar pedido'}
        aria-label={isPending ? 'Aceitando…' : 'Aceitar pedido'}
        aria-busy={isPending}
        disabled={isPending}
        onClick={handleClick}
        className={cn(actionBtnClass)}
      >
        {isPending ? (
          <Loader2 size={13} strokeWidth={1.6} className="animate-spin" aria-hidden />
        ) : (
          <Check size={13} strokeWidth={1.6} aria-hidden />
        )}
      </button>
      {error && (
        <p className="absolute left-1/2 top-full z-10 mt-0.5 w-max max-w-[120px] -translate-x-1/2 text-center text-[9px] font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
