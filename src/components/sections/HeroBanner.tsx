// src/components/sections/HeroBanner.tsx
// Server Component — sem 'use client'

import Link from 'next/link'
import { ArrowRight, Check, Truck } from 'lucide-react'

import { HeroSlider } from './HeroSlider'

export function HeroBanner() {
  return (
    <section aria-label="Banner principal" className="bg-cream overflow-hidden">
      <div className="mx-auto max-w-container px-4 sm:px-s10 grid grid-cols-1 sm:grid-cols-2 items-center sm:min-h-[520px] gap-s12">

        {/* ── Coluna de copy ─────────────────────────────────────── */}
        <div className="py-[56px]">

          {/* Eyebrow pill */}
          <div className="inline-flex items-center gap-s2 bg-g-light rounded-pill px-[14px] py-[6px] mb-5">
            <span className="w-[6px] h-[6px] rounded-full bg-g shrink-0" aria-hidden="true" />
            <span className="text-xs font-semibold text-gd uppercase tracking-[.08em]">
              Produtos naturais a granel
            </span>
          </div>

          <h1
            className="font-extrabold text-gdeep leading-[1.1] tracking-[-0.02em] mb-4 text-[clamp(32px,4vw,52px)]"
          >
            Receba ainda
            <br />
            <span className="text-g">hoje</span>
            <br />
            em Uberlândia.
          </h1>

          {/* Subtítulo */}
          <p className="text-base text-t6 leading-relaxed mb-8 max-w-[400px]">
            Peça até às 17h (sáb. até 11h) e receba ainda hoje. Mais de 390 produtos naturais
            a granel e por unidade, com retirada em 2 lojas.
          </p>

          {/* Pills de benefício */}
          <div className="flex flex-wrap gap-s3 mb-9">
            <div className="flex items-center gap-[6px] bg-white border border-bd rounded-input px-s3 py-[6px]">
              <Truck size={14} strokeWidth={1.6} className="text-g" aria-hidden />
              <span className="text-xs font-semibold text-t7">Frete grátis acima de R$100</span>
            </div>
            <div className="flex items-center gap-[6px] bg-white border border-bd rounded-input px-s3 py-[6px]">
              <Check size={14} strokeWidth={1.6} className="text-g" aria-hidden />
              <span className="text-xs font-semibold text-t7">10% OFF na 1ª compra</span>
            </div>
            <div className="flex items-center gap-[6px] bg-white border border-bd rounded-input px-s3 py-[6px]">
              <Check size={14} strokeWidth={1.6} className="text-g" aria-hidden />
              <span className="text-xs font-semibold text-t7">Loja física desde 2019</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-s3 items-center">
            <Link
              href="/loja"
              className="hero-cta-primary inline-flex items-center gap-s2 bg-g hover:bg-ghover text-white no-underline text-[15px] font-bold px-7 py-[14px] rounded-inner transition-colors duration-[180ms] ease-in-out"
            >
              Ver todos os produtos
              <ArrowRight size={16} strokeWidth={1.6} aria-hidden />
            </Link>
            <Link
              href="/ofertas"
              className="hero-cta-secondary inline-flex items-center gap-s2 bg-transparent hover:bg-g-muted text-gdeep no-underline text-[15px] font-semibold px-6 py-[14px] rounded-inner border-2 border-gdeep transition-colors duration-[180ms] ease-in-out"
            >
              Ver ofertas
            </Link>
          </div>
        </div>

        <div className="hidden sm:block">
          <HeroSlider />
        </div>
      </div>
    </section>
  )
}
