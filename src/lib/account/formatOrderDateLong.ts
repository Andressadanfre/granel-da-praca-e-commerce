const MONTHS_PT = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const

const SP_PARTS_FORMAT = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/**
 * Formata created_at ISO para a Minha Conta, no relógio de America/Sao_Paulo.
 * Ex.: "21 de julho de 2026 · 14:32"
 */
export function formatOrderDateLong(iso: string): string {
  const parts = SP_PARTS_FORMAT.formatToParts(new Date(iso))
  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? ''
  const day = Number(get('day'))
  const month = MONTHS_PT[Number(get('month')) - 1]
  return `${day} de ${month} de ${get('year')} · ${get('hour')}:${get('minute')}`
}
