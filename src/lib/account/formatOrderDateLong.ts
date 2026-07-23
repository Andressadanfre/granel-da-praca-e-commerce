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

/**
 * Formata created_at ISO para a Minha Conta.
 * Ex.: "21 de julho de 2026 · 14:32"
 */
export function formatOrderDateLong(iso: string): string {
  const date = new Date(iso)
  const day = date.getDate()
  const month = MONTHS_PT[date.getMonth()]
  const year = date.getFullYear()
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${day} de ${month} de ${year} · ${hh}:${mm}`
}
