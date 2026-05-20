// src/components/layout/Navigation.tsx
// Server Component — estrutura estática completa

import Link from 'next/link'
import { ShoppingCart, Heart } from 'lucide-react'

import { getSupabaseAdmin } from '@/lib/supabase/server'

import { CategoryBar } from './CategoryBar'
import { UserMenuPopover } from './UserMenuPopover'
import { MobileNavDrawer } from './MobileNavDrawer'

export async function Navigation({ cartCount = 0 }: { cartCount?: number }) {
  const supabase = getSupabaseAdmin()
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('name, slug')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const categories = (categoriesData ?? []).map((c) => ({
    href: `/categoria/${c.slug}`,
    label: c.name,
  }))

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,.06)',
        fontFamily: 'var(--font-poppins), sans-serif',
      }}
    >
      {/* ROW 1 — Announcement Bar */}
      <div style={{ backgroundColor: '#002603', height: '36px', position: 'relative', overflow: 'hidden' }}>
        <p className="ann-msg ann-msg-1" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap', margin: 0 }}>
          🎉 10% OFF na sua primeira compra acima de R$&nbsp;150
        </p>
        <p className="ann-msg ann-msg-2" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap', margin: 0 }}>
          🚚 Frete GRÁTIS nas compras acima de R$&nbsp;100,00
        </p>
      </div>

      {/* ROW 2 — Main Header */}
      <div style={{ borderBottom: '1px solid #F3F4F6' }}>
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 16px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
          className="md:px-10 md:h-[93px]"
        >
          {/* Logo */}
          <Link
            href="/"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, textDecoration: 'none' }}
            aria-label="Granel da Praça — página inicial"
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="#002603" />
              <path d="M20 30 C13 26 10 19 13 13 C16 8 22 8 24 13 C26 18 24 26 20 30Z" fill="#00B207" />
              <path d="M20 30 C27 26 30 19 27 13 C25 9 21 10 20 14 C19 18 20 26 20 30Z" fill="#2C742F" />
              <line x1="20" y1="30" x2="20" y2="34" stroke="#00B207" strokeWidth="2" strokeLinecap="round" />
              <ellipse cx="16" cy="22" rx="2.5" ry="1.5" fill="#F9F5EF" opacity="0.7" transform="rotate(-20 16 22)" />
              <ellipse cx="24" cy="22" rx="2.5" ry="1.5" fill="#F9F5EF" opacity="0.5" transform="rotate(20 24 22)" />
            </svg>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#002603', letterSpacing: '-0.01em' }}>
                Granel da Praça
              </div>
              <div style={{ fontSize: '9px', fontWeight: 500, color: '#00B207', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Produtos Naturais
              </div>
            </div>
          </Link>

          {/* Search — desktop only */}
          <div
            className="nav-search-wrap hidden md:flex"
            style={{
              flex: 1,
              maxWidth: '480px',
              position: 'relative',
              alignItems: 'center',
              border: '1.5px solid #E5E7EB',
              borderRadius: '12px',
              backgroundColor: '#F9FAFB',
            }}
          >
            <svg
              style={{ position: 'absolute', left: '12px', color: '#9CA3AF', pointerEvents: 'none', flexShrink: 0 }}
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar produtos, categorias..."
              style={{
                width: '100%',
                height: '44px',
                paddingLeft: '40px',
                paddingRight: '16px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                color: '#111827',
                fontFamily: 'var(--font-poppins), sans-serif',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* User menu — Client Component */}
            <UserMenuPopover />

            {/* Favoritos */}
            <Link
              href="/favoritos"
              aria-label="Favoritos"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                color: '#6B7280',
                textDecoration: 'none',
                borderRadius: '10px',
                transition: 'color .18s cubic-bezier(.4,0,.2,1)',
              }}
            >
              <Heart size={20} strokeWidth={1.6} />
            </Link>

            {/* Carrinho */}
            <Link
              href="/carrinho"
              aria-label={`Carrinho com ${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '44px',
                padding: '0 12px',
                backgroundColor: '#2C742F',
                color: '#ffffff',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
                position: 'relative',
                transition: 'background-color .18s cubic-bezier(.4,0,.2,1)',
                flexShrink: 0,
              }}
              className="nav-cart-btn"
            >
              <ShoppingCart size={16} strokeWidth={1.6} />
              <span className="hidden md:inline">Carrinho</span>
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '9px',
                    backgroundColor: '#00B207',
                    color: '#ffffff',
                    fontSize: '9px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff',
                  }}
                >
                  {`${cartCount}`}
                </span>
              )}
            </Link>

            {/* Mobile drawer trigger — Client Component */}
            <MobileNavDrawer links={categories} />
          </div>
        </div>
      </div>

      {/* ROW 3 — Category NavBar */}
      <nav
        aria-label="Categorias"
        style={{
          backgroundColor: '#002603',
          borderTop: '1px solid rgba(255,255,255,.08)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 40px',
            height: '58px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <CategoryBar
            categories={categories}
          />
        </div>
      </nav>
    </header>
  )
}
