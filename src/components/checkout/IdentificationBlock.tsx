'use client'

interface IdentificationFields {
  customerName: string
  customerPhone: string
  customerEmail: string
  notes: string
}

interface IdentificationBlockProps {
  fields: IdentificationFields
  onChange: (field: keyof IdentificationFields, value: string) => void
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function IdentificationBlock({ fields, onChange }: IdentificationBlockProps) {
  return (
    <section className="bg-white border border-bd rounded-inner overflow-hidden shadow-card">
      <div className="px-5 py-4 border-b border-bd flex items-center gap-2.5">
        <div className="w-[22px] h-[22px] bg-gdeep text-white rounded-full text-[11px] font-bold flex items-center justify-center flex-shrink-0">
          2
        </div>
        <h2 className="text-[15px] font-semibold text-t9 tracking-[-0.01em]">Identificação</h2>
      </div>

      <div className="px-5 py-[18px]">
        {/* Nome + WhatsApp */}
        <div className="flex gap-2.5 mb-3">
          <div className="checkout-field flex-1 !mb-0">
            <input
              id="customerName"
              type="text"
              placeholder=" "
              value={fields.customerName}
              onChange={e => onChange('customerName', e.target.value)}
              autoComplete="name"
            />
            <label htmlFor="customerName">
              Nome completo <span className="text-danger">*</span>
            </label>
          </div>
          <div className="checkout-field flex-1 !mb-0">
            <input
              id="customerPhone"
              type="tel"
              inputMode="tel"
              placeholder=" "
              value={fields.customerPhone}
              onChange={e => onChange('customerPhone', maskPhone(e.target.value))}
              autoComplete="tel"
            />
            <label htmlFor="customerPhone">
              WhatsApp <span className="text-danger">*</span>
            </label>
          </div>
        </div>

        {/* E-mail */}
        <div className="checkout-field">
          <input
            id="customerEmail"
            type="email"
            placeholder=" "
            value={fields.customerEmail}
            onChange={e => onChange('customerEmail', e.target.value)}
            autoComplete="email"
          />
          <label htmlFor="customerEmail">
            E-mail <span className="text-danger">*</span>
          </label>
        </div>

        {/* Observações */}
        <div className="mt-1">
          <textarea
            id="notes"
            rows={2}
            placeholder="Observações do pedido (opcional)"
            value={fields.notes}
            onChange={e => onChange('notes', e.target.value)}
            maxLength={500}
            className="w-full border-[1.5px] border-bd rounded-inner px-3 py-3 text-[13px] text-t9 bg-white outline-none transition-colors resize-none placeholder:text-t4 focus:border-gd focus:shadow-[0_0_0_3px_rgba(44,116,47,.15)] hover:border-t4"
          />
        </div>
      </div>
    </section>
  )
}
