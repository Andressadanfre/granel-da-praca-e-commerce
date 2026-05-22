'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, Search } from 'lucide-react'

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
        className="md:hidden"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '44px',
          height: '44px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#6B7280',
          borderRadius: '10px',
        }}
      >
        <Search size={20} strokeWidth={1.6} />
      </button>

      {/* Hambúrguer */}
      <button
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="md:hidden"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '44px',
          height: '44px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#374151',
          borderRadius: '10px',
        }}
      >
        {open ? <X size={22} strokeWidth={1.6} /> : <Menu size={22} strokeWidth={1.8} />}
      </button>

      {/* Busca mobile */}
      {searchOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            padding: '12px 20px',
            borderBottom: '1px solid #E5E7EB',
            zIndex: 49,
          }}
        >
          <form onSubmit={handleSearch} role="search" style={{ position: 'relative' }}>
            <label htmlFor="search-mobile" className="sr-only">
              Buscar produtos
            </label>
            <svg
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF',
                pointerEvents: 'none',
              }}
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
              style={{
                width: '100%',
                height: '44px',
                paddingLeft: '40px',
                paddingRight: '16px',
                borderRadius: '12px',
                border: '1.5px solid #E5E7EB',
                backgroundColor: '#F9FAFB',
                fontSize: '13px',
                outline: 'none',
                fontFamily: 'var(--font-poppins), sans-serif',
              }}
            />
          </form>
        </div>
      )}

      {/* Drawer de navegação mobile */}
      {open && (
        <div
          className="md:hidden"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderTop: '1px solid #E5E7EB',
            boxShadow: '0 8px 24px rgba(0,0,0,.08)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            padding: '8px 0 12px',
          }}
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: 600,
                color: link.promo ? '#DC2626' : link.active ? '#002603' : '#374151',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background .12s',
              }}
            >
              {link.label}
              {link.badge && (
                <span
                  style={{
                    backgroundColor: '#00B207',
                    color: '#ffffff',
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '100px',
                  }}
                >
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
