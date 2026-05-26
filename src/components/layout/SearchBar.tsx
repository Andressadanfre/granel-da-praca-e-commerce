// src/components/layout/SearchBar.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    router.push(`/loja?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="hidden md:flex flex-1 max-w-[480px] items-center border-[1.5px] border-bd rounded-inner bg-surface overflow-hidden"
    >
      <label htmlFor="search-desktop" className="sr-only">
        Buscar produtos
      </label>

      <Search
        size={16}
        strokeWidth={1.6}
        aria-hidden="true"
        className="shrink-0 ml-3 text-t4"
      />

      <input
        id="search-desktop"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar produtos, categorias..."
        autoComplete="off"
        className="flex-1 h-11 px-3 bg-transparent border-0 outline-none text-[13px] text-t9"
      />

      <button
        type="submit"
        aria-label="Buscar"
        className="h-11 px-5 bg-g hover:bg-ghover text-white border-0 text-[13px] font-semibold cursor-pointer shrink-0 transition-colors duration-[180ms]"
      >
        Buscar
      </button>
    </form>
  )
}
