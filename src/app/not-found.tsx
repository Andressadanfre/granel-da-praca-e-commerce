import Link from 'next/link'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <>
      <Navigation />
      <main className="min-h-[60vh] bg-cream">
        <div className="mx-auto max-w-[760px] px-5 py-16 md:py-24">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[.1em] text-t4">
            Erro 404
          </p>
          <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight text-t9">
            Página não encontrada
          </h1>
          <p className="mt-4 text-[15px] text-t6 leading-relaxed max-w-[480px]">
            O endereço que você acessou não existe ou foi movido.
            Veja abaixo onde encontrar o que procura.
          </p>

          <div className="mt-10 flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[.1em] text-t4">
              Atalhos
            </p>
            {[
              { href: '/loja', label: 'Ver todos os produtos' },
              { href: '/ofertas', label: 'Ofertas da semana' },
              { href: '/receitas', label: 'Receitas com produtos naturais' },
              { href: '/sobre', label: 'Contato e nossas unidades' },
              { href: '/', label: 'Página inicial' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 text-[14px] font-medium text-gd hover:underline underline-offset-2"
              >
                <span aria-hidden>→</span>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
