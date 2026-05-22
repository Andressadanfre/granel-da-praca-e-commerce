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
      className="hidden md:flex"
      style={{
        flex: 1,
        maxWidth: '480px',
        alignItems: 'center',
        border: '1.5px solid #E5E7EB',
        borderRadius: '12px',
        backgroundColor: '#F9FAFB',
        overflow: 'hidden',
      }}
    >
      <label htmlFor="search-desktop" className="sr-only">
        Buscar produtos
      </label>

      <Search
        size={16}
        strokeWidth={1.6}
        aria-hidden="true"
        style={{ flexShrink: 0, marginLeft: '12px', color: '#9CA3AF' }}
      />

      <input
        id="search-desktop"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar produtos, categorias..."
        autoComplete="off"
        style={{
          flex: 1,
          height: '44px',
          padding: '0 12px',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontSize: '13px',
          color: '#111827',
          fontFamily: 'var(--font-poppins), sans-serif',
        }}
      />

      <button
        type="submit"
        aria-label="Buscar"
        style={{
          height: '44px',
          padding: '0 20px',
          backgroundColor: '#00B207',
          color: '#ffffff',
          border: 'none',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--font-poppins), sans-serif',
          flexShrink: 0,
          transition: 'background-color .18s cubic-bezier(.4,0,.2,1)',
        }}
      >
        Buscar
      </button>
    </form>
  )
}
