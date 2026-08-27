import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface ObjetivoCard {
  label: string
  query: string
  imageSrc: string
}

// ─── Dados estáticos — termos verificados no Supabase (ILIKE string única) ────
const OBJETIVOS: ObjetivoCard[] = [
  { label: 'Antioxidantes', query: 'Antioxidante', imageSrc: '/images/objetivos/antioxidantes.webp' },
  { label: 'Fibras', query: 'Fibras', imageSrc: '/images/objetivos/fibras.webp' },
  { label: 'Energia', query: 'Energia', imageSrc: '/images/objetivos/energia.webp' },
  { label: 'Proteína', query: 'Proteína', imageSrc: '/images/objetivos/proteinas.webp' },
  { label: 'Imunidade', query: 'Imunidade', imageSrc: '/images/objetivos/imunidade.webp' },
  { label: 'Vegano', query: 'Vegano', imageSrc: '/images/objetivos/veganos.webp' },
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

        <ul
          className={cn(
            'flex lg:grid lg:grid-cols-6',
            'gap-4 lg:gap-4',
            'overflow-x-auto lg:overflow-visible',
            'snap-x snap-mandatory scroll-smooth',
            '[&::-webkit-scrollbar]:hidden',
            'list-none m-0 p-0',
          )}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {OBJETIVOS.map((obj) => (
            <li key={obj.query} className="flex-shrink-0 w-[30vw] min-w-[110px] lg:w-auto snap-start">
              <Link
                href={`/loja?q=${encodeURIComponent(obj.query)}`}
                className="group flex flex-col items-center gap-2 lg:gap-3 no-underline"
              >
                <div
                  className={cn(
                    'relative w-full aspect-square overflow-hidden rounded-card bg-icon-bg',
                    'transition-all duration-[180ms] ease-[cubic-bezier(.4,0,.2,1)]',
                    'shadow-[0_4px_20px_rgba(0,0,0,.03)]',
                    'group-hover:-translate-y-[10px]',
                    'group-hover:shadow-[0_16px_48px_rgba(0,38,3,.10),_0_4px_12px_rgba(0,38,3,.05)]',
                  )}
                >
                  <Image
                    src={obj.imageSrc}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 30vw, 190px"
                  />
                </div>
                <span className="text-[12px] lg:text-[13px] font-semibold text-center leading-[1.4] tracking-[.01em] text-t9 transition-colors duration-[180ms]">
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
