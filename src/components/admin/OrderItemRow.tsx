'use client'

import { formatBRL, formatGrams } from '@/lib/utils'
import type { OrderItem } from '@/types/admin'

interface OrderItemRowProps {
  item: OrderItem
  onToggle: (id: string, value: boolean) => void
  disabled?: boolean
}

export function OrderItemRow({ item, onToggle, disabled }: OrderItemRowProps) {
  const quantityLabel = item.product_type === 'granel'
    ? formatGrams(item.quantity_grams ?? 0)
    : `${item.quantity_units ?? 0} un.`

  const unitPriceLabel = item.product_type === 'granel'
    ? `${formatBRL(Math.round(item.price_cents_snapshot / 10))} / 100 gr`
    : `${formatBRL(item.price_cents_snapshot)} / un.`

  return (
    <tr className="border-b border-bd last:border-b-0">
      <td className="px-3 py-3">
        <p className="text-[12px] font-semibold text-t9">{item.product_name}</p>
        <p className="text-[10px] text-t4">{item.product_code ?? '—'}</p>
      </td>
      <td className="px-3 py-3 text-[12px] font-semibold text-t9">{quantityLabel}</td>
      <td className="px-3 py-3 text-[11px] text-t6">{unitPriceLabel}</td>
      <td className="px-3 py-3 text-[13px] font-bold text-gdeep">{formatBRL(item.item_total_cents)}</td>
      <td className="px-3 py-3 text-right">
        <label className="inline-flex items-center gap-2 text-[11px] text-t6">
          <input
            type="checkbox"
            checked={item.is_separated}
            disabled={disabled}
            onChange={(e) => onToggle(item.id, e.target.checked)}
            className="h-4 w-4 rounded border-bd accent-g"
          />
          {item.is_separated ? 'Separado' : 'Pendente'}
        </label>
      </td>
    </tr>
  )
}
