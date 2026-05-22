'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

// ─── Tipos ────────────────────────────────────────────────────────────────────
type CategoryLink = {
  href: string
  label: string
}

type Props = {
  categories: CategoryLink[]
}

// ─── Hook — breakpoint estático sem ResizeObserver ────────────────────────────
function useVisibleCount() {
  // Inicia com 0 para evitar mismatch de hidratação SSR/cliente
  const [count, setCount] = useState(0)

  useEffect(() => {
    function update() {
      const w = window.innerWidth
      if (w >= 1280)      setCount(7)
      else if (w >= 1024) setCount(5)
      else                setCount(999) // mobile/tablet: scroll livre
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return count
}

// ─── Componente ───────────────────────────────────────────────────────────────
export function CategoryBar({ categories }: Props) {
  const pathname     = usePathname()
  const visibleCount  = useVisibleCount()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownPos,  setDropdownPos]  = useState<{ top: number; left: number } | null>(null)
  const [showLeft,     setShowLeft]     = useState(false)
  const [showRight,    setShowRight]    = useState(false)
  const scrollRef        = useRef<HTMLDivElement>(null)
  const maisButtonRef    = useRef<HTMLButtonElement>(null)
  const dropdownPanelRef = useRef<HTMLDivElement>(null)

  const isMobile     = visibleCount === 999
  const isHydrated   = visibleCount > 0
  const visibleCats  = (!isHydrated || isMobile) ? categories : categories.slice(0, visibleCount)
  const overflowCats = (!isHydrated || isMobile) ? [] : categories.slice(visibleCount)

  // ── Setas de navegação ──────────────────────────────────────────────────────
  function updateArrows() {
    const el = scrollRef.current
    if (!el) return
    setShowLeft(el.scrollLeft > 8)
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows)
    return () => el.removeEventListener('scroll', updateArrows)
  }, [visibleCount])

  function scrollBy(px: number) {
    scrollRef.current?.scrollBy({ left: px, behavior: 'smooth' })
  }

  // ── Posição do dropdown (fora do overflow-x-auto do scroll) ─────────────────
  function updateDropdownPosition() {
    const btn = maisButtonRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    setDropdownPos({ top: rect.bottom + 4, left: rect.left })
  }

  useEffect(() => {
    if (!dropdownOpen) return
    updateDropdownPosition()
    window.addEventListener('resize', updateDropdownPosition)
    const scrollEl = scrollRef.current
    scrollEl?.addEventListener('scroll', updateDropdownPosition)
    return () => {
      window.removeEventListener('resize', updateDropdownPosition)
      scrollEl?.removeEventListener('scroll', updateDropdownPosition)
    }
  }, [dropdownOpen, visibleCount])

  // ── Fecha dropdown ao clicar fora (click, não mousedown — evita corrida) ──
  useEffect(() => {
    if (!dropdownOpen) return
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (maisButtonRef.current?.contains(target)) return
      if (dropdownPanelRef.current?.contains(target)) return
      setDropdownOpen(false)
    }
    document.addEventListener('click', onClickOutside)
    return () => document.removeEventListener('click', onClickOutside)
  }, [dropdownOpen])

  // ── Classes base reutilizáveis ──────────────────────────────────────────────
  // Tailwind para estrutura · style apenas para tokens do DS
  const linkBase = 'flex items-center gap-1.5 px-2.5 py-2.5 text-[13px] font-semibold whitespace-nowrap no-underline shrink-0 transition-colors duration-150 border-t-2 border-l-2 border-r-2 border-transparent'

  return (
    <div className="relative w-full">

      {/* Seta esquerda */}
      {!isMobile && showLeft && (
        <button
          onClick={() => scrollBy(-200)}
          aria-label="Rolar categorias para a esquerda"
          className="absolute left-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center border-none cursor-pointer"
          style={{ background: 'linear-gradient(to right, #002603 60%, transparent)', color: 'rgba(255,255,255,.8)' }}
        >
          <ChevronLeft size={18} strokeWidth={1.6} />
        </button>
      )}

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="hide-scrollbar flex items-center overflow-x-auto w-full"
      >
        {!isMobile && showLeft && <div className="shrink-0 w-12" aria-hidden="true" />}

        <Link
          href="/loja"
          className={`${linkBase} gap-2 ${pathname === '/loja' ? 'border-b-[#00B207]' : 'border-b-transparent'}`}
          style={{ color: pathname === '/loja' ? '#ffffff' : 'rgba(255,255,255,.65)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3"  y="3"  width="7" height="7" />
            <rect x="14" y="3"  width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3"  y="14" width="7" height="7" />
          </svg>
          Ver tudo
        </Link>

        {/* Categorias visíveis */}
        {visibleCats.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className={`${linkBase} nav-cat-link`}
            style={{ color: 'rgba(255,255,255,.65)', borderBottom: '2px solid transparent' }}
          >
            {cat.label}
          </Link>
        ))}

        {/* Botão Mais — só desktop com overflow */}
        {!isMobile && overflowCats.length > 0 && (
          <button
            ref={maisButtonRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setDropdownOpen((open) => {
                const next = !open
                if (next) updateDropdownPosition()
                return next
              })
            }}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            className={`${linkBase} bg-transparent cursor-pointer`}
            style={{
              color: dropdownOpen ? '#ffffff' : 'rgba(255,255,255,.65)',
              borderBottom: dropdownOpen ? '2px solid #00B207' : '2px solid transparent',
            }}
          >
            Mais
            <ChevronDown
              size={13}
              strokeWidth={1.6}
              className="transition-transform duration-[180ms]"
              style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
        )}

        {/* Espaço para seta direita — no fim do track de scroll */}
        {!isMobile && showRight && <div className="shrink-0 w-12" aria-hidden="true" />}
      </div>

      {/* Dropdown — fixed para não ser cortado por overflow-x-auto */}
      {dropdownOpen && overflowCats.length > 0 && dropdownPos && (
        <div
          ref={dropdownPanelRef}
          role="menu"
          className="fixed z-[100] min-w-[220px] rounded-xl py-2"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            backgroundColor: '#ffffff',
            boxShadow: '0 8px 32px rgba(0,0,0,.12)',
          }}
        >
          {overflowCats.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              role="menuitem"
              onClick={() => setDropdownOpen(false)}
              className="dropdown-cat-link block px-4 py-2.5 text-[13px] font-medium no-underline transition-colors duration-150"
              style={{ color: '#111827' }}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      )}

      {/* Seta direita */}
      {!isMobile && showRight && (
        <button
          onClick={() => scrollBy(200)}
          aria-label="Rolar categorias para a direita"
          className="absolute right-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center border-none cursor-pointer"
          style={{ background: 'linear-gradient(to left, #002603 60%, transparent)', color: 'rgba(255,255,255,.8)' }}
        >
          <ChevronRight size={18} strokeWidth={1.6} />
        </button>
      )}

    </div>
  )
}
