import Link from 'next/link'
import { Shield, Wheat, Zap, Beef, ShieldPlus, Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface ObjetivoCard {
  label: string
  query: string
  icon: React.ReactNode
}

// ─── Dados estáticos — termos verificados no Supabase (ILIKE string única) ────
const OBJETIVOS: ObjetivoCard[] = [
  { label: 'Antioxidantes', query: 'Antioxidante', icon: <Shield size={28} strokeWidth={1.6} aria-hidden /> },
  { label: 'Fibras', query: 'Fibras', icon: <Wheat size={28} strokeWidth={1.6} aria-hidden /> },
  { label: 'Energia', query: 'Energia', icon: <Zap size={28} strokeWidth={1.6} aria-hidden /> },
  { label: 'Proteína', query: 'Proteína', icon: <Beef size={28} strokeWidth={1.6} aria-hidden /> },
  { label: 'Imunidade', query: 'Imunidade', icon: <ShieldPlus size={28} strokeWidth={1.6} aria-hidden /> },
  { label: 'Vegano', query: 'Vegano', icon: <Leaf size={28} strokeWidth={1.6} aria-hidden /> },
]

// ─── Componente principal ──────────────────────────────────────────────────────
export default function CompreObjetivoSection() {
  return (
    <section className="bg-cream py-14 lg:py-20" aria-label="Compre por objetivo">
      <div className="max-w-[1280px] mx-auto px-5 xl:px-0">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-g" aria-hidden="true" />
            <span className="text-[12px] font-semibold text-gd uppercase tracking-[.08em]">
              Encontre o que você precisa
            </span>
          </div>
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-gdeep leading-tight">
            Compre por objetivo
          </h2>
        </div>

        <ul className="grid grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 list-none m-0 p-0">
          {OBJETIVOS.map((obj) => (
            <li key={obj.query}>
              <Link
                href={`/loja?q=${encodeURIComponent(obj.query)}`}
                className={cn(
                  'group flex flex-col items-center gap-3 lg:gap-4',
                  'px-3 py-5 lg:px-4 lg:py-8',
                  'rounded-card text-center no-underline',
                  'transition-all duration-[180ms] ease-[cubic-bezier(.4,0,.2,1)]',
                  'hover:-translate-y-[10px]',
                  'bg-white border border-transparent',
                  'shadow-[0_4px_20px_rgba(0,0,0,.03)]',
                  'hover:shadow-[0_16px_48px_rgba(0,38,3,.10),_0_4px_12px_rgba(0,38,3,.05)]',
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full flex-shrink-0 bg-icon-bg',
                    'transition-all duration-[180ms] ease-[cubic-bezier(.4,0,.2,1)]',
                    'group-hover:scale-110',
                  )}
                  style={{ width: 60, height: 60 }}
                  aria-hidden="true"
                >
                  <span className="text-gd">{obj.icon}</span>
                </div>
                <span className="text-[12px] font-semibold leading-[1.4] tracking-[.01em] text-t9 transition-colors duration-[180ms]">
                  {obj.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
