import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getSupabaseAdmin } from '@/lib/supabase/server'

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface CategoryRow {
  id: number
  name: string
  slug: string
  sort_order: number
  product_count: number
}

// ─── Mapa slug → ícone (independente do banco) ───────────────────────────────
const SLUG_TO_ICON: Record<string, string> = {
  'castanhas':                  'nut',
  'graos-e-sementes':           'wheat',
  'temperos-e-especiarias':     'flame',
  'chas-e-infusoes':            'cup-saucer',
  'frutas-secas':               'apple',
  'snacks':                     'cookie',
  'chocolates-de-verdade':      'chocolate',
  'farinhas':                   'package',
  'suplementos-naturais':       'pill',
  'cosmeticos-naturais':        'sparkles',
  'oleos-e-adocantes-naturais': 'droplets',
}

// ─── Mapa de ícones SVG por icon_name do banco ────────────────────────────────
function CategoryIcon({ name }: { name: string }) {
  const props = {
    width: 28,
    height: 28,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (name) {
    case 'nut': return (
      <svg {...props}>
        <path d="M12 2C8 2 4 5 4 9c0 5 4 9 8 11 4-2 8-6 8-11 0-4-4-7-8-7z" />
        <path d="M12 7v5l3 2" />
      </svg>
    )
    case 'wheat': return (
      <svg {...props}>
        <path d="M2 22 16 8" />
        <path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94z" />
        <path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94z" />
        <path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94z" />
        <path d="M20 2v22" />
        <path d="M16 8.53 17.53 7 19 8.47a3.5 3.5 0 0 1 0 4.94L17.47 15 16 13.47a3.5 3.5 0 0 1 0-4.94z" />
        <path d="M16 4.53 17.53 3 19 4.47a3.5 3.5 0 0 1 0 4.94L17.47 11 16 9.47a3.5 3.5 0 0 1 0-4.94z" />
      </svg>
    )
    case 'flame': return (
      <svg {...props}>
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    )
    case 'cup-saucer': return (
      <svg {...props}>
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="2" x2="6" y2="4" />
        <line x1="10" y1="2" x2="10" y2="4" />
        <line x1="14" y1="2" x2="14" y2="4" />
      </svg>
    )
    case 'apple': return (
      <svg {...props}>
        <path d="M12 20.94c1.5 0 2.75-.6 3.7-1.52M12 20.94c-1.5 0-2.75-.6-3.7-1.52M12 20.94V8" />
        <path d="M8.3 19.42C6.4 18 5 15.76 5 13c0-3.87 3.13-7 7-7s7 3.13 7 7c0 2.76-1.4 5-3.3 6.42" />
        <path d="M12 8c0-2 1-4 3-5" />
      </svg>
    )
    case 'cookie': return (
      <svg {...props}>
        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
        <path d="M8.5 8.5v.01" />
        <path d="M16 15.5v.01" />
        <path d="M12 12v.01" />
        <path d="M11 17v.01" />
        <path d="M7 14v.01" />
      </svg>
    )
    case 'chocolate': return (
      <svg {...props}>
        <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="10" x2="9" y2="21" />
        <line x1="15" y1="10" x2="15" y2="21" />
      </svg>
    )
    case 'package': return (
      <svg {...props}>
        <path d="M16.5 9.4 7.55 4.24" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    )
    case 'pill': return (
      <svg {...props}>
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z" />
        <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
      </svg>
    )
    case 'sparkles': return (
      <svg {...props}>
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        <path d="M20 3v4" />
        <path d="M22 5h-4" />
        <path d="M4 17v2" />
        <path d="M5 18H3" />
      </svg>
    )
    case 'droplets': return (
      <svg {...props}>
        <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
        <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
      </svg>
    )
    default: return (
      <svg {...props}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    )
  }
}

// ─── Card "Ver tudo" ──────────────────────────────────────────────────────────
function VerTudoCard({ totalCount }: { totalCount: number }) {
  return (
    <li>
      <Link
        href="/loja"
        className={cn(
          'group flex flex-col items-center gap-3 lg:gap-4',
          'px-3 py-5 lg:px-4 lg:py-8',
          'rounded-[20px] text-center no-underline',
          'transition-all duration-[180ms] ease-[cubic-bezier(.4,0,.2,1)]',
          'hover:-translate-y-[10px]',
          'bg-[rgba(0,178,7,.03)]',
          'border border-dashed border-[rgba(0,178,7,.35)]',
          'shadow-none',
          'hover:bg-[#00B207] hover:border-[#00B207]',
          'hover:shadow-[0_16px_48px_rgba(0,178,7,.20),_0_4px_12px_rgba(0,178,7,.12)]',
        )}
      >
        <div
          className={cn(
            'flex items-center justify-center rounded-full flex-shrink-0',
            'transition-all duration-[180ms] ease-[cubic-bezier(.4,0,.2,1)]',
            'group-hover:scale-105',
            'bg-[rgba(0,178,7,.08)] border border-dashed border-[rgba(0,178,7,.25)]',
            'group-hover:bg-[rgba(255,255,255,.2)]',
          )}
          style={{ width: 60, height: 60 }}
          aria-hidden="true"
        >
          <span className="text-[#00B207] group-hover:text-white transition-all duration-[180ms]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </span>
        </div>
        <span className={cn(
          'text-[12px] font-bold leading-[1.4] tracking-[.01em]',
          'transition-colors duration-[180ms]',
          'text-[#2C742F] group-hover:text-white',
        )}>
          Ver tudo
        </span>
        <span className={cn(
          'text-[12px] font-medium uppercase tracking-[1px] mt-auto',
          'transition-colors duration-[180ms]',
          'text-[#00B207] group-hover:text-[rgba(255,255,255,.8)]',
        )}>
          {totalCount} produtos
        </span>
      </Link>
    </li>
  )
}

// ─── Componente principal — Server Component ──────────────────────────────────
export default async function CategoryGrid() {
  const supabase = getSupabaseAdmin()

  const { data } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      slug,
      sort_order,
      products!inner(id)
    `)
    .eq('is_active', true)
    .eq('products.is_deleted', false)
    .order('sort_order', { ascending: true })

  const categories: CategoryRow[] = (data ?? []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    sort_order: cat.sort_order,
    product_count: Array.isArray(cat.products) ? cat.products.length : cat.products ? 1 : 0,
  }))

  const totalCount = categories.reduce((acc, c) => acc + c.product_count, 0)

  // erro silencioso — fallback já aplicado com data ?? []

  return (
    <section
      className="bg-cream py-14 lg:py-20"
      aria-label="Categorias de produtos"
    >
      <div className="max-w-[1280px] mx-auto px-5 xl:px-0">
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

        <ul className="grid grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 list-none m-0 p-0">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/loja/${cat.slug}`}
                className={cn(
                  'group flex flex-col items-center gap-3 lg:gap-4',
                  'px-3 py-5 lg:px-4 lg:py-8',
                  'rounded-[20px] text-center no-underline',
                  'transition-all duration-[180ms] ease-[cubic-bezier(.4,0,.2,1)]',
                  'hover:-translate-y-[10px]',
                  'bg-white border border-transparent',
                  'shadow-[0_4px_20px_rgba(0,0,0,.03)]',
                  'hover:shadow-[0_16px_48px_rgba(0,38,3,.10),_0_4px_12px_rgba(0,38,3,.05)]',
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full flex-shrink-0',
                    'transition-all duration-[180ms] ease-[cubic-bezier(.4,0,.2,1)]',
                    'group-hover:scale-105',
                    'bg-[#F0FDF4] group-hover:bg-[#DCFCE7]',
                  )}
                  style={{ width: 60, height: 60 }}
                  aria-hidden="true"
                >
                  <span className="text-[#2C742F] group-hover:scale-110 transition-all duration-[180ms]">
                    <CategoryIcon name={SLUG_TO_ICON[cat.slug] ?? ''} />
                  </span>
                </div>
                <span className="text-[12px] font-semibold leading-[1.4] tracking-[.01em] text-[#111827] transition-colors duration-[180ms]">
                  {cat.name}
                </span>
                <span className="text-[12px] font-medium uppercase tracking-[1px] mt-auto text-[#9CA3AF] transition-colors duration-[180ms]">
                  {cat.product_count} produtos
                </span>
              </Link>
            </li>
          ))}
          <VerTudoCard totalCount={totalCount} />
        </ul>
      </div>
    </section>
  )
}
