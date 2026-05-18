// src/components/layout/Footer.tsx
// Server Component — sem 'use client'

import Link from 'next/link'

import { NewsletterForm } from './NewsletterForm'

const LOJA_LINKS = [
  { href: '/loja', label: 'Todos os produtos' },
  { href: '/loja/oleaginosas', label: 'Castanhas & Oleaginosas' },
  { href: '/loja/graos', label: 'Grãos & Leguminosas' },
  { href: '/loja/farinhas', label: 'Farinhas & Cereais' },
  { href: '/loja/chas', label: 'Chás & Infusões' },
  { href: '/loja/superalimentos', label: 'Superalimentos', badge: 'NOVO' },
  { href: '/ofertas', label: 'Ofertas da semana' },
]

const INFO_LINKS = [
  { href: '/sobre', label: 'Sobre nós' },
  { href: '/como-funciona', label: 'Como funciona' },
  { href: '/entrega', label: 'Entrega e retirada' },
  { href: '/fidelidade', label: 'Programa de fidelidade' },
  { href: '/faq', label: 'Perguntas frequentes' },
  { href: '/minha-conta', label: 'Minha conta' },
  { href: '/rastreio', label: 'Rastrear pedido' },
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
      <div
        style={{
          backgroundColor: '#2C742F',
          padding: '40px 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(0,178,7,.25) 0%, transparent 70%)',
            top: '-150px',
            right: '-80px',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '40px',
            position: 'relative',
            zIndex: 1,
          }}
          className="ft-nl-inner"
        >
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: '6px' }}>
              Newsletter
            </p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', lineHeight: 1.25, letterSpacing: '-.01em' }}>
              Receba ofertas e{' '}
              <span style={{ color: '#86EFAC' }}>novidades</span>
              {' '}em primeira mão
            </p>
            <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,.65)', marginTop: '4px' }}>
              Sem spam. Só o que é bom — produtos, receitas e promoções exclusivas.
            </p>
          </div>

          <NewsletterForm />
        </div>
      </div>

      {/* ── FOOTER PRINCIPAL ── */}
      <div
        style={{
          backgroundColor: '#002603',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(ellipse 60% 40% at 90% 10%, rgba(0,178,7,.06) 0%, transparent 65%),
              radial-gradient(ellipse 40% 60% at 5% 85%, rgba(44,116,47,.08) 0%, transparent 60%)
            `,
            pointerEvents: 'none',
          }}
        />

        <div
          className="ft-body"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '64px 40px 48px',
            display: 'grid',
            gridTemplateColumns: '260px 1fr 1fr 1fr',
            gap: '48px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div>
            <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center' }}>
              <svg
                height="36"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Granel da Praça"
                style={{ filter: 'brightness(0) invert(1)', opacity: 0.92 }}
              >
                <circle cx="20" cy="20" r="20" fill="#002603" />
                <path d="M20 30 C13 26 10 19 13 13 C16 8 22 8 24 13 C26 18 24 26 20 30Z" fill="#00B207" />
                <path d="M20 30 C27 26 30 19 27 13 C25 9 21 10 20 14 C19 18 20 26 20 30Z" fill="#2C742F" />
                <line x1="20" y1="30" x2="20" y2="34" stroke="#00B207" strokeWidth="2" strokeLinecap="round" />
                <ellipse cx="16" cy="22" rx="2.5" ry="1.5" fill="#F9F5EF" opacity="0.7" transform="rotate(-20 16 22)" />
                <ellipse cx="24" cy="22" rx="2.5" ry="1.5" fill="#F9F5EF" opacity="0.5" transform="rotate(20 24 22)" />
              </svg>
              <span style={{ marginLeft: '10px', fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,.92)', letterSpacing: '-.01em' }}>
                Granel da Praça
              </span>
            </div>

            <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,.82)', lineHeight: 1.65, marginBottom: '24px', maxWidth: '220px' }}>
              Produtos naturais a granel com qualidade, transparência e cuidado. Dois espaços físicos em Uberlândia desde 2019.
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
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

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {LOJA_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="ft-link">
                    {CHEVRON}
                    {link.label}
                    {link.badge && (
                      <span style={{
                        fontSize: '9px', fontWeight: 700,
                        backgroundColor: '#00B207', color: '#ffffff',
                        padding: '1px 6px', borderRadius: '100px',
                        letterSpacing: '.04em', marginLeft: '2px',
                      }}>
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
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '4px' }}>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div className="ft-contact-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: '10.5px', fontWeight: 700, color: 'rgba(255,255,255,.88)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '4px' }}>Fundinho</p>
                  <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,.58)', lineHeight: 1.6 }}>
                    Pça. Clarimundo Carneiro, 119<br />
                    <a href="https://wa.me/5534997819292" style={{ color: 'rgba(255,255,255,.75)', textDecoration: 'none' }}>(34) 99781-9292</a>
                  </p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,.42)', marginTop: '3px' }}>Seg–Sáb · 8h às 18h</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div className="ft-contact-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: '10.5px', fontWeight: 700, color: 'rgba(255,255,255,.88)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '4px' }}>UMC</p>
                  <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,.58)', lineHeight: 1.6 }}>
                    R. Rafael Marino Neto, 600<br />
                    <a href="https://wa.me/5534979699191" style={{ color: 'rgba(255,255,255,.75)', textDecoration: 'none' }}>(34) 97969-9191</a>
                  </p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,.42)', marginTop: '3px' }}>Seg–Sáb · 8h às 18h</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div className="ft-contact-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 5v3h-7V8z" />
                    <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: '10.5px', fontWeight: 700, color: 'rgba(255,255,255,.88)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '4px' }}>Entrega</p>
                  <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,.58)', lineHeight: 1.6 }}>
                    Somente em Uberlândia<br />
                    Pedidos até 14h · Sem domingos
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 40px', position: 'relative', zIndex: 1 }}>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,.08)' }} />
        </div>

        <div
          className="ft-bottom"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '20px 40px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <p style={{ fontSize: '11.5px', color: 'rgba(255,255,255,.42)', lineHeight: 1.5 }}>
            © 2025 <strong style={{ color: 'rgba(255,255,255,.6)', fontWeight: 600 }}>Granel da Praça</strong>. Todos os direitos reservados.<br />
            Uberlândia, MG · CNPJ 00.000.000/0001-00
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 500, color: 'rgba(255,255,255,.42)', letterSpacing: '.06em', textTransform: 'uppercase', marginRight: '4px' }}>
              Aceito
            </span>
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                style={{
                  height: '26px',
                  padding: '0 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,.08)',
                  backgroundColor: 'rgba(255,255,255,.05)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,.6)',
                  letterSpacing: '.03em',
                  whiteSpace: 'nowrap',
                }}
              >
                {method}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { href: '/privacidade', label: 'Privacidade' },
              { href: '/termos', label: 'Termos de uso' },
              { href: '/cookies', label: 'Cookies' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ fontSize: '11px', color: 'rgba(255,255,255,.42)', textDecoration: 'none' }}
                className="ft-legal-link"
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
