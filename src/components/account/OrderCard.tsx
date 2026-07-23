'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Clock } from 'lucide-react'

import { BuyAgainButton } from '@/components/account/BuyAgainButton'
import { OrderStatusBadge } from '@/components/account/OrderStatusBadge'
import { PaymentMethodRow } from '@/components/account/PaymentMethodRow'
import { OrderTimeline } from '@/components/order/OrderTimeline'
import { formatOrderDateLong } from '@/lib/account/formatOrderDateLong'
import {
  isCompletedStatus,
  isInProgressStatus,
  type AccountOrder,
} from '@/lib/account/types'
import { formatBRL, formatGrams, cn } from '@/lib/utils'

const PREVIEW_ITEMS = 2
const WHATSAPP_SUPPORT = '5534997819292'

function problemWhatsAppUrl(orderCode: string): string {
  const text = `Olá, tenho um problema com meu pedido ${orderCode}`
  return `https://wa.me/${WHATSAPP_SUPPORT}?text=${encodeURIComponent(text)}`
}

function itemQtyLabel(item: AccountOrder['items'][number]): string {
  if (item.productType === 'granel') {
    return formatGrams(item.quantityGrams ?? 0)
  }
  const units = item.quantityUnits ?? 0
  return `${units} un.`
}

interface OrderCardProps {
  order: AccountOrder
}

export function OrderCard({ order }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false)
  const inProgress = isInProgressStatus(order.status)
  const completed = isCompletedStatus(order.status)
  const hiddenCount = Math.max(0, order.items.length - PREVIEW_ITEMS)

  return (
    <article
      className={cn(
        'rounded-card bg-white p-4 shadow-card transition-shadow sm:p-6',
        'hover:shadow-card-hover',
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-bd pb-4">
        <div className="flex flex-col gap-1">
          <p className="text-[13.5px] font-semibold text-t9">Pedido {order.code}</p>
          <p className="text-xs text-t6">{formatOrderDateLong(order.createdAt)}</p>
          <PaymentMethodRow method={order.paymentMethod} />
        </div>
        <div className="flex w-full flex-col items-start gap-1.5 sm:w-auto sm:items-end">
          <OrderStatusBadge status={order.status} />
          <p className="text-base font-bold text-gdeep">{formatBRL(order.totalCents)}</p>
        </div>
      </div>

      <ul className="mb-4 flex flex-col gap-2.5">
        {order.items.map((item, index) => {
          const isExtra = index >= PREVIEW_ITEMS
          if (isExtra && !expanded) return null

          return (
            <li key={`${order.id}-${item.productId}-${index}`} className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-inner bg-cream-img"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-t9">{item.productName}</p>
                <p className="mt-px text-[11.5px] text-t6">{itemQtyLabel(item)}</p>
              </div>
              <p className="shrink-0 text-[13px] font-semibold text-t9">
                {formatBRL(item.itemTotalCents)}
              </p>
            </li>
          )
        })}
      </ul>

      {!expanded && hiddenCount > 0 && (
        <p className="mb-4 pl-14 text-xs text-t6">
          + {hiddenCount} {hiddenCount === 1 ? 'item não exibido' : 'itens não exibidos'}
        </p>
      )}

      {expanded && inProgress && (
        <div className="mb-4">
          <OrderTimeline
            status={order.status}
            deliveryType={order.deliveryType}
            createdAt={order.createdAt}
          />
        </div>
      )}

      <div className="flex flex-col flex-wrap gap-2.5 sm:flex-row sm:items-center">
        {completed && <BuyAgainButton orderId={order.id} className="w-full sm:w-auto" />}

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            'inline-flex items-center justify-center gap-2 px-2 py-2.5 text-[13px] font-semibold text-t6',
            'hover:text-gd hover:underline',
          )}
          aria-expanded={expanded}
        >
          {expanded ? 'Ver menos' : 'Ver detalhes'}
          <ChevronDown
            size={15}
            strokeWidth={1.6}
            className={cn('transition-transform', expanded && 'rotate-180')}
            aria-hidden
          />
        </button>

        {inProgress && (
          <>
            <a
              href={problemWhatsAppUrl(order.code)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-2 py-2.5 text-[13px] font-semibold text-t6 hover:text-gd hover:underline"
            >
              Tive um problema
            </a>
            <Link
              href={`/pedido/${order.trackingToken}`}
              className="inline-flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-medium text-t4 hover:text-gd hover:underline"
            >
              <Clock size={14} strokeWidth={1.6} aria-hidden />
              Acompanhar pedido
            </Link>
          </>
        )}
      </div>
    </article>
  )
}
