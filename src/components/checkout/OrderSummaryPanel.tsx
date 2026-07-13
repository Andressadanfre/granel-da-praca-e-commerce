'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { CartItem } from '@/lib/cart/types'
import type { OrderDeliveryType, PaymentMethod } from '@/lib/orders/types'
import { formatBRL, formatGrams } from '@/lib/utils'
import { FRETE_FIXO_CENTS, FRETE_GRATIS_THRESHOLD } from '@/lib/cart/constants'

const PIX_DISCOUNT_RATE = 0.05

function calcItemTotalCents(item: CartItem): number {
  if (item.productType === 'granel') {
    return Math.round(item.priceCents * item.quantity / 100)
  }
  return item.priceCents * item.quantity
}

interface OrderSummaryPanelProps {
  items: CartItem[]
  paymentMethod: PaymentMethod
  isSubmitting: boolean
  onSubmit: () => void
  couponCode: string
  onCouponChange: (val: string) => void
  onApplyCoupon: () => void
  deliveryType: OrderDeliveryType
}

export function OrderSummaryPanel({
  items,
  paymentMethod,
  isSubmitting,
  onSubmit,
  couponCode,
  onCouponChange,
  onApplyCoupon,
  deliveryType,
}: OrderSummaryPanelProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const subtotalCents = items.reduce((acc, item) => acc + calcItemTotalCents(item), 0)
  const shippingCents = deliveryType === 'retirada' ? 0 : (subtotalCents >= FRETE_GRATIS_THRESHOLD ? 0 : FRETE_FIXO_CENTS)
  const pixDiscountCents = paymentMethod === 'pix'
    ? Math.floor(subtotalCents * PIX_DISCOUNT_RATE)
    : 0
  const totalCents = subtotalCents + shippingCents - pixDiscountCents
  const itemCount = items.length

  function itemQtyLabel(item: CartItem): string {
    if (item.productType === 'granel') return formatGrams(item.quantity)
    return `${item.quantity} un`
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Mobile accordion toggle */}
      <button
        type="button"
        className="sm:hidden w-full bg-white border border-bd rounded-inner px-4 py-3.5 flex items-center justify-between"
        onClick={() => setMobileOpen(v => !v)}
      >
        <span className="text-[13px] font-semibold text-t9">
          Resumo ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
        </span>
        <span className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-gdeep">{formatBRL(totalCents)}</span>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-t4 transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {/* Summary block */}
      <div className={`bg-white border border-bd rounded-inner overflow-hidden shadow-card ${mobileOpen ? 'block' : 'hidden sm:block'}`}>
        <div className="px-[18px] py-3.5 border-b border-bd flex items-center justify-between">
          <span className="text-[13px] font-semibold text-t9">Resumo do pedido</span>
          <span className="text-[11px] font-medium text-t4">
            {itemCount} {itemCount === 1 ? 'item' : 'itens'}
          </span>
        </div>

        <div className="px-[18px] py-4">
          <ul className="flex flex-col mb-3.5">
            {items.map(item => (
              <li
                key={item.id}
                className="flex items-center gap-2.5 py-2.5 border-b border-surface last:border-b-0 last:pb-0 first:pt-0"
              >
                <div className="relative w-11 h-11 rounded-input border border-bd bg-surface flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 88 88" fill="none" className="opacity-20">
                      <rect x="8" y="28" width="72" height="52" rx="6" fill="#002603" />
                      <ellipse cx="44" cy="28" rx="20" ry="8" fill="#002603" />
                    </svg>
                  )}
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-gdeep text-white rounded-input text-[9px] font-bold flex items-center justify-center whitespace-nowrap">
                    {itemQtyLabel(item)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-t9 truncate">{item.name}</p>
                  <p className="text-[10px] text-t4 mt-0.5">
                    {item.productType === 'granel'
                      ? `Granel · ${formatBRL(item.priceCents)}/100gr`
                      : 'Por unidade'}
                  </p>
                </div>

                <span className="text-[12px] font-bold text-t9 whitespace-nowrap">
                  {formatBRL(calcItemTotalCents(item))}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-t border-dashed border-bd my-3" />

          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[12px] text-t4">Subtotal</span>
            <span className="text-[12px] font-medium text-t6">{formatBRL(subtotalCents)}</span>
          </div>

          {pixDiscountCents > 0 && (
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[12px] text-t4">Desconto PIX (5%)</span>
              <span className="text-[12px] font-semibold text-[#065F46]">
                − {formatBRL(pixDiscountCents)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[12px] text-t4">Frete</span>
            {shippingCents === 0
              ? <span className="text-[12px] font-semibold text-[#065F46]">Grátis 🎉</span>
              : <span className="text-[12px] font-medium text-t6">{formatBRL(shippingCents)}</span>
            }
          </div>

          <div className="flex justify-between items-baseline mt-2.5 pt-3 border-t border-dashed border-bd">
            <span className="text-[13px] font-semibold text-t9">Total</span>
            <span className="text-[19px] font-bold text-gdeep tracking-[-0.01em]">
              {formatBRL(totalCents)}
            </span>
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || items.length === 0}
            className="mt-3.5 w-full h-[52px] bg-g text-white rounded-inner text-[15px] font-bold tracking-[0.04em] flex items-center justify-center gap-2 transition-colors hover:bg-ghover active:scale-[.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                </svg>
                Processando…
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                PAGAR AGORA
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-3.5 mt-3 flex-wrap">
            {[
              { label: 'Site seguro', path: 'M3 11h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M7 11V7a5 5 0 0 1 10 0v4' },
              { label: 'Dados protegidos', path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
              { label: 'Mercado Pago', path: 'M20 6 9 17 4 12' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1 text-[10px] text-t4 font-medium">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.path} />
                </svg>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coupon */}
      <div className="bg-white border border-bd rounded-inner overflow-hidden shadow-card hidden sm:block">
        <div className="px-[18px] py-3.5 border-b border-bd text-[13px] font-semibold text-t9">
          Cupom de desconto
        </div>
        <div className="px-[18px] py-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={e => onCouponChange(e.target.value.toUpperCase())}
              placeholder="Ex: BEMVINDOUDI"
              className="flex-1 h-[38px] border border-bd rounded-input px-3 text-[12px] text-t9 bg-white outline-none transition-colors focus:border-gd placeholder:text-t4"
            />
            <button
              type="button"
              onClick={onApplyCoupon}
              className="h-[38px] px-3.5 bg-surface border border-bd rounded-input text-[12px] font-semibold text-t6 hover:bg-[#E5E7EB] hover:text-t9 transition-colors whitespace-nowrap"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp */}
      <div className="hidden sm:flex bg-[#F0FDF4] border border-[#BBF7D0] rounded-inner px-3.5 py-2.5 items-center gap-2.5">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#00B207" className="flex-shrink-0">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
        <p className="text-[11px] text-[#166534] leading-snug flex-1">
          Dúvidas no pagamento? Fale com a gente agora.
        </p>
        <a
          href="https://wa.me/5534997819292"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-g text-white rounded-input px-3 py-1.5 text-[11px] font-semibold hover:bg-gd transition-colors whitespace-nowrap"
        >
          Chamar
        </a>
      </div>
    </div>
  )
}
