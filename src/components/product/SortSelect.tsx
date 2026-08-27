'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const SORT_OPTIONS = [
  { value: 'relevancia', label: 'Relevância' },
  { value: 'menor_preco', label: 'Menor preço' },
  { value: 'maior_preco', label: 'Maior preço' },
  { value: 'mais_recentes', label: 'Mais recentes' },
] as const

export function SortSelect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    const value = e.target.value

    if (value === 'relevancia') {
      params.delete('ordenar')
    } else {
      params.set('ordenar', value)
    }
    params.delete('pagina')

    router.push(`/loja?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-sm font-medium text-t6 whitespace-nowrap">
        Ordenar por
      </label>
      <select
        id="sort-select"
        defaultValue={searchParams.get('ordenar') ?? 'relevancia'}
        onChange={handleChange}
        className="h-10 rounded-input border border-bd bg-white px-3 text-sm font-medium text-t9 cursor-pointer focus:outline-none focus:ring-2 focus:ring-g"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
