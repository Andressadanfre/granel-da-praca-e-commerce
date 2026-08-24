// src/components/layout/Navigation.tsx
// Server Component — sem 'use client'

import Link from 'next/link'
import Image from 'next/image'

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
    <>
      {/* ── ROW 1 — Announcement Bar (rola embora, sem sticky) ─── */}
      <div className="bg-gdeep h-9 flex items-center justify-center overflow-hidden font-sans">

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

      {/* ── ROW 2 — Main Header (sticky; sem overflow — painéis absolute) */}
      <header className="sticky top-0 z-50 h-16 bg-cream shadow-nav relative font-sans md:h-[93px]">
        <div className="border-b border-gray-100 h-full">
          <div className="max-w-container mx-auto px-4 md:px-s10 h-full flex items-center justify-between gap-s3">

            {/* Logo — completa (ícone + texto) em todos os breakpoints */}
            <Link
              href="/"
              className="flex h-8 shrink-0 items-center no-underline sm:h-11"
              aria-label="Granel da Praça — página inicial"
            >
              <Image
                src="/images/logo-green.png"
                alt=""
                width={210}
                height={44}
                priority
                className="h-8 w-auto sm:h-11"
              />
            </Link>

            {/* Busca desktop */}
            <SearchBar />

            {/* Ações — gap menor no mobile para caber a logo completa */}
            <div className="flex items-center gap-0.5 shrink-0 sm:gap-s2">
              <UserMenuPopover userEmail={userEmail} />

              <CartIcon />
              <MobileNavDrawer links={categories} />
            </div>
          </div>
        </div>
      </header>

      {/* ── ROW 3 — Category NavBar (sticky colada abaixo da ROW 2) */}
      <nav
        aria-label="Categorias"
        className="sticky top-16 z-40 bg-gdeep border-t border-[rgba(255,255,255,.08)] font-sans md:top-[93px]"
      >
        <div className="max-w-container mx-auto px-4 md:px-s10 h-[58px] flex items-center">
          <CategoryBar categories={categories} />
        </div>
      </nav>
    </>
  )
}
