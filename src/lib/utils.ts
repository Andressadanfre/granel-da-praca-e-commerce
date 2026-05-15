import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formata centavos para BRL — ex: 1290 → "R$ 12,90"
export function formatBRL(centavos: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(centavos / 100)
}

// Formata gramas — ex: 100 → "100 gr" | 1000 → "1 kg" | 1500 → "1,5 kg"
export function formatGrams(grams: number): string {
  if (grams < 1000) return ${grams} gr
  const kg = grams / 1000
  const formatted = kg % 1 === 0
    ? kg.toFixed(0)
    : parseFloat(kg.toFixed(1)).toString().replace('.', ',')
  return ${formatted} kg
}

// Formata data do banco (YYYY-MM-DD) para UI (DD/MM/AAAA)
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return ${d}//
}
