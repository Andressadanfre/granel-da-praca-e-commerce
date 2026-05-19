import type { ReactNode } from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Category {
  slug: string
  name: string
  count: number
  icon: ReactNode
  isAll?: boolean
}

// ─── Ícones SVG inline — paths exatos do HTML aprovado ───────────────────────
const IconOleaginosas = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10c0-1.5-.3-2.9-.9-4.2"/>
    <path d="M12 6v6l4 2"/>
  </svg>
)

const IconGraos = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10A10 10 0 0 1 2 12 10 10 0 0 1 12 2"/>
    <path d="M12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
)

const IconFarinhas = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2h18v4H3zM3 6l2 14h14l2-14"/>
    <line x1="12" y1="6" x2="12" y2="20"/>
    <line x1="7.5" y1="6" x2="7" y2="20"/>
    <line x1="16.5" y1="6" x2="17" y2="20"/>
  </svg>
)

const IconChas = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="2" x2="6" y2="4"/>
    <line x1="10" y1="2" x2="10" y2="4"/>
    <line x1="14" y1="2" x2="14" y2="4"/>
  </svg>
)

const IconSuperalimentos = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
)

const IconVerTudo = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
)

// ─── Dados estáticos ──────────────────────────────────────────────────────────
const CATEGORIES: Category[] = [
  { slug: 'oleaginosas', name: 'Castanhas & Oleaginosas', count: 48, icon: <IconOleaginosas /> },
  { slug: 'graos', name: 'Grãos & Leguminosas', count: 62, icon: <IconGraos /> },
  { slug: 'farinhas', name: 'Farinhas & Cereais', count: 55, icon: <IconFarinhas /> },
  { slug: 'chas', name: 'Chás & Infusões', count: 38, icon: <IconChas /> },
  { slug: 'superalimentos', name: 'Superalimentos', count: 29, icon: <IconSuperalimentos /> },
  { slug: '', name: 'Ver tudo', count: 396, icon: <IconVerTudo />, isAll: true },
]

// ─── Componente ───────────────────────────────────────────────────────────────
export default function CategoryGrid() {
  return (
    <section
      className="bg-[#F9F5EF] py-14 lg:py-20"
      aria-label="Categorias de produtos"
    >
      <div className="max-w-[1280px] mx-auto px-5 xl:px-0">

        {/* Header da seção */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B207]" aria-hidden="true" />
            <span className="text-[12px] font-semibold text-[#2C742F] uppercase tracking-[.08em]">
              Explore por categoria
            </span>
          </div>
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[#002603] leading-tight">
            O que você está buscando?
          </h2>
        </div>

        {/* Grid — 3 colunas mobile/tablet · 6 desktop */}
        <ul className="grid grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 list-none m-0 p-0">
          {CATEGORIES.map((cat) => (
            <li key={cat.slug || 'all'}>
              <Link
                href={cat.isAll ? '/loja' : `/loja/${cat.slug}`}
                className={cn(
                  // Base — layout
                  'group flex flex-col items-center gap-3 lg:gap-4',
                  'px-3 py-5 lg:px-4 lg:py-8',
                  'rounded-[20px] text-center no-underline',
                  // Transições
                  'transition-all duration-[180ms] ease-[cubic-bezier(.4,0,.2,1)]',
                  // Hover — sobe 10px + sombra DS v3.1
                  'hover:-translate-y-[10px]',

                  // Variante normal
                  !cat.isAll && [
                    'bg-white',
                    'shadow-[0_4px_20px_rgba(0,0,0,.03)]',
                    'hover:shadow-[0_16px_48px_rgba(0,38,3,.10),_0_4px_12px_rgba(0,38,3,.05)]',
                  ],

                  // Variante "Ver tudo" — borda tracejada
                  cat.isAll && [
                    'bg-[rgba(0,178,7,.03)]',
                    'border border-dashed border-[rgba(0,178,7,.35)]',
                    'shadow-none',
                    'hover:bg-[#00B207] hover:border-[#00B207]',
                    'hover:shadow-[0_16px_48px_rgba(0,178,7,.20),_0_4px_12px_rgba(0,178,7,.12)]',
                  ],
                )}
              >
                {/* Container do ícone — 60×60px fixo, DS v3.1 */}
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full flex-shrink-0',
                    'transition-all duration-[180ms] ease-[cubic-bezier(.4,0,.2,1)]',
                    // Escala sutil no hover
                    'group-hover:scale-105',

                    !cat.isAll && 'bg-[#F0FDF4] group-hover:bg-[#DCFCE7]',
                    cat.isAll && 'bg-[rgba(0,178,7,.08)] border border-dashed border-[rgba(0,178,7,.25)] group-hover:bg-[rgba(255,255,255,.2)]',
                  )}
                  style={{ width: 60, height: 60 }}
                  aria-hidden="true"
                >
                  <span
                    className={cn(
                      'transition-all duration-[180ms] ease-[cubic-bezier(.4,0,.2,1)]',
                      'group-hover:scale-110',
                      !cat.isAll && 'text-[#2C742F]',
                      cat.isAll && 'text-[#00B207] group-hover:text-white',
                    )}
                  >
                    {cat.icon}
                  </span>
                </div>

                {/* Nome */}
                <span
                  className={cn(
                    'text-[12px] font-semibold leading-[1.4] tracking-[.01em]',
                    'transition-colors duration-[180ms]',
                    !cat.isAll && 'text-[#111827]',
                    cat.isAll && 'text-[#2C742F] font-bold group-hover:text-white',
                  )}
                >
                  {cat.name}
                </span>

                {/* Contagem */}
                <span
                  className={cn(
                    'text-[12px] font-medium uppercase tracking-[1px] mt-auto',
                    'transition-colors duration-[180ms]',
                    !cat.isAll && 'text-[#9CA3AF]',
                    cat.isAll && 'text-[#00B207] group-hover:text-[rgba(255,255,255,.8)]',
                  )}
                >
                  {cat.count} produtos
                </span>
              </Link>
            </li>
          ))}
        </ul>

      </div>
    </section>
  )
}
