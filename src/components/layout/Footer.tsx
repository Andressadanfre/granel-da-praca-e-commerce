// src/components/layout/Footer.tsx
// Server Component — sem 'use client'

import Link from 'next/link'
import Image from 'next/image'

import { NewsletterForm } from './NewsletterForm'

const LOJA_LINKS = [
  { href: '/loja', label: 'Todos os produtos' },
  { href: '/loja?categoria=oleaginosas', label: 'Castanhas & Oleaginosas' },
  { href: '/loja?categoria=graos', label: 'Grãos & Leguminosas' },
  { href: '/loja?categoria=farinhas', label: 'Farinhas & Cereais' },
  { href: '/loja?categoria=chas', label: 'Chás & Infusões' },
  { href: '/loja?categoria=superalimentos', label: 'Superalimentos', badge: 'NOVO' },
  { href: '/ofertas', label: 'Ofertas da semana' },
]

const INFO_LINKS = [
  { href: '/sobre', label: 'Sobre nós' },
  { href: '/entrega', label: 'Entrega e retirada' },
  { href: '/conta', label: 'Minha conta' },
]

const PAYMENT_METHODS = ['PIX', 'Mercado Pago', 'Crédito', 'Débito', 'Alelo', 'Dinheiro']

const CHEVRON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

export function Footer() {
  return (
    <footer aria-label="Rodapé">

      {/* ── NEWSLETTER STRIP ── */}
      <div className="bg-gd py-10 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="ft-nl-glow absolute w-[400px] h-[400px] rounded-full -top-[150px] -right-20 pointer-events-none"
        />

        <div className="ft-nl-inner max-w-container mx-auto px-4 sm:px-5 xl:px-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-10 relative z-[1]">
          <div>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-[.12em] mb-[6px]">
              Newsletter
            </p>
            <p className="text-xl font-bold text-white leading-[1.25] tracking-[-0.01em]">
              Receba ofertas e{' '}
              <span className="text-green-200">novidades</span>
              {' '}em primeira mão
            </p>
            <p className="text-[12.5px] text-white/[.65] mt-1">
              Sem spam. Só o que é bom — produtos, receitas e promoções exclusivas.
            </p>
          </div>

          <NewsletterForm />
        </div>
      </div>

      {/* ── FOOTER PRINCIPAL ── */}
      <div className="bg-gdeep relative overflow-hidden">
        <div
          aria-hidden="true"
          className="ft-body-overlay absolute inset-0 pointer-events-none"
        />

        <div className="ft-body max-w-container mx-auto pt-16 pb-12 px-4 sm:px-5 xl:px-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[260px_1fr_1fr_1fr] gap-12 relative z-[1]">
          <div>
            <div className="mb-[18px] flex items-center">
              <Image
                src="/images/logo-white.png"
                alt="Granel da Praça — Produtos Naturais"
                width={172}
                height={36}
                className="h-9 w-auto opacity-[.92]"
              />
            </div>

            <p className="text-[12.5px] text-white/[.82] leading-[1.65] mb-6 max-w-[220px]">
              Produtos naturais a granel com qualidade, transparência e cuidado. Duas lojas físicas em Uberlândia desde 2019.
            </p>

            <div className="flex gap-2 mb-7">
              <a href="https://instagram.com/graneldapraca" aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="ft-social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="https://wa.me/5534997819292" aria-label="WhatsApp Fundinho" target="_blank" rel="noopener noreferrer" className="ft-social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                </svg>
              </a>
              <a href="https://graneldapraca.goomer.app/" aria-label="Cardápio Online" target="_blank" rel="noopener noreferrer" className="ft-social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
                </svg>
              </a>
            </div>

            <div className="flex gap-1.5 flex-wrap">
              <span className="ft-badge-seal">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Compra segura
              </span>
              <span className="ft-badge-seal">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Mercado Pago
              </span>
            </div>
          </div>

          <div>
            <p className="ft-col-title">Loja</p>
            <ul className="list-none p-0 m-0 flex flex-col gap-1">
              {LOJA_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="ft-link">
                    {CHEVRON}
                    {link.label}
                    {link.badge && (
                      <span className="text-[9px] font-bold bg-g text-white py-px px-1.5 rounded-pill tracking-[.04em] ml-0.5">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="ft-col-title">Informações</p>
            <ul className="list-none p-0 m-0 flex flex-col gap-1">
              {INFO_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="ft-link">
                    {CHEVRON}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="ft-col-title">Contato</p>
            <div className="flex flex-col gap-3.5 mt-1">

              <div className="flex items-start gap-2.5">
                <div className="ft-contact-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10.5px] font-bold text-white/[.88] uppercase tracking-[.1em] mb-1">Fundinho</p>
                  <p className="text-[12.5px] text-white/[.58] leading-[1.6]">
                    Pça. Clarimundo Carneiro, 119<br />
                    <a href="https://wa.me/5534997819292" className="text-white/75 no-underline">(34) 99781-9292</a>
                  </p>
                  <p className="text-[11px] text-white/[.42] mt-[3px]">Seg–Sáb · 8h às 18h</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="ft-contact-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10.5px] font-bold text-white/[.88] uppercase tracking-[.1em] mb-1">UMC</p>
                  <p className="text-[12.5px] text-white/[.58] leading-[1.6]">
                    R. Rafael Marino Neto, 600<br />
                    <a href="https://wa.me/5534979699191" className="text-white/75 no-underline">(34) 97969-9191</a>
                  </p>
                  <p className="text-[11px] text-white/[.42] mt-[3px]">Seg–Sáb · 8h às 18h</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="ft-contact-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 5v3h-7V8z" />
                    <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10.5px] font-bold text-white/[.88] uppercase tracking-[.1em] mb-1">Entrega</p>
                  <p className="text-[12.5px] text-white/[.58] leading-[1.6]">
                    Somente em Uberlândia<br />
                    Pedidos até 17h (sáb. até 11h) · Sem domingos
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="max-w-container mx-auto px-4 sm:px-5 xl:px-0 relative z-[1]">
          <hr className="border-0 border-t border-white/[.08]" />
        </div>

        <div className="ft-bottom max-w-container mx-auto pt-5 pb-8 px-4 sm:px-5 xl:px-0 flex items-center justify-between gap-6 flex-wrap relative z-[1]">
          <p className="text-[11.5px] text-white/[.42] leading-[1.5]">
            © 2025 <strong className="text-white/60 font-semibold">Granel da Praça</strong>. Todos os direitos reservados.<br />
            Uberlândia, MG · CNPJ 00.000.000/0001-00
          </p>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-white/[.42] tracking-[.06em] uppercase mr-1">
              Aceito
            </span>
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="h-[26px] px-2.5 rounded-md border border-white/[.08] bg-white/[.05] inline-flex items-center justify-center text-[10px] font-bold text-white/60 tracking-[.03em] whitespace-nowrap"
              >
                {method}
              </span>
            ))}
          </div>

          <div className="flex gap-4 flex-wrap">
            {[
              { href: '/privacidade', label: 'Privacidade' },
              { href: '/termos', label: 'Termos de uso' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="ft-legal-link text-[11px] text-white/[.42] no-underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
