'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

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
    <div
      className="hero-img"
      style={{
        position: 'relative',
        height: '520px',
        borderRadius: '24px',
        overflow: 'hidden',
        background: '#D1E8D1',
      }}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          style={{
            position: 'absolute',
            inset: 0,
            willChange: 'transform, filter, opacity',
          }}
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

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(0,38,3,.08) 0%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          background: '#fff',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 8px 24px rgba(0,0,0,.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#E8F5E9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
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
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#002603', lineHeight: 1.2 }}>
            +390 produtos
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280' }}>
            Desde 2019 em Uberlândia
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          gap: '6px',
          zIndex: 2,
        }}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            style={{
              width: i === current ? '20px' : '6px',
              height: '6px',
              borderRadius: '100px',
              background: i === current ? '#00B207' : 'rgba(255,255,255,.5)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'width .3s cubic-bezier(.4,0,.2,1), background .3s',
            }}
          />
        ))}
      </div>
    </div>
  )
}
