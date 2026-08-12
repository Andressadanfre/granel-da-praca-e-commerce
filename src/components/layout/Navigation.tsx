// src/components/layout/Navigation.tsx
// Server Component — sem 'use client'

import Link from 'next/link'
import Image from 'next/image'
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
      href:  `/loja?categoria=${c.slug}`,
      label: c.name,
    }))
  } catch {
    return []
  }
}

// ─── Componente ───────────────────────────────────────────────────────────────

async function getUserEmail(): Promise<string | null> {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email ?? null
}

export async function Navigation() {
  const [categories, userEmail] = await Promise.all([getCategories(), getUserEmail()])

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
            <Image
              src="/images/logo-green.png"
              alt=""
              width={210}
              height={44}
              priority
              className="h-11 w-auto"
            />
          </Link>

          {/* Busca desktop */}
          <SearchBar />

          {/* Ações */}
          <div className="flex items-center gap-s2 shrink-0">
            <UserMenuPopover userEmail={userEmail} />

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
