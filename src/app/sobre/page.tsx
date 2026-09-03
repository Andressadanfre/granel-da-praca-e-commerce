import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Fale Conosco | Granel da Praça',
  description:
    'Encontre a Granel da Praça em Uberlândia. Duas unidades: Fundinho e UMC/Jardim Karaíba. Atendimento via WhatsApp, Instagram e presencialmente.',
}

const unidades = [
  {
    nome: 'Unidade Fundinho',
    tipo: 'Matriz',
    endereco: 'Rua Coronel Antônio Alves Pereira, 302',
    bairro: 'Fundinho — Uberlândia, MG',
    whatsapp: '5534997819292',
    whatsappDisplay: '(34) 99781-9292',
    horarios: [
      { dias: 'Segunda a sábado', horario: '9h às 18h' },
      { dias: 'Domingos e feriados', horario: 'Fechado' },
    ],
    mapsUrl:
      'https://www.google.com/maps/search/Rua+Coronel+Antônio+Alves+Pereira+302+Fundinho+Uberlândia',
    destaque: true,
  },
  {
    nome: 'Unidade UMC',
    tipo: 'Jardim Karaíba',
    endereco: 'Rua Rafael Marino Neto, 600',
    bairro: 'Jardim Karaíba — Uberlândia, MG',
    whatsapp: '5534997969191',
    whatsappDisplay: '(34) 99796-9191',
    horarios: [
      { dias: 'Segunda a sexta', horario: '8h às 18h' },
      { dias: 'Sábados, domingos e feriados', horario: 'Fechado' },
    ],
    mapsUrl:
      'https://www.google.com/maps/search/Rua+Rafael+Marino+Neto+600+Jardim+Karaíba+Uberlândia',
    destaque: false,
  },
]

const canais = [
  {
    icone: '📸',
    titulo: 'Instagram',
    descricao: '@graneldapraca',
    href: 'https://instagram.com/graneldapraca',
    label: 'Seguir no Instagram',
  },
  {
    icone: '🛒',
    titulo: 'Goomer',
    descricao: 'Cardápio digital',
    href: 'https://graneldapraca.goomer.app/',
    label: 'Acessar Goomer',
  },
]

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-gdeep py-14 sm:py-20">
        <div className="mx-auto max-w-[1280px] px-5 xl:px-0">
          <p className="mb-3 text-[11px] font-700 uppercase tracking-[.1em] text-g">
            Granel da Praça · Contato
          </p>
          <h1 className="text-[32px] font-700 leading-tight text-white sm:text-[40px]">
            Fale conosco
          </h1>
          <p className="mt-4 max-w-[440px] text-[15px] text-white/65 leading-relaxed">
            Duas unidades em Uberlândia, atendimento via WhatsApp e entrega pelo e-commerce.
          </p>
        </div>
      </section>

      {/* Unidades */}
      <section className="mx-auto max-w-[1280px] px-5 py-12 xl:px-0">
        <h2 className="mb-6 text-[11px] font-700 uppercase tracking-[.1em] text-t4">
          Nossas unidades
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {unidades.map((u) => (
            <div
              key={u.nome}
              className={[
                'rounded-card border bg-white p-7 shadow-card',
                u.destaque ? 'border-gd' : 'border-bd',
              ].join(' ')}
            >
              {/* Header da unidade */}
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[18px] font-700 text-t9">{u.nome}</h3>
                    {u.destaque && (
                      <span className="rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-[10px] font-700 text-gd">
                        Matriz
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[13px] text-t6">{u.tipo}</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-xl">
                  📍
                </div>
              </div>

              {/* Endereço */}
              <div className="mb-5 rounded-inner bg-cream p-4">
                <p className="text-[13.5px] font-600 text-t9">{u.endereco}</p>
                <p className="mt-0.5 text-[12.5px] text-t6">{u.bairro}</p>
                <a
                  href={u.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-600 text-gd hover:underline"
                >
                  <span>Ver no mapa</span>
                  <span aria-hidden>↗</span>
                </a>
              </div>

              {/* Horários */}
              <div className="mb-5">
                <p className="mb-2.5 text-[10px] font-700 uppercase tracking-[.08em] text-t4">
                  Horário de funcionamento
                </p>
                <div className="flex flex-col gap-2">
                  {u.horarios.map((h) => (
                    <div
                      key={h.dias}
                      className="flex items-center justify-between gap-4 border-b border-bd pb-2 last:border-0 last:pb-0"
                    >
                      <span className="text-[13px] text-t6">{h.dias}</span>
                      <span
                        className={[
                          'text-[13px] font-600 shrink-0',
                          h.horario === 'Fechado' ? 'text-t4' : 'text-t9',
                        ].join(' ')}
                      >
                        {h.horario}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${u.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-sel bg-gd py-3 text-[13px] font-700 text-white transition-colors hover:bg-ghover"
              >
                <span>💬</span>
                <span>WhatsApp {u.whatsappDisplay}</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Outros canais */}
      <section className="mx-auto max-w-[1280px] px-5 pb-12 xl:px-0">
        <h2 className="mb-6 text-[11px] font-700 uppercase tracking-[.1em] text-t4">
          Outros canais
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {canais.map((c) => (
            <a
              key={c.titulo}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-card border border-bd bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
              aria-label={c.label}
            >
              <span className="text-2xl">{c.icone}</span>
              <div>
                <p className="text-[13.5px] font-600 text-t9">{c.titulo}</p>
                <p className="text-[12px] text-t6">{c.descricao}</p>
              </div>
            </a>
          ))}

          {/* Comprar online */}
          <Link
            href="/loja"
            className="flex items-center gap-4 rounded-card border border-gd bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover sm:col-span-2 lg:col-span-2"
          >
            <span className="text-2xl">🛍️</span>
            <div>
              <p className="text-[13.5px] font-600 text-gd">Comprar online</p>
              <p className="text-[12px] text-t6">
                Entrega em Uberlândia — pedidos até às 17h saem no mesmo dia
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Nota de retirada */}
      <section className="mx-auto max-w-[1280px] px-5 pb-16 xl:px-0">
        <div className="rounded-card border border-bd bg-white p-6 shadow-card">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-xl">ℹ️</span>
            <div>
              <h3 className="text-[14px] font-600 text-t9">
                Retirada e entrega
              </h3>
              <p className="mt-1 text-[13px] text-t6 leading-relaxed">
                As compras pelo e-commerce são retiradas e entregues exclusivamente pela{' '}
                <strong className="font-600 text-t9">Unidade Fundinho (matriz)</strong>.
                Pedidos realizados até as 17h em dias úteis são entregues no mesmo dia em Uberlândia.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
