// src/components/sections/HeroBanner.tsx
// Server Component — sem 'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { HeroSlider } from './HeroSlider'

export function HeroBanner() {
  return (
    <section aria-label="Banner principal" className="bg-cream overflow-hidden">
      <div className="mx-auto grid max-w-container grid-cols-1 items-center gap-s12 px-4 py-s10 sm:grid-cols-2 sm:px-s10 lg:py-s12">

        {/* ── Coluna de copy ─────────────────────────────────────── */}
        <div>

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
            Receba <span className="text-g">hoje mesmo</span>
            <br />
            em Uberlândia!
          </h1>

          {/* Subtítulo */}
          <p className="text-[17px] font-medium text-t6 leading-relaxed mb-8 max-w-[400px]">
            Compre até as 17h em dias úteis (ou até 11h aos sábados) e entregamos no mesmo dia.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap gap-s3 items-center">
            <Link
              href="/loja"
              className="hero-cta-primary inline-flex items-center gap-s2 bg-g hover:bg-ghover text-white no-underline text-[15px] font-bold px-7 py-[14px] rounded-inner transition-colors duration-[180ms] ease-in-out"
            >
              Ver todos os produtos
              <ArrowRight size={16} strokeWidth={1.6} aria-hidden />
            </Link>
          </div>
        </div>

        <div>
          <HeroSlider />
        </div>
      </div>
    </section>
  )
}
