'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { signOutAction } from '@/lib/auth/actions'
import { safeAdminRedirect } from '@/lib/auth/safeRedirect'
import { isCompleteTotpCode, sanitizeTotpCode } from '@/lib/auth/totp'
import { getSupabase } from '@/lib/supabase/client'

const CODE_ERROR = 'Código inválido. Confira o app autenticador e tente de novo.'
const GENERIC_ERROR = 'Não foi possível verificar o código. Tente novamente.'

export function MfaChallengeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const postVerifyPath = safeAdminRedirect(searchParams.get('redirect'))

  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSubmit() {
    setError(null)

    if (!isCompleteTotpCode(code)) {
      setError('Informe o código de 6 dígitos.')
      return
    }

    setIsSubmitting(true)
    const supabase = getSupabase()

    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
    if (factorsError || !factors) {
      setError(GENERIC_ERROR)
      setIsSubmitting(false)
      return
    }

    const totpFactor = factors.totp[0]
    if (!totpFactor) {
      setError(GENERIC_ERROR)
      setIsSubmitting(false)
      return
    }

    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: totpFactor.id,
      code,
    })

    if (verifyError) {
      setError(CODE_ERROR)
      setIsSubmitting(false)
      return
    }

    router.replace(postVerifyPath)
    router.refresh()
  }

  async function handleSignOut() {
    setIsSigningOut(true)
    await signOutAction()
    router.push('/conta/login?redirect=/admin/pedidos')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px] rounded-card border border-bd bg-white p-8 shadow-card">
        <h1 className="text-xl font-bold text-t9">Verificação em duas etapas</h1>
        <p className="mt-1 text-sm text-t6">
          Digite o código de 6 dígitos do aplicativo autenticador.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleSubmit()
          }}
          className="mt-6 flex flex-col gap-3"
        >
          <div>
            <label htmlFor="totp-code" className="mb-1.5 block text-xs font-medium text-t6">
              Código de verificação
            </label>
            <input
              id="totp-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(sanitizeTotpCode(e.target.value))
                if (error) setError(null)
              }}
              aria-invalid={error != null}
              aria-describedby={error ? 'totp-code-error' : undefined}
              className="h-[38px] w-full rounded-input border border-bd bg-white px-3 text-center text-lg tracking-[0.4em] text-t9 outline-none placeholder:tracking-normal placeholder:text-t4 focus:border-g focus:shadow-[0_0_0_3px_rgba(0,178,7,0.08)]"
              placeholder="000000"
            />
          </div>

          {error && (
            <div
              id="totp-code-error"
              role="alert"
              className="rounded-inner border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] font-medium text-danger"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isSigningOut}
            className="mt-1 h-12 w-full rounded-inner bg-g text-[14px] font-bold text-white transition-colors hover:bg-ghover disabled:opacity-50"
          >
            {isSubmitting ? 'Verificando…' : 'Verificar'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={isSubmitting || isSigningOut}
          className="mt-5 w-full text-center text-sm font-medium text-t5 transition-colors hover:text-t7 disabled:opacity-50"
        >
          {isSigningOut ? 'Saindo…' : 'Sair da conta'}
        </button>
      </div>
    </div>
  )
}
