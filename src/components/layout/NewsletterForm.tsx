'use client'

import { useState } from 'react'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    // TODO: integrar com API de e-mail marketing
    await new Promise((r) => setTimeout(r, 800))
    setStatus('success')
    setEmail('')
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', gap: '8px' }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          aria-label="E-mail para newsletter"
          required
          disabled={status === 'loading' || status === 'success'}
          style={{
            height: '46px',
            width: '280px',
            border: '1.5px solid rgba(255,255,255,.25)',
            borderRadius: '100px',
            backgroundColor: 'rgba(0,0,0,.18)',
            color: '#ffffff',
            fontSize: '13px',
            padding: '0 20px',
            outline: 'none',
            fontFamily: 'var(--font-poppins), sans-serif',
            backdropFilter: 'blur(8px)',
            transition: 'border-color .18s cubic-bezier(.4,0,.2,1)',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          style={{
            height: '46px',
            padding: '0 24px',
            backgroundColor: status === 'success' ? '#86EFAC' : '#ffffff',
            color: '#2C742F',
            border: 'none',
            borderRadius: '100px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: status === 'loading' || status === 'success' ? 'default' : 'pointer',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-poppins), sans-serif',
            letterSpacing: '.02em',
            transition: 'background .18s cubic-bezier(.4,0,.2,1), transform .18s cubic-bezier(.4,0,.2,1)',
          }}
        >
          {status === 'loading' ? 'Enviando…' : status === 'success' ? '✓ Inscrito!' : 'Quero receber'}
        </button>
      </form>
      <p style={{
        fontSize: '10px',
        color: 'rgba(255,255,255,.62)',
        marginTop: '6px',
        textAlign: 'center',
      }}>
        Ao se inscrever você concorda com nossa Política de Privacidade.
      </p>
    </div>
  )
}
