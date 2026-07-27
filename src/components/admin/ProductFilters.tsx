'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { CategoriaOption } from '@/lib/admin/products'

interface ProductFiltersProps {
  categorias: CategoriaOption[]
}

const selectClass =
  'h-9 rounded-input border border-bd bg-white px-2.5 text-[12px] text-t6 outline-none focus:border-g'

export function ProductFilters({ categorias }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [searchValue, setSearchValue] = useState(searchParams.get('busca') ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSearchValue(searchParams.get('busca') ?? '')
  }, [searchParams])

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }
      params.delete('pagina')
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [pathname, router, searchParams],
  )

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => updateParams({ busca: value }), 300)
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5">
      <div className="relative min-w-[240px] flex-1">
        <Search
          size={14}
          strokeWidth={1.6}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-t4"
          aria-hidden
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar por nome ou categoria..."
          className="h-9 w-full rounded-input border border-bd bg-white pl-8 pr-3 text-[12px] text-t9 outline-none placeholder:text-t4 focus:border-g"
        />
      </div>

      <select
        className={cn(selectClass)}
        value={searchParams.get('categoria') ?? ''}
        onChange={(e) => updateParams({ categoria: e.target.value })}
      >
        <option value="">Todas as categorias</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        className={cn(selectClass)}
        value={searchParams.get('tipo') ?? ''}
        onChange={(e) => updateParams({ tipo: e.target.value })}
      >
        <option value="">Tipo: Todos</option>
        <option value="granel">Granel</option>
        <option value="unit">Unitário</option>
      </select>

      <select
        className={cn(selectClass)}
        value={searchParams.get('ordenar') ?? 'nome_asc'}
        onChange={(e) => updateParams({ ordenar: e.target.value })}
      >
        <option value="nome_asc">Ordenar: Nome A-Z</option>
        <option value="nome_desc">Nome Z-A</option>
        <option value="preco_asc">Preço crescente</option>
        <option value="preco_desc">Preço decrescente</option>
        <option value="estoque_critico">Estoque crítico primeiro</option>
        <option value="sem_foto">Sem foto primeiro</option>
      </select>
    </div>
  )
}
