import type { OrderStatus } from '@/lib/orders/types'
import { getAccountStatusBadge } from '@/lib/account/labels'
import { cn } from '@/lib/utils'

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const meta = getAccountStatusBadge(status)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-[11px] font-semibold',
        meta.className,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dotClassName)} aria-hidden />
      {meta.label}
    </span>
  )
}
