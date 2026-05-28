// src/components/layout/Navigation.tsx
// Server Component — sem 'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'

import { getSupabaseServer } from '@/lib/supabase/server'

import { CategoryBar }     from './CategoryBar'
import { UserMenuPopover } from './UserMenuPopover'
import { MobileNavDrawer } from './MobileNavDrawer'
import { SearchBar }       from './SearchBar'
import { CartIcon }        from './CartIcon'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryLink {
  href:  string
  label: string
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getCategories(): Promise<CategoryLink[]> {
  try {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from('categories')
      .select('name, slug')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error || !data) return []

    return data.map((c) => ({
      href:  `/categoria/${c.slug}`,
      label: c.name,
    }))
  } catch {
    return []
  }
}

// ─── Componente ───────────────────────────────────────────────────────────────

export async function Navigation() {
  const categories = await getCategories()

  return (
    <header className="sticky top-0 z-50 bg-cream shadow-nav font-sans">

      {/* ── ROW 1 — Announcement Bar ───────────────────────────── */}
      <div className="bg-gdeep h-9 flex items-center justify-center overflow-hidden">

        {/* Desktop: duas mensagens alternadas via Tailwind keyframes */}
        <div className="hidden md:block relative w-full h-9 overflow-hidden">
          <p className="animate-ann-slide absolute inset-0 flex items-center justify-center text-white text-xs font-medium whitespace-nowrap m-0">
            🎉 10% OFF na sua primeira compra acima de R$&nbsp;150
          </p>
          <p className="animate-ann-slide-2 absolute inset-0 flex items-center justify-center text-white text-xs font-medium whitespace-nowrap m-0">
            🚚 Frete GRÁTIS nas compras acima de R$&nbsp;100,00
          </p>
        </div>

        {/* Mobile: mensagem única */}
        <p className="md:hidden text-white text-[11px] font-medium whitespace-nowrap m-0">
          🚚 Frete GRÁTIS acima de R$&nbsp;100,00
        </p>
      </div>

      {/* ── ROW 2 — Main Header ────────────────────────────────── */}
      <div className="border-b border-gray-100">
        <div className="max-w-container mx-auto px-4 md:px-s10 h-16 md:h-[93px] flex items-center justify-between gap-s3">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-s3 shrink-0 no-underline"
            aria-label="Granel da Praça — página inicial"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="20" cy="20" r="20" fill="#002603" />
              <path d="M20 30 C13 26 10 19 13 13 C16 8 22 8 24 13 C26 18 24 26 20 30Z" fill="#00B207" />
              <path d="M20 30 C27 26 30 19 27 13 C25 9 21 10 20 14 C19 18 20 26 20 30Z" fill="#2C742F" />
              <line x1="20" y1="30" x2="20" y2="34" stroke="#00B207" strokeWidth="1.6" strokeLinecap="round" />
              <ellipse cx="16" cy="22" rx="2.5" ry="1.5" fill="#F9F5EF" opacity="0.7" transform="rotate(-20 16 22)" />
              <ellipse cx="24" cy="22" rx="2.5" ry="1.5" fill="#F9F5EF" opacity="0.5" transform="rotate(20 24 22)" />
            </svg>

            <div className="leading-[1.2]">
              <div className="text-sm font-bold text-gdeep tracking-[-0.01em]">
                Granel da Praça
              </div>
              <div className="text-[9px] font-medium text-g uppercase tracking-[0.08em]">
                Produtos Naturais
              </div>
            </div>
          </Link>

          {/* Busca desktop */}
          <SearchBar />

          {/* Ações */}
          <div className="flex items-center gap-s2 shrink-0">
            <UserMenuPopover />

            <Link
              href="/favoritos"
              aria-label="Favoritos"
              className="flex items-center justify-center w-11 h-11 text-t5 no-underline rounded-sel transition-colors duration-[180ms] ease-in-out hover:text-gdeep"
            >
              <Heart size={20} strokeWidth={1.6} />
            </Link>

            <CartIcon />
            <MobileNavDrawer links={categories} />
          </div>
        </div>
      </div>

      {/* ── ROW 3 — Category NavBar ────────────────────────────── */}
      <nav
        aria-label="Categorias"
        className="bg-gdeep border-t border-[rgba(255,255,255,.08)]"
      >
        <div className="max-w-container mx-auto px-4 md:px-s10 h-[58px] flex items-center">
          <CategoryBar categories={categories} />
        </div>
      </nav>
    </header>
  )
}
