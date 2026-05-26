'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavLink {
  href: string
  label: string
  active?: boolean
  promo?: boolean
  badge?: string
  icon?: string
}

export function MobileNavDrawer({ links }: { links: readonly NavLink[] }) {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    if (!trimmed) return
    setSearchOpen(false)
    router.push(`/loja?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <>
      {/* Botão de busca — mobile */}
      <button
        aria-label="Buscar"
        onClick={() => setSearchOpen((v) => !v)}
        className="md:hidden flex items-center justify-center w-11 h-11 bg-transparent border-0 cursor-pointer text-t5 rounded-sel"
      >
        <Search size={20} strokeWidth={1.6} />
      </button>

      {/* Hambúrguer */}
      <button
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="md:hidden flex items-center justify-center w-11 h-11 bg-transparent border-0 cursor-pointer text-t7 rounded-sel"
      >
        {open ? <X size={22} strokeWidth={1.6} /> : <Menu size={22} strokeWidth={1.8} />}
      </button>

      {/* Busca mobile */}
      {searchOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white py-3 px-5 border-b border-bd z-[49]">
          <form onSubmit={handleSearch} role="search" className="relative">
            <label htmlFor="search-mobile" className="sr-only">
              Buscar produtos
            </label>
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-t4 pointer-events-none"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="search-mobile"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar produtos..."
              autoFocus
              autoComplete="off"
              className="w-full h-11 pl-10 pr-4 rounded-inner border-[1.5px] border-bd bg-surface text-[13px] outline-none font-sans"
            />
          </form>
        </div>
      )}

      {/* Drawer de navegação mobile */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-bd shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-50 flex flex-col pt-2 pb-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'py-3 px-5 text-sm font-semibold no-underline flex items-center gap-2 transition-colors duration-[120ms]',
                link.promo ? 'text-red-600' : link.active ? 'text-gdeep' : 'text-t7'
              )}
            >
              {link.label}
              {link.badge && (
                <span className="bg-g text-white text-[9px] font-bold py-0.5 px-1.5 rounded-pill">
                  {link.badge}
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </>
  )
}
