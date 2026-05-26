'use client'

import { useState } from 'react'

import { subscribeNewsletter } from '@/app/actions/newsletter'
import { cn } from '@/lib/utils'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setErrorMsg('')

    const result = await subscribeNewsletter(email)

    if (result.success) {
      setStatus('success')
      setEmail('')
    } else {
      setStatus('error')
      setErrorMsg(result.error)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          aria-label="E-mail para newsletter"
          required
          disabled={status === 'loading' || status === 'success'}
          className="h-[46px] w-[280px] border-[1.5px] border-white/25 rounded-pill bg-black/[.18] text-white text-[13px] px-5 outline-none font-sans backdrop-blur transition-[border-color] duration-[180ms] ease-in-out"
        />
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className={cn(
            'h-[46px] px-6 text-gd border-0 rounded-pill text-[13px] font-bold whitespace-nowrap font-sans tracking-[.02em] transition-[background,transform] duration-[180ms] ease-in-out',
            status === 'success' ? 'bg-green-200' : 'bg-white',
            status === 'loading' || status === 'success' ? 'cursor-default' : 'cursor-pointer'
          )}
        >
          {status === 'loading' ? 'Enviando…' : status === 'success' ? '✓ Inscrito!' : 'Quero receber'}
        </button>
      </form>
      <p className="text-[10px] text-white/[.62] mt-1.5 text-center">
        Ao se inscrever você concorda com nossa Política de Privacidade.
      </p>
      {status === 'error' && errorMsg && (
        <p className="text-[11px] text-red-300 mt-1 text-center">
          {errorMsg}
        </p>
      )}
    </div>
  )
}
