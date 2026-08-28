'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CartItem } from '@/lib/cart/types'
import type { OrderDeliveryType, PaymentMethod } from '@/lib/orders/types'
import { getCartItems, clearCart } from '@/lib/cart/storage'
import { calcFrete } from '@/lib/cart/calculations'
import { createOrderAction } from '@/lib/orders/actions'
import { CheckoutTopbar } from './CheckoutTopbar'
import { DeliveryBlock } from './DeliveryBlock'
import { IdentificationBlock } from './IdentificationBlock'
import { PaymentBlock } from './PaymentBlock'
import { OrderSummaryPanel } from './OrderSummaryPanel'

interface AddressState {
  cep: string
  street: string
  streetNumber: string
  complement: string
  neighborhood: string
  deliveryPeriod: string
}

interface IdState {
  customerName: string
  customerPhone: string
  customerEmail: string
  notes: string
}

const initialAddress: AddressState = {
  cep: '', street: '', streetNumber: '',
  complement: '', neighborhood: '', deliveryPeriod: '',
}

interface CheckoutFormProps {
  prefillEmail: string | null
}

export function CheckoutForm({ prefillEmail }: CheckoutFormProps) {
  const router = useRouter()

  const [items, setItems]           = useState<CartItem[]>([])
  const [mounted, setMounted]       = useState(false)
  const [deliveryType, setDeliveryType] = useState<OrderDeliveryType>('entrega')
  const [address, setAddress]       = useState<AddressState>(initialAddress)
  const [idFields, setIdFields]     = useState<IdState>({
    customerName: '', customerPhone: '',
    customerEmail: prefillEmail ?? '', notes: '',
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [needsChange, setNeedsChange]     = useState(false)
  const [changeAmount, setChangeAmount]   = useState('')
  const [couponCode, setCouponCode]       = useState('')
  const [isSubmitting, setIsSubmitting]   = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  useEffect(() => {
    setItems(getCartItems())
    setMounted(true)
  }, [])

  const handleAddressChange = useCallback(
    (field: keyof AddressState, value: string) =>
      setAddress(prev => ({ ...prev, [field]: value })),
    [],
  )

  const handleIdChange = useCallback(
    (field: keyof IdState, value: string) =>
      setIdFields(prev => ({ ...prev, [field]: value })),
    [],
  )

  const subtotalCents = items.reduce((acc, item) => {
    if (item.productType === 'granel') return acc + Math.round(item.priceCents * item.quantity / 100)
    return acc + item.priceCents * item.quantity
  }, 0)

  // Total pro cálculo de parcelamento — mesmo critério do MP (server) e do
  // OrderSummaryPanel: subtotal + frete, frete zerado se for retirada.
  const shippingCentsForInstallments = deliveryType === 'retirada' ? 0 : calcFrete(subtotalCents)
  const totalCentsForInstallments = subtotalCents + shippingCentsForInstallments

  async function handleSubmit() {
    setError(null)

    // Validações client-side
    if (items.length === 0)                         { setError('Seu carrinho está vazio.'); return }
    if (!idFields.customerName.trim())              { setError('Informe seu nome completo.'); return }
    if (!idFields.customerPhone.replace(/\D/g, '')) { setError('Informe seu WhatsApp.'); return }
    if (!idFields.customerEmail.trim())             { setError('Informe seu e-mail.'); return }
    if (deliveryType === 'entrega') {
      if (address.cep.replace(/\D/g, '').length !== 8) { setError('CEP inválido (8 dígitos).'); return }
      if (!address.street.trim())       { setError('Informe o nome da rua.'); return }
      if (!address.streetNumber.trim()) { setError('Informe o número.'); return }
      if (!address.neighborhood.trim()) { setError('Informe o bairro.'); return }
    }

    setIsSubmitting(true)

    // Período concatenado em notes
    const periodLabel = address.deliveryPeriod === 'manha'
      ? 'Manhã (8h–12h)'
      : address.deliveryPeriod === 'tarde'
        ? 'Tarde (12h–18h)'
        : ''
    const periodNote = periodLabel ? ` · Período: ${periodLabel}` : ''
    const changeNote = paymentMethod === 'dinheiro' && needsChange && changeAmount
      ? ` · Troco para: ${changeAmount}`
      : ''
    const suffix = periodNote + changeNote
    const notes  = idFields.notes ? `${idFields.notes}${suffix}` : (suffix.trim() || undefined)

    // Mapeamento AddressState → deliveryAddressSchema
    // cep → zip | streetNumber → number
    const deliveryAddress = deliveryType === 'entrega'
      ? {
          street:       address.street.trim(),
          number:       address.streetNumber.trim(),
          complement:   address.complement.trim() || undefined,
          neighborhood: address.neighborhood.trim(),
          city:         'Uberlândia',
          state:        'MG',
          zip:          address.cep,
        }
      : null

    const result = await createOrderAction({
      items:           items.map(item => ({ productId: item.id, quantity: item.quantity })),
      deliveryType,
      paymentMethod,
      deliveryAddress: deliveryAddress ?? null,
      customerName:    idFields.customerName.trim(),
      customerPhone:   idFields.customerPhone.replace(/\D/g, ''),
      customerEmail:   idFields.customerEmail.trim(),
      notes,
    })

    if (!result.success) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    clearCart()

    // Pagamentos online → redireciona para MP
    if (result.initPoint) {
      window.location.href = result.initPoint
      return
    }

    // Pagamento na entrega (dinheiro / alelo) → vai para confirmação
    router.push(`/pedido/${result.trackingToken}?status=sucesso`)
  }

  // Skeleton durante hidratação do localStorage
  if (!mounted) {
    return (
      <div className="min-h-screen bg-cream">
        <CheckoutTopbar activeStep="checkout" />
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row gap-4 animate-pulse">
          <div className="flex-1 flex flex-col gap-3.5">
            {[120, 180, 260].map(h => (
              <div key={h} className="bg-white border border-bd rounded-inner" style={{ height: h }} />
            ))}
          </div>
          <div className="w-full sm:w-[296px] flex-shrink-0">
            <div className="bg-white border border-bd rounded-inner h-80" />
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <CheckoutTopbar activeStep="checkout" />
        <div className="max-w-[480px] mx-auto px-6 py-20 text-center">
          <div className="text-[48px] mb-4">🛒</div>
          <h1 className="text-[20px] font-bold text-t9 mb-2">Seu carrinho está vazio</h1>
          <p className="text-[14px] text-t6 mb-8">Adicione produtos antes de finalizar o pedido.</p>
          <a
            href="/loja"
            className="inline-flex items-center gap-2 bg-g text-white rounded-inner px-6 h-12 text-[14px] font-bold hover:bg-ghover transition-colors"
          >
            Ir para a loja
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <CheckoutTopbar activeStep="checkout" />

      {/* Aviso de sessão pendente */}
      {!prefillEmail && (
        <div className="bg-[#FEF9C3] border-b border-[#FDE68A] px-4 py-2.5 text-center text-[12px] text-[#854D0E] font-medium">
          Você não está logado. Preencha seus dados abaixo —{' '}
          <Link
            href="/conta/login?redirect=/checkout"
            className="font-semibold underline hover:text-[#713F12]"
          >
            faça login
          </Link>{' '}
          para acompanhar o pedido futuramente.
        </div>
      )}

      <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row gap-4 items-start">

        {/* Sidebar no mobile aparece primeiro */}
        <div className="w-full sm:w-[296px] flex-shrink-0 sm:order-last">
          <OrderSummaryPanel
            items={items}
            paymentMethod={paymentMethod}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            couponCode={couponCode}
            onCouponChange={setCouponCode}
            onApplyCoupon={() => { /* cupom — Fase 5B */ }}
            deliveryType={deliveryType}
          />
        </div>

        {/* Col principal */}
        <div className="flex-1 min-w-0 flex flex-col gap-3.5 w-full">
          <DeliveryBlock
            deliveryType={deliveryType}
            onDeliveryTypeChange={type => {
              setDeliveryType(type)
            }}
            address={address}
            onAddressChange={handleAddressChange}
          />

          <IdentificationBlock
            fields={idFields}
            onChange={handleIdChange}
          />

          <PaymentBlock
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            totalCents={totalCentsForInstallments}
            needsChange={needsChange}
            changeAmount={changeAmount}
            onNeedsChangeToggle={setNeedsChange}
            onChangeAmountChange={setChangeAmount}
          />

          {error && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-inner px-4 py-3 text-[13px] text-danger font-medium flex items-start gap-2">
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
                strokeLinejoin="round" className="flex-shrink-0 mt-0.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* CTA flutuante no mobile */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-bd px-4 py-3 z-40">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-12 bg-g text-white rounded-inner text-[15px] font-bold tracking-[0.04em] flex items-center justify-center gap-2 hover:bg-ghover disabled:opacity-50"
        >
          {isSubmitting ? 'Processando…' : 'PAGAR AGORA'}
        </button>
      </div>
    </div>
  )
}
