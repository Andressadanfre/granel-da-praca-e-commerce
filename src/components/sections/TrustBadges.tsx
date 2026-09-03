import { Leaf, MessageCircle, ShieldCheck, Truck, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

// ─── Dados estáticos — Server Component, zero JS no cliente ───────────────────
const BADGES: { icon: LucideIcon; title: string; subtitle: string }[] = [
  {
    icon: Truck,
    title: 'Frete Grátis',
    subtitle: 'Pedidos acima de R$100',
  },
  {
    icon: MessageCircle,
    title: 'Atendimento WhatsApp',
    subtitle: 'Seg–Sáb, 8h às 18h',
  },
  {
    icon: ShieldCheck,
    title: 'Pagamento Seguro',
    subtitle: 'Pix, cartão e boleto',
  },
  {
    icon: Leaf,
    title: 'Produtos Frescos',
    subtitle: 'Direto dos fornecedores',
  },
]

function BadgeItem({
  icon: Icon,
  title,
  subtitle,
  showDivider = false,
  ticker = false,
  ariaHidden = false,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  showDivider?: boolean
  ticker?: boolean
  ariaHidden?: boolean
}) {
  return (
    <li
      aria-hidden={ariaHidden || undefined}
      className={cn(
        'flex items-center gap-3 py-3',
        ticker ? 'shrink-0 border-r border-bd px-5 lg:px-10' : 'px-4',
        showDivider && 'lg:border-l lg:border-bd',
      )}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-icon-bg"
        aria-hidden="true"
      >
        <Icon size={24} strokeWidth={1.6} className="text-gd" />
      </div>
      <div className={cn(!ticker && 'min-w-0')}>
        <p
          className={cn(
            'text-sm font-semibold leading-tight text-t9',
            ticker && 'whitespace-nowrap',
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            'text-xs font-normal leading-tight text-t6',
            ticker && 'whitespace-nowrap',
          )}
        >
          {subtitle}
        </p>
      </div>
    </li>
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function TrustBadges() {
  return (
    <section
      aria-label="Diferenciais"
      className="bg-white border-b border-bd"
    >
      {/* Faixa contínua em todos os breakpoints. Hidden se prefers-reduced-motion */}
      <div className="overflow-hidden py-4 motion-reduce:hidden">
        <ul className="m-0 flex w-max list-none p-0 animate-trust-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
          {BADGES.map((badge) => (
            <BadgeItem
              key={badge.title}
              icon={badge.icon}
              title={badge.title}
              subtitle={badge.subtitle}
              ticker
            />
          ))}
          {BADGES.map((badge) => (
            <BadgeItem
              key={`${badge.title}-dup`}
              icon={badge.icon}
              title={badge.title}
              subtitle={badge.subtitle}
              ticker
              ariaHidden
            />
          ))}
        </ul>
      </div>

      {/* Fallback estático quando o sistema pede menos movimento */}
      <div className="hidden motion-reduce:block">
        <div className="mx-auto max-w-[1280px] px-5 py-4 xl:px-0">
          <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 lg:grid-cols-4 lg:gap-0">
            {BADGES.map((badge, idx) => (
              <BadgeItem
                key={badge.title}
                icon={badge.icon}
                title={badge.title}
                subtitle={badge.subtitle}
                showDivider={idx > 0}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
