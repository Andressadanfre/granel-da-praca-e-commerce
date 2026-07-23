import { Banknote, CreditCard, Gift, QrCode, type LucideIcon } from 'lucide-react'

import { getAccountPaymentLabel } from '@/lib/account/labels'
import type { PaymentMethod } from '@/lib/orders/types'
import { cn } from '@/lib/utils'

const PAYMENT_ICONS: Record<PaymentMethod, LucideIcon> = {
  pix: QrCode,
  cartao_credito: CreditCard,
  cartao_debito: CreditCard,
  dinheiro: Banknote,
  alelo: Gift,
}

interface PaymentMethodRowProps {
  method: PaymentMethod
  className?: string
}

export function PaymentMethodRow({ method, className }: PaymentMethodRowProps) {
  const Icon = PAYMENT_ICONS[method]

  return (
    <div className={cn('mt-0.5 flex items-center gap-1.5 text-xs text-t6', className)}>
      <Icon size={13} strokeWidth={1.6} className="shrink-0 text-t4" aria-hidden />
      <span>{getAccountPaymentLabel(method)}</span>
    </div>
  )
}
