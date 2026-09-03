'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

interface TimeLeft {
  h: string
  m: string
  s: string
}

function calcTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now()
  if (!Number.isFinite(diff) || diff <= 0) return null
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return {
    h: String(h).padStart(2, '0'),
    m: String(m).padStart(2, '0'),
    s: String(s).padStart(2, '0'),
  }
}

function CdBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-11 flex-col items-center gap-0.5 rounded-inner border border-bd bg-white px-2.5 py-1.5">
      <span className="text-lg font-extrabold leading-none tracking-tight text-gdeep tabular-nums">
        {value}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-t4">
        {label}
      </span>
    </div>
  )
}

export function OfertasCountdown({
  className,
  expiresAt,
}: {
  className?: string
  expiresAt: string
}) {
  const [time, setTime] = useState<TimeLeft>({ h: '00', m: '00', s: '00' })

  useEffect(() => {
    const target = new Date(expiresAt)

    function update() {
      const next = calcTimeLeft(target)
      if (!next) return
      setTime(next)
    }

    update()
    const id = window.setInterval(update, 1000)
    return () => window.clearInterval(id)
  }, [expiresAt])

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      aria-live="polite"
      aria-label="Contagem regressiva até o fim das ofertas"
    >
      <CdBlock value={time.h} label="Horas" />
      <span className="text-lg font-extrabold leading-none text-t4" aria-hidden="true">
        :
      </span>
      <CdBlock value={time.m} label="Min" />
      <span className="text-lg font-extrabold leading-none text-t4" aria-hidden="true">
        :
      </span>
      <CdBlock value={time.s} label="Seg" />
    </div>
  )
}
