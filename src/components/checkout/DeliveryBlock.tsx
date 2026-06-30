'use client'

import { useEffect } from 'react'
import type { OrderDeliveryType } from '@/lib/orders/types'

interface DeliveryAddress {
  cep: string
  street: string
  streetNumber: string
  complement: string
  neighborhood: string
  deliveryPeriod: string
}

interface DeliveryBlockProps {
  deliveryType: OrderDeliveryType
  onDeliveryTypeChange: (type: OrderDeliveryType) => void
  address: DeliveryAddress
  onAddressChange: (field: keyof DeliveryAddress, value: string) => void
}

function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

export function DeliveryBlock({
  deliveryType,
  onDeliveryTypeChange,
  address,
  onAddressChange,
}: DeliveryBlockProps) {
  useEffect(() => {
    if (deliveryType === 'retirada') {
      onAddressChange('cep', '')
      onAddressChange('street', '')
      onAddressChange('streetNumber', '')
      onAddressChange('complement', '')
      onAddressChange('neighborhood', '')
    }
  }, [deliveryType]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="bg-white border border-bd rounded-inner overflow-hidden shadow-card">
      <div className="px-5 py-4 border-b border-bd flex items-center gap-2.5">
        <div className="w-[22px] h-[22px] bg-gdeep text-white rounded-full text-[11px] font-bold flex items-center justify-center flex-shrink-0">
          1
        </div>
        <h2 className="text-[15px] font-semibold text-t9 tracking-[-0.01em]">Entrega</h2>
      </div>

      <div className="px-5 py-[18px]">
        {/* Delivery type cards */}
        <div className="flex gap-2.5 mb-4">
          {/* Entrega em casa */}
          <button
            type="button"
            onClick={() => onDeliveryTypeChange('entrega')}
            className={`flex-1 border-[1.5px] rounded-sel px-3.5 py-3 cursor-pointer transition-colors text-left ${
              deliveryType === 'entrega'
                ? 'border-gd bg-[#F0FDF4]'
                : 'border-bd hover:border-[#93C5A5]'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-block w-4 h-4 rounded-full border-2 relative flex-shrink-0 transition-colors ${
                  deliveryType === 'entrega' ? 'border-gd' : 'border-bd'
                }`}
              >
                {deliveryType === 'entrega' && (
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gd rounded-full" />
                )}
              </span>
              <span className="text-[12px] font-semibold text-t9">Receber em casa</span>
            </div>
            <p className="text-[10px] text-t6 ml-6">Motoboy · Uberlândia · R$&nbsp;15,00</p>
            <span className="mt-1.5 ml-6 inline-block text-[9px] font-bold bg-[#DCFCE7] text-[#166534] px-[7px] py-[2px] rounded-pill">
              Entrega hoje
            </span>
          </button>

          {/* Retirar na loja */}
          <button
            type="button"
            onClick={() => onDeliveryTypeChange('retirada')}
            className={`flex-1 border-[1.5px] rounded-sel px-3.5 py-3 cursor-pointer transition-colors text-left ${
              deliveryType === 'retirada'
                ? 'border-gd bg-[#F0FDF4]'
                : 'border-bd hover:border-[#93C5A5]'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-block w-4 h-4 rounded-full border-2 relative flex-shrink-0 transition-colors ${
                  deliveryType === 'retirada' ? 'border-gd' : 'border-bd'
                }`}
              >
                {deliveryType === 'retirada' && (
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gd rounded-full" />
                )}
              </span>
              <span className="text-[12px] font-semibold text-t9">Retirar na loja</span>
            </div>
            <p className="text-[10px] text-t6 ml-6">Unidade Fundinho</p>
            <span className="mt-1.5 ml-6 inline-block text-[9px] font-bold bg-indigo-bg text-indigo px-[7px] py-[2px] rounded-pill">
              Frete grátis
            </span>
          </button>
        </div>

        {/* Address form — only for entrega */}
        {deliveryType === 'entrega' && (
          <div>
            {/* CEP */}
            <div className="checkout-field">
              <input
                id="cep"
                type="text"
                inputMode="numeric"
                placeholder=" "
                value={address.cep}
                maxLength={9}
                onChange={e => onAddressChange('cep', maskCEP(e.target.value))}
                autoComplete="postal-code"
              />
              <label htmlFor="cep">
                CEP <span className="text-danger">*</span>
              </label>
              {address.cep.replace(/\D/g, '').length === 8 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gd bg-[#DCFCE7] px-2 py-0.5 rounded-pill pointer-events-none">
                  Uberlândia
                </span>
              )}
            </div>

            {/* Rua + Número */}
            <div className="flex gap-2.5 mb-3">
              <div className="checkout-field flex-1 !mb-0">
                <input
                  id="street"
                  type="text"
                  placeholder=" "
                  value={address.street}
                  onChange={e => onAddressChange('street', e.target.value)}
                  autoComplete="street-address"
                />
                <label htmlFor="street">
                  Rua <span className="text-danger">*</span>
                </label>
              </div>
              <div className="checkout-field !mb-0" style={{ width: 80, flexShrink: 0 }}>
                <input
                  id="streetNumber"
                  type="text"
                  placeholder=" "
                  value={address.streetNumber}
                  onChange={e => onAddressChange('streetNumber', e.target.value)}
                  autoComplete="address-line2"
                />
                <label htmlFor="streetNumber">
                  Nº <span className="text-danger">*</span>
                </label>
              </div>
            </div>

            {/* Bairro + Complemento */}
            <div className="flex gap-2.5 mb-3">
              <div className="checkout-field flex-1 !mb-0">
                <input
                  id="neighborhood"
                  type="text"
                  placeholder=" "
                  value={address.neighborhood}
                  onChange={e => onAddressChange('neighborhood', e.target.value)}
                />
                <label htmlFor="neighborhood">
                  Bairro <span className="text-danger">*</span>
                </label>
              </div>
              <div className="checkout-field flex-1 !mb-0">
                <input
                  id="complement"
                  type="text"
                  placeholder=" "
                  value={address.complement}
                  onChange={e => onAddressChange('complement', e.target.value)}
                />
                <label htmlFor="complement">Complemento (opcional)</label>
              </div>
            </div>

            {/* Período */}
            <div className={`checkout-field has-val`}>
              <select
                id="deliveryPeriod"
                value={address.deliveryPeriod}
                onChange={e => onAddressChange('deliveryPeriod', e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="manha">Manhã (8h – 12h)</option>
                <option value="tarde">Tarde (12h – 18h)</option>
              </select>
              <label htmlFor="deliveryPeriod">Período preferido</label>
              <svg
                className="checkout-sel-arrow"
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        )}

        {/* Store info — only for retirada */}
        {deliveryType === 'retirada' && (
          <div className="bg-surface border border-bd rounded-input px-4 py-3.5">
            <p className="text-[12px] font-semibold text-t9 mb-1">
              Fundinho — Praça Clarimundo Carneiro, 119
            </p>
            <p className="text-[11px] text-t6 leading-relaxed">
              Segunda a Sábado · 8h às 18h<br />
              Retire em até 2h após a confirmação do pedido
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
