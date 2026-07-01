'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signUpWithPasswordAction } from '@/lib/auth/actions'
import { GoogleButton } from './GoogleButton'

export function SignupForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setError(null)

    if (!name.trim())      { setError('Informe seu nome completo.'); return }
    if (!email.trim())     { setError('Informe seu e-mail.'); return }
    if (password.length < 6) { setError('Senha deve ter no mínimo 6 caracteres.'); return }

    setIsSubmitting(true)
    const result = await signUpWithPasswordAction({
      name: name.trim(),
      email: email.trim(),
      password,
    })

    if (!result.success) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    router.push('/checkout')
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px] rounded-card border border-bd bg-white p-8 shadow-card">
        <h1 className="text-xl font-bold text-t9">Criar conta</h1>
        <p className="mt-1 text-sm text-t6">Leva menos de um minuto</p>

        <div className="mt-6">
          <GoogleButton />
        </div>

        <div className="my-5 flex items-center gap-3 text-xs text-t4">
          <span className="h-px flex-1 bg-bd" />
          ou
          <span className="h-px flex-1 bg-bd" />
        </div>

        <form
          onSubmit={e => { e.preventDefault(); handleSubmit() }}
          className="flex flex-col gap-3"
        >
          <div className="checkout-field !mb-0">
            <input
              id="name"
              type="text"
              placeholder=" "
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
            />
            <label htmlFor="name">Nome completo</label>
          </div>

          <div className="checkout-field !mb-0">
            <input
              id="email"
              type="email"
              placeholder=" "
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
            <label htmlFor="email">E-mail</label>
          </div>

          <div className="checkout-field !mb-0">
            <input
              id="password"
              type="password"
              placeholder=" "
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <label htmlFor="password">Senha</label>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-inner border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] font-medium text-danger">
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
                strokeLinejoin="round" className="mt-0.5 flex-shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 h-12 w-full rounded-inner bg-g text-[14px] font-bold text-white transition-colors hover:bg-ghover disabled:opacity-50"
          >
            {isSubmitting ? 'Criando conta…' : 'Criar conta grátis'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-t6">
          Já tem conta?{' '}
          <Link href="/conta/login" className="font-semibold text-g hover:text-ghover">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
