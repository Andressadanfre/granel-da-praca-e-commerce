import Link from 'next/link'
import Image from 'next/image'

// ─── tipos ────────────────────────────────────────────────────────────────────

interface Card {
  imageSrc: string
  badge: string
  title: string
  text: string
  href?: string
  featured?: boolean
}

// ─── dados estáticos ──────────────────────────────────────────────────────────

const CARDS: Card[] = [
  {
    imageSrc: '/images/diferenciais/entrega-no-mesmo-dia.webp',
    badge: 'ENTREGA NO MESMO DIA',
    title: 'Pré-Treino 100% Natural',
    text: 'Energia limpa para a sua rotina, sem aditivos químicos.',
    href: '/loja?categoria=suplementos',
  },
  {
    imageSrc: '/images/diferenciais/qualidade-garantida.webp',
    badge: 'QUALIDADE GARANTIDA',
    title: 'Compre a Granel',
    text: 'Escolha a quantidade exata que você precisa, sem desperdício.',
    featured: true,
  },
  {
    imageSrc: '/images/diferenciais/estilo-de-vida.webp',
    badge: 'ESTILO DE VIDA',
    title: 'Receitas Saudáveis',
    text: 'Inspirações práticas e fit para aplicar com nossos produtos.',
    href: '/receitas',
  },
]

// ─── check icon (DS — 10×10 · stroke-width 2.5) ──────────────────────────────

function CheckIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// ─── card ─────────────────────────────────────────────────────────────────────

function DifCard({ card }: { card: Card }) {
  const inner = (
    <>
      {/* linha verde crescendo da base no hover — CSS puro via group */}
      <span
        aria-hidden="true"
        className="
          absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[24px]
          bg-gradient-to-r from-g to-gd
          scale-x-0 origin-left
          transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)]
          group-hover:scale-x-100
        "
      />

      {/* imagem do card — 600×400, full-bleed no topo */}
      <div className="relative z-10 -mx-9 -mt-9 mb-5 overflow-hidden">
        <Image
          src={card.imageSrc}
          alt=""
          width={600}
          height={400}
          className="
            h-auto w-full object-cover
            transition-transform duration-[180ms]
            group-hover:scale-105
          "
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 380px"
        />
      </div>

      {/* badge
          self-start: nunca estica horizontalmente
          whitespace-nowrap: nunca quebra em 2 linhas
      */}
      <span
        className="
          relative z-10 mb-4
          inline-flex self-start items-center gap-[5px]
          whitespace-nowrap rounded-[100px]
          border border-[rgba(44,116,47,0.15)]
          bg-g-light px-[11px] py-[5px]
          text-[10px] font-semibold uppercase tracking-[0.04em]
          text-gd
        "
      >
        <span className="text-g">
          <CheckIcon />
        </span>
        {card.badge}
      </span>

      {/* título */}
      <h3
        className="
          relative z-10 mb-2.5
          text-[20px] font-bold leading-[1.25] tracking-[-0.02em] text-t9
        "
      >
        {card.title}
      </h3>

      {/* texto */}
      <p className="relative z-10 text-[15px] leading-[1.65] text-t6">
        {card.text}
      </p>
    </>
  )

  const base = `
    group relative flex w-full min-w-0 flex-col overflow-hidden
    rounded-[24px] border p-9
    transition-[border-color,box-shadow,transform] duration-[180ms]
    hover:-translate-y-1
    hover:border-[rgba(0,178,7,0.3)]
    hover:shadow-[0_12px_36px_rgba(0,38,3,0.08),0_4px_10px_rgba(0,38,3,0.04)]
    ${card.featured
      ? 'border-[rgba(0,178,7,0.18)] bg-[#F7FDF7]'
      : 'border-bd bg-cream'
    }
  `

  if (card.href) {
    return (
      <Link href={card.href} className={base}>
        {inner}
      </Link>
    )
  }

  return <div className={base}>{inner}</div>
}

// ─── seção principal ──────────────────────────────────────────────────────────

export default function DiferenciaisSection() {
  return (
    <section
      aria-label="Nossos diferenciais"
      className="relative overflow-hidden bg-white"
    >
      {/* divisor topo */}
      <span
        aria-hidden="true"
        className="
          absolute inset-x-0 top-0 h-px
          bg-[linear-gradient(90deg,transparent,theme(colors.bd)_20%,theme(colors.bd)_80%,transparent)]
        "
      />

      {/* blob decorativo canto superior direito */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute -right-16 -top-20
          h-[320px] w-[320px] rounded-full
          bg-[radial-gradient(ellipse,rgba(0,178,7,0.04)_0%,transparent_70%)]
        "
      />

      {/*
        container — regras definitivas (aprovadas pelo UX/UI):
        · w-full + max-w-[1200px]: nunca estoura, limita no desktop
        · mx-auto: centralizado
        · px-6: padding lateral fixo em todos os breakpoints
      */}
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 py-20">

        {/* cabeçalho centralizado */}
        <div className="mb-12 text-center">
          <div
            className="
              mb-2.5 inline-flex items-center gap-2
              text-[11px] font-bold uppercase tracking-[0.12em] text-gd
            "
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-g"
            />
            Por que escolher a gente
          </div>

          <h2
            className="
              mb-2.5 text-[clamp(22px,3vw,36px)] font-extrabold
              leading-[1.15] tracking-[-0.02em] text-gdeep
            "
          >
            Natural de verdade,
            <br />
            do começo ao fim
          </h2>

          <p className="mx-auto max-w-[520px] text-[15px] leading-[1.65] text-t6">
            Cada etapa pensada para você receber o melhor dos produtos naturais
            — com qualidade, cuidado e transparência.
          </p>
        </div>

        {/*
          grid — regras definitivas (aprovadas pelo UX/UI):
          · grid-cols-1: mobile (1 coluna)
          · md:grid-cols-2: tablet (2 colunas)
          · lg:grid-cols-3: desktop (3 colunas)
          · wrapper div no 3º card: centraliza no tablet com max-width simétrico
        */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
          {CARDS.map((card, i) => (
            <div
              key={card.title}
              className={
                i === 2
                  ? 'md:col-span-2 md:mx-auto md:w-full md:max-w-[calc(50%-10px)] lg:col-span-1 lg:mx-0 lg:max-w-none'
                  : ''
              }
            >
              <DifCard card={card} />
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
