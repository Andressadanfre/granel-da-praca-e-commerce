'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const SLIDES = [
  {
    src: '/images/hero/hero-01.webp',
    alt: 'Castanhas e grãos naturais a granel — Granel da Praça',
  },
  {
    src: '/images/hero/hero-02.webp',
    alt: 'Produtos naturais selecionados — Granel da Praça',
  },
  {
    src: '/images/hero/hero-03.webp',
    alt: 'Frescor e variedade em cada grão — Granel da Praça',
  },
]

const INTERVAL = 6000

const variants = {
  enter: {
    scale: 1.08,
    filter: 'blur(8px)',
    opacity: 0,
  },
  center: {
    scale: 1,
    filter: 'blur(0px)',
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
  exit: {
    scale: 1.04,
    filter: 'blur(6px)',
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 1, 1] as [number, number, number, number],
    },
  },
}

export function HeroSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length)
    }, INTERVAL)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="hero-img relative h-[520px] rounded-3xl overflow-hidden bg-[#D1E8D1]">
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 will-change-[transform,_filter,_opacity]"
        >
          <Image
            src={SLIDES[current].src}
            alt={SLIDES[current].alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center"
            priority={current === 0}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,38,3,.08)_0%,transparent_60%)] pointer-events-none z-[1]" />

      <div className="absolute bottom-6 left-6 bg-white rounded-inner py-3 px-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)] flex items-center gap-2.5 z-[2]">
        <div className="w-9 h-9 rounded-full bg-g-light flex items-center justify-center shrink-0">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2C742F"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
            <path d="M12 8v4l3 3" />
          </svg>
        </div>
        <div>
          <div className="text-[13px] font-bold text-gdeep leading-[1.2]">
            +400 produtos
          </div>
          <div className="text-[11px] text-t5">
            Desde 2019 em Uberlândia
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 flex gap-1.5 z-[2]">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={cn(
              'h-[6px] rounded-pill border-0 cursor-pointer p-0 transition-[width,background] duration-300 ease-in-out',
              i === current ? 'w-5 bg-g' : 'w-1.5 bg-white/50'
            )}
          />
        ))}
      </div>
    </div>
  )
}
