'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'

import { retryOrderPayment } from '@/lib/orders/actions'

interface RetryPaymentButtonProps {
  trackingToken: string
}

export function RetryPaymentButton({ trackingToken }: RetryPaymentButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    setError(null)
    startTransition(async () => {
      const result = await retryOrderPayment(trackingToken)

      if (!result.success) {
        setError(result.error)
        return
      }

      window.location.href = result.initPoint
    })
  }

  return (
    <div className="mt-5 flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-g text-white rounded-inner text-[13px] font-semibold hover:bg-ghover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <Loader2 size={16} strokeWidth={1.6} className="animate-spin" aria-hidden />
        ) : (
          'Tentar novamente'
        )}
      </button>
      {error && <p className="text-[11px] font-medium text-danger">{error}</p>}
    </div>
  )
}
