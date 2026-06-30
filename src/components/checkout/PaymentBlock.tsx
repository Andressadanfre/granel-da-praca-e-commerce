'use client'

import type { PaymentMethod } from '@/lib/orders/types'
import { PARCELA_2X_THRESHOLD, PARCELA_3X_THRESHOLD } from '@/lib/cart/constants'
import { formatBRL } from '@/lib/utils'

interface PaymentBlockProps {
  paymentMethod: PaymentMethod
  onPaymentMethodChange: (method: PaymentMethod) => void
  subtotalCents: number
  needsChange: boolean
  changeAmount: string
  onNeedsChangeToggle: (needs: boolean) => void
  onChangeAmountChange: (val: string) => void
}

// cartao_debito não está no HTML aprovado — mapeado via 'cartao_credito'
// (MP gerencia crédito/débito na própria página de pagamento)
const PAYMENT_OPTIONS: { key: PaymentMethod; label: string; sub: string }[] = [
  { key: 'pix',            label: 'PIX',                        sub: 'Aprovação instantânea · QR Code ou Copia e Cola' },
  { key: 'cartao_credito', label: 'Cartão de crédito ou débito', sub: 'Visa, Mastercard, Elo · crédito ou débito' },
  { key: 'alelo',          label: 'Alelo',                       sub: 'Vale-alimentação · maquininha na entrega/retirada' },
  { key: 'dinheiro',       label: 'Dinheiro na entrega',         sub: 'Informe se precisar de troco' },
]

function maskMoney(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  const num = (parseInt(digits, 10) / 100).toFixed(2)
  return 'R$ ' + num.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function PaymentBlock({
  paymentMethod,
  onPaymentMethodChange,
  subtotalCents,
  needsChange,
  changeAmount,
  onNeedsChangeToggle,
  onChangeAmountChange,
}: PaymentBlockProps) {
  const maxInstallments = subtotalCents >= PARCELA_3X_THRESHOLD
    ? 3
    : subtotalCents >= PARCELA_2X_THRESHOLD
      ? 2
      : 1

  const installmentBadge = maxInstallments === 3
    ? 'até 3x sem juros (crédito)'
    : maxInstallments === 2
      ? '2x sem juros (crédito)'
      : 'à vista'

  return (
    <section className="bg-white border border-bd rounded-inner overflow-hidden shadow-card">
      <div className="px-5 py-4 border-b border-bd flex items-center gap-2.5">
        <div className="w-[22px] h-[22px] bg-gdeep text-white rounded-full text-[11px] font-bold flex items-center justify-center flex-shrink-0">
          3
        </div>
        <h2 className="text-[15px] font-semibold text-t9 tracking-[-0.01em]">Pagamento</h2>
      </div>

      <div className="px-5 py-[18px] flex flex-col gap-2">
        {PAYMENT_OPTIONS.map(opt => (
          <div key={opt.key}>
            <button
              type="button"
              onClick={() => onPaymentMethodChange(opt.key)}
              className={`w-full border-[1.5px] rounded-sel px-3.5 py-3 flex items-center gap-3 transition-colors text-left ${
                paymentMethod === opt.key
                  ? 'border-gd bg-[#F0FDF4]'
                  : 'border-bd hover:border-[#93C5A5]'
              }`}
            >
              {/* Radio dot */}
              <span
                className={`w-4 h-4 rounded-full border-2 relative flex-shrink-0 transition-colors ${
                  paymentMethod === opt.key ? 'border-gd' : 'border-bd'
                }`}
              >
                {paymentMethod === opt.key && (
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gd rounded-full" />
                )}
              </span>

              {/* Icon */}
              <span className="w-9 h-9 rounded-input border border-bd bg-white flex items-center justify-center flex-shrink-0">
                <PaymentIcon method={opt.key} />
              </span>

              {/* Info */}
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] font-semibold text-t9">{opt.label}</span>
                <span className="block text-[10px] text-t6 mt-0.5">{opt.sub}</span>
              </span>

              {/* Badge */}
              {opt.key === 'pix' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-pill bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] whitespace-nowrap flex-shrink-0">
                  5% OFF
                </span>
              )}
              {opt.key === 'cartao_credito' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-pill bg-indigo-bg text-indigo whitespace-nowrap flex-shrink-0">
                  {installmentBadge}
                </span>
              )}
            </button>

            {/* PIX detail */}
            {paymentMethod === opt.key && opt.key === 'pix' && (
              <div className="mt-2 px-3.5 py-3.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-inner">
                <div className="flex gap-3.5 items-start">
                  <div className="w-16 h-16 rounded-input border border-dashed border-[#6EE7B7] bg-white flex items-center justify-center flex-shrink-0 text-[9px] text-t4 text-center leading-tight">
                    QR Code<br />após pedido
                  </div>
                  <div className="text-[11px] text-[#065F46] leading-relaxed">
                    <strong className="block text-[12px] font-semibold mb-1">Como pagar com PIX</strong>
                    1. Clique em &ldquo;Pagar agora&rdquo; para finalizar o pedido<br />
                    2. Você será redirecionado para o Mercado Pago<br />
                    3. Escaneie o QR Code ou use Copia e Cola<br />
                    4. Pagamento confirmado automaticamente em segundos
                  </div>
                </div>
              </div>
            )}

            {/* Cartão detail */}
            {paymentMethod === opt.key && opt.key === 'cartao_credito' && (
              <div className="mt-2 px-3.5 py-3.5 bg-[#F8F9FF] border border-[#E0E7FF] rounded-inner">
                <div className="flex items-center gap-1.5 text-[11px] text-indigo font-semibold mb-2.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Parcelamento disponível no crédito
                </div>
                <div className="flex flex-col gap-1.5 mb-3">
                  {[
                    { label: '1x — qualquer valor', active: true },
                    { label: `2x sem juros — pedidos acima de ${formatBRL(PARCELA_2X_THRESHOLD)}`, active: maxInstallments >= 2 },
                    { label: `3x sem juros — pedidos acima de ${formatBRL(PARCELA_3X_THRESHOLD)}`, active: maxInstallments >= 3 },
                  ].map(tier => (
                    <div key={tier.label} className={`flex items-center gap-2 text-[11px] ${tier.active ? 'text-t9 font-semibold' : 'text-t4 opacity-40'}`}>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${tier.active ? 'bg-g' : 'bg-bd'}`} />
                      {tier.label}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-t6">
                  Você será redirecionado ao Mercado Pago para inserir os dados do cartão com segurança.
                </p>
              </div>
            )}

            {/* Dinheiro detail — troco */}
            {paymentMethod === opt.key && opt.key === 'dinheiro' && (
              <div className="mt-2 px-3.5 py-3.5 bg-[#FEFCE8] border border-[#FDE68A] rounded-inner">
                <p className="text-[11px] font-semibold text-[#854D0E] mb-2.5">
                  Vai precisar de troco?
                </p>
                <div className="flex gap-2 flex-wrap mb-2.5">
                  {([{ label: 'Não preciso', value: false }, { label: 'Sim, preciso de troco', value: true }] as const).map(choice => (
                    <button
                      key={choice.label}
                      type="button"
                      onClick={() => onNeedsChangeToggle(choice.value)}
                      className={`border-[1.5px] rounded-pill px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                        needsChange === choice.value
                          ? 'border-[#F59E0B] bg-[#FEF9C3] text-[#78350F]'
                          : 'border-[#FDE68A] bg-white text-[#92400E] hover:border-[#F59E0B] hover:bg-[#FEF9C3]'
                      }`}
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
                {needsChange && (
                  <div>
                    <span className="block text-[10px] font-semibold text-[#92400E] mb-1.5">
                      Tenho uma nota de:
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={changeAmount}
                      onChange={e => onChangeAmountChange(maskMoney(e.target.value))}
                      placeholder="Ex: R$ 200,00"
                      className="w-full h-10 border-[1.5px] border-[#FDE68A] rounded-input px-3 text-[13px] text-t9 bg-white outline-none focus:border-[#F59E0B] focus:shadow-[0_0_0_3px_rgba(245,158,11,.1)] placeholder:text-t4"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function PaymentIcon({ method }: { method: PaymentMethod }) {
  if (method === 'pix') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M11.207 2.793a1.121 1.121 0 0 1 1.586 0l8.414 8.414a1.121 1.121 0 0 1 0 1.586l-8.414 8.414a1.121 1.121 0 0 1-1.586 0L2.793 12.793a1.121 1.121 0 0 1 0-1.586l8.414-8.414z" stroke="#2C742F" strokeWidth="1.6" />
        <path d="M9 12h6M12 9v6" stroke="#2C742F" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
  if (method === 'cartao_credito') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    )
  }
  if (method === 'alelo') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="8" cy="12" r="3" /><circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" /><path d="M6 12h.01M18 12h.01" />
    </svg>
  )
}
