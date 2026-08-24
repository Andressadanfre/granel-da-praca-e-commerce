'use client'

import { useState, useTransition } from 'react'
import { Save, Zap } from 'lucide-react'

import { useToast } from '@/components/ui/ToastProvider'
import { updateWeeklyOfferExpiresAt } from '@/lib/admin/actions'

const inputClass =
  'h-[38px] w-full rounded-input border border-bd bg-white px-3 text-[12.5px] text-t9 outline-none transition-colors placeholder:text-t4 focus:border-g focus:shadow-[0_0_0_3px_rgba(0,178,7,0.08)] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-t4'

const labelClass = 'flex items-center gap-1.5 text-[10.5px] font-semibold text-t6'

function isoToDatetimeLocal(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

interface WeeklyOfferCardProps {
  currentExpiresAt: string
}

export function WeeklyOfferCard({ currentExpiresAt }: WeeklyOfferCardProps) {
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [localValue, setLocalValue] = useState(() => isoToDatetimeLocal(currentExpiresAt))

  function handleSave() {
    const parsed = new Date(localValue)
    if (!localValue || Number.isNaN(parsed.getTime())) {
      showToast('Data inválida ou no passado', 'error')
      return
    }

    startTransition(async () => {
      const result = await updateWeeklyOfferExpiresAt(parsed.toISOString())

      if (!result.success) {
        showToast(result.error ?? 'Erro ao salvar prazo da oferta', 'error')
        return
      }

      showToast('Prazo da oferta atualizado', 'success')
    })
  }

  return (
    <section className="mb-6 overflow-hidden rounded-card border border-bd bg-white shadow-card">
      <div className="flex items-center gap-2.5 border-b border-bd px-[18px] py-3.5">
        <Zap size={15} strokeWidth={1.6} className="text-gd" aria-hidden />
        <h2 className="flex-1 text-[13px] font-semibold text-t9">Ofertas Relâmpago — prazo da semana</h2>
      </div>
      <div className="flex flex-col gap-3 px-[18px] py-4 md:flex-row md:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="weekly-offer-expires-at" className={labelClass}>
            Expira em
          </label>
          <input
            id="weekly-offer-expires-at"
            type="datetime-local"
            className={inputClass}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            disabled={isPending}
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex h-[38px] shrink-0 items-center justify-center gap-1.5 rounded-input bg-g px-[18px] text-xs font-semibold text-white transition-colors hover:bg-ghover disabled:opacity-60"
        >
          <Save size={14} strokeWidth={1.6} aria-hidden />
          {isPending ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </section>
  )
}
