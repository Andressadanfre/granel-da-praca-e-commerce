'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { User } from 'lucide-react'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { signOutAction } from '@/lib/auth/actions'

export interface UserMenuPopoverProps {
  userEmail: string | null
}

export function UserMenuPopover({ userEmail }: UserMenuPopoverProps) {
  const router = useRouter()
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

  async function handleSignOut() {
    await signOutAction()
    setOpen(false)
    router.refresh()
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        aria-label="Minha conta"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-sel px-2.5 text-[13px] font-medium text-t6 sm:justify-start"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-poppins), sans-serif',
          transition: 'color .15s',
        }}
      >
        <User size={22} strokeWidth={1.6} />
        <span className="hidden whitespace-nowrap sm:inline">
          {userEmail ? 'Minha conta' : 'Entrar'}
        </span>
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
        {userEmail ? (
          <>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              Logado como
            </p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '14px', wordBreak: 'break-all' }}>
              {userEmail}
            </p>
            <a
              href="/conta"
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                textAlign: 'center',
                backgroundColor: 'transparent',
                color: '#2C742F',
                border: '1.5px solid #2C742F',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                fontFamily: 'var(--font-poppins), sans-serif',
                marginBottom: '8px',
              }}
            >
              Meus Pedidos
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                textAlign: 'center',
                backgroundColor: 'transparent',
                color: '#2C742F',
                border: '1.5px solid #2C742F',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'var(--font-poppins), sans-serif',
                cursor: 'pointer',
              }}
            >
              Sair
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Acesse sua conta
            </p>

            <div style={{ marginBottom: '10px' }}>
              <GoogleButton />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0', fontSize: '11px', color: '#9CA3AF' }}>
              <span style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB', display: 'block' }} />
              ou
              <span style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB', display: 'block' }} />
            </div>

            <a
              href="/conta/login"
              style={{ display: 'block', width: '100%', padding: '10px', textAlign: 'center', backgroundColor: '#2C742F', color: '#ffffff', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', marginBottom: '8px', fontFamily: 'var(--font-poppins), sans-serif' }}
            >
              Entrar com e-mail
            </a>
            <a
              href="/conta/cadastro"
              style={{ display: 'block', width: '100%', padding: '10px', textAlign: 'center', backgroundColor: 'transparent', color: '#2C742F', border: '1.5px solid #2C742F', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-poppins), sans-serif' }}
            >
              Criar conta grátis
            </a>
          </>
        )}
      </div>
    </div>
  )
}
