'use client'

import { useState } from 'react'

const selectClass =
  'h-9 rounded-input border border-bd bg-white px-2.5 text-[12px] text-t6 outline-none focus:border-g'

interface PeriodoFilterInputsProps {
  periodoInicial: string
  deInicial: string | undefined
  ateInicial: string | undefined
}

export function PeriodoFilterInputs({
  periodoInicial,
  deInicial,
  ateInicial,
}: PeriodoFilterInputsProps) {
  const [periodo, setPeriodo] = useState(periodoInicial)

  return (
    <>
      <select
        name="periodo"
        value={periodo}
        onChange={e => setPeriodo(e.target.value)}
        className={selectClass}
      >
        <option value="sempre">Todos os períodos</option>
        <option value="hoje">Hoje</option>
        <option value="ontem">Ontem</option>
        <option value="7dias">Últimos 7 dias</option>
        <option value="personalizado">Período personalizado</option>
      </select>
      {periodo === 'personalizado' && (
        <>
          <input
            type="date"
            name="de"
            defaultValue={deInicial ?? ''}
            className={selectClass}
            required
          />
          <input
            type="date"
            name="ate"
            defaultValue={ateInicial ?? ''}
            className={selectClass}
            required
          />
        </>
      )}
    </>
  )
}
