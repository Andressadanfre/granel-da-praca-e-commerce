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
  if (diff <= 0) return null
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
    <div className="relative flex min-w-[56px] flex-col items-center gap-1.5 overflow-hidden rounded-[14px] border border-white/20 bg-white/10 px-3 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,.2),inset_0_1px_0_rgba(255,255,255,.15)] md:min-w-[72px] md:px-[18px] md:py-3.5">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />
      <span className="text-[22px] font-extrabold leading-none tracking-[-0.03em] text-white tabular-nums [text-shadow:0_2px_8px_rgba(0,0,0,.3)] md:text-[32px]">
        {value}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/55">
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
      className={cn('mb-9 flex flex-wrap items-center gap-1.5', className)}
      aria-live="polite"
      aria-label="Contagem regressiva até o fim das ofertas"
    >
      <CdBlock value={time.h} label="Horas" />
      <span className="pb-[18px] text-[28px] font-extrabold leading-none text-white/40 [text-shadow:0_0_12px_rgba(134,239,172,.4)]">
        :
      </span>
      <CdBlock value={time.m} label="Min" />
      <span className="pb-[18px] text-[28px] font-extrabold leading-none text-white/40 [text-shadow:0_0_12px_rgba(134,239,172,.4)]">
        :
      </span>
      <CdBlock value={time.s} label="Seg" />
    </div>
  )
}
