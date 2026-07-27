'use client'

import * as React from 'react'
import { Clock } from 'lucide-react'

const CUTOFF_HOUR = 14

function calcularCountdown(): { label: string; progresso: number } {
  const agora = new Date()
  const horaAtualSP = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const corte = new Date(horaAtualSP)
  corte.setHours(CUTOFF_HOUR, 0, 0, 0)

  if (horaAtualSP >= corte) {
    return { label: 'Corte encerrado', progresso: 100 }
  }

  const inicioDia = new Date(horaAtualSP)
  inicioDia.setHours(0, 0, 0, 0)

  const totalMs = corte.getTime() - inicioDia.getTime()
  const decorridoMs = horaAtualSP.getTime() - inicioDia.getTime()
  const progresso = Math.min(Math.round((decorridoMs / totalMs) * 100), 100)

  const restanteMs = corte.getTime() - horaAtualSP.getTime()
  const horas = Math.floor(restanteMs / (1000 * 60 * 60))
  const minutos = Math.floor((restanteMs % (1000 * 60 * 60)) / (1000 * 60))

  return { label: `${horas}h ${minutos}m`, progresso }
}

export function CutoffCountdown() {
  const [estado, setEstado] = React.useState(calcularCountdown)

  React.useEffect(() => {
    const interval = setInterval(() => setEstado(calcularCountdown()), 60_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="rounded-card border border-bd bg-white p-[18px_20px] shadow-card transition-shadow hover:shadow-card-hover">
      <div className="mb-3 flex items-start justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-t4">Próximo corte</span>
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-inner bg-promo-bg text-promo">
          <Clock size={16} strokeWidth={1.6} />
        </div>
      </div>
      <div className="mb-1.5 text-[22px] font-bold tabular-nums tracking-tight text-promo">{estado.label}</div>
      <div className="mt-2 h-1 overflow-hidden rounded-pill bg-gray-100">
        <div className="h-full rounded-pill bg-promo transition-[width] duration-500" style={{ width: `${estado.progresso}%` }} />
      </div>
      <div className="mt-1.5 text-[11px] text-t4">Aceitar pedidos até 14h00</div>
    </div>
  )
}
