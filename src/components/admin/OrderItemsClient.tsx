'use client'

import { useState, useTransition } from 'react'

import { markItemSeparated } from '@/lib/admin/actions'
import { OrderItemRow } from '@/components/admin/OrderItemRow'
import type { OrderItem } from '@/types/admin'

interface OrderItemsClientProps {
  items: OrderItem[]
}

export function OrderItemsClient({ items }: OrderItemsClientProps) {
  const [localItems, setLocalItems] = useState(items)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function handleToggle(itemId: string, separated: boolean) {
    setLocalItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, is_separated: separated } : item)),
    )
    setPendingId(itemId)

    startTransition(async () => {
      const result = await markItemSeparated(itemId, separated)

      if (!result.success) {
        setLocalItems(prev =>
          prev.map(item => (item.id === itemId ? { ...item, is_separated: !separated } : item)),
        )
      }

      setPendingId(null)
    })
  }

  return (
    <tbody>
      {localItems.map(item => (
        <OrderItemRow
          key={item.id}
          item={item}
          onToggle={handleToggle}
          disabled={pendingId === item.id}
        />
      ))}
    </tbody>
  )
}
