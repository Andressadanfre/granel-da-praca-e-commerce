// src/components/sections/HeroBanner.tsx
// Server Component — sem 'use client'

import Link from 'next/link'
import { ArrowRight, Check, Truck } from 'lucide-react'

import { HeroSlider } from './HeroSlider'

export function HeroBanner() {
  return (
    <section
      aria-label="Banner principal"
      style={{ background: '#F9F5EF', overflow: 'hidden' }}
    >
      <div
        className="hero-grid"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 40px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          alignItems: 'center',
          minHeight: '520px',
          gap: '48px',
        }}
      >
        <div className="hero-copy" style={{ padding: '56px 0' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#E8F5E9',
              borderRadius: '100px',
              padding: '6px 14px',
              marginBottom: '20px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#00B207',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#2C742F',
                textTransform: 'uppercase',
                letterSpacing: '.08em',
              }}
            >
              Produtos naturais a granel
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 800,
              color: '#002603',
              lineHeight: 1.1,
              letterSpacing: '-.02em',
              margin: '0 0 16px',
            }}
          >
            Natureza no
            <br />
            <span style={{ color: '#00B207' }}>seu prato,</span>
            <br />
            frescor em
            <br />
            cada grão.
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: '#4B5563',
              lineHeight: 1.6,
              margin: '0 0 32px',
              maxWidth: '400px',
            }}
          >
            Mais de 390 produtos naturais a granel e por unidade. Com entrega em Uberlândia e
            retirada em 2 lojas.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '36px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '6px 12px',
              }}
            >
              <Truck size={14} strokeWidth={1.6} color="#00B207" aria-hidden />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                Frete grátis acima de R$100
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '6px 12px',
              }}
            >
              <Check size={14} strokeWidth={1.6} color="#00B207" aria-hidden />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                10% OFF na 1ª compra
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <Link
              href="/loja"
              className="hero-cta-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#00B207',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: 700,
                padding: '14px 28px',
                borderRadius: '12px',
                transition: 'background .18s cubic-bezier(.4,0,.2,1)',
              }}
            >
              Ver todos os produtos
              <ArrowRight size={16} strokeWidth={1.6} aria-hidden />
            </Link>
            <Link
              href="/ofertas"
              className="hero-cta-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                color: '#002603',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: 600,
                padding: '14px 24px',
                borderRadius: '12px',
                border: '2px solid #002603',
                transition:
                  'background .18s cubic-bezier(.4,0,.2,1), color .18s cubic-bezier(.4,0,.2,1)',
              }}
            >
              Ver ofertas
            </Link>
          </div>
        </div>

        <HeroSlider />
      </div>
    </section>
  )
}
