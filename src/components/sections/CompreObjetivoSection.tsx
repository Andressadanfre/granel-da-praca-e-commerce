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
                    'relative h-[60px] w-[60px] overflow-hidden rounded-full flex-shrink-0 bg-icon-bg',
                    'transition-transform duration-[180ms] ease-[cubic-bezier(.4,0,.2,1)]',
                    'group-hover:scale-110',
                  )}
                  aria-hidden="true"
                >
                  <Image
                    src={obj.imageSrc}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="60px"
                  />
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
