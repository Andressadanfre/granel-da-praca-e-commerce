'use client'

import { useState, useEffect, useRef } from 'react'
import { User } from 'lucide-react'

export function UserMenuPopover() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        aria-label="Minha conta"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          height: '44px',
          padding: '0 10px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 500,
          color: '#4B5563',
          fontFamily: 'var(--font-poppins), sans-serif',
          borderRadius: '10px',
          transition: 'color .15s',
        }}
      >
        <User size={22} strokeWidth={1.6} />
        <span style={{ whiteSpace: 'nowrap' }}>Entrar</span>
      </button>

      <div
        role="dialog"
        aria-label="Acesso à conta"
        style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '248px',
          backgroundColor: '#ffffff',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,.12), 0 4px 12px rgba(0,0,0,.06)',
          padding: '18px',
          zIndex: 60,
          opacity: open ? 1 : 0,
          visibility: open ? 'visible' : 'hidden',
          transform: open ? 'translateY(0)' : 'translateY(-4px)',
          transition: 'opacity .16s ease, transform .16s ease',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
          Acesse sua conta
        </p>

        <a
          href="/auth/google"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '10px 14px',
            border: '1.5px solid #E5E7EB',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            fontSize: '13px',
            fontWeight: 500,
            color: '#111827',
            textDecoration: 'none',
            marginBottom: '10px',
            transition: 'border-color .14s, background .14s',
            fontFamily: 'var(--font-poppins), sans-serif',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar com Google
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0', fontSize: '11px', color: '#9CA3AF' }}>
          <span style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB', display: 'block' }} />
          ou
          <span style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB', display: 'block' }} />
        </div>

        <a
          href="/login"
          style={{ display: 'block', width: '100%', padding: '10px', textAlign: 'center', backgroundColor: '#2C742F', color: '#ffffff', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', marginBottom: '8px', fontFamily: 'var(--font-poppins), sans-serif' }}
        >
          Entrar com e-mail
        </a>
        <a
          href="/cadastro"
          style={{ display: 'block', width: '100%', padding: '10px', textAlign: 'center', backgroundColor: 'transparent', color: '#2C742F', border: '1.5px solid #2C742F', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-poppins), sans-serif' }}
        >
          Criar conta grátis
        </a>
      </div>
    </div>
  )
}
