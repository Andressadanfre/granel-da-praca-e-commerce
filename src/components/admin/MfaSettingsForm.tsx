'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield } from 'lucide-react'

import { isCompleteTotpCode, sanitizeTotpCode, totpQrImageSrc } from '@/lib/auth/totp'
import { getSupabase } from '@/lib/supabase/client'

export type VerifiedTotpFactor = {
  id: string
  createdAt: string
}

const ENROLL_ERROR = 'Não foi possível iniciar a autenticação de dois fatores. Tente novamente.'
const CONFIRM_ERROR = 'Código inválido. Confira o app autenticador e tente de novo.'
const UNENROLL_ERROR = 'Não foi possível desativar a autenticação de dois fatores. Tente novamente.'

function formatActivatedAt(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  })
}

interface MfaSettingsFormProps {
  verifiedFactor: VerifiedTotpFactor | null
}

export function MfaSettingsForm({ verifiedFactor }: MfaSettingsFormProps) {
  const router = useRouter()
  const [factor, setFactor] = useState<VerifiedTotpFactor | null>(verifiedFactor)
  const [enrolling, setEnrolling] = useState(false)
  const [pendingFactorId, setPendingFactorId] = useState<string | null>(null)
  const [qrSrc, setQrSrc] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmingUnenroll, setConfirmingUnenroll] = useState(false)

  async function startEnrollment() {
    setError(null)
    setIsSubmitting(true)
    const supabase = getSupabase()

    const { data: factors, error: listError } = await supabase.auth.mfa.listFactors()
    if (listError || !factors) {
      setError(ENROLL_ERROR)
      setIsSubmitting(false)
      return
    }

    const leftover = factors.all.filter(
      (item) => item.factor_type === 'totp' && item.status === 'unverified',
    )
    for (const item of leftover) {
      await supabase.auth.mfa.unenroll({ factorId: item.id })
    }

    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Admin Granel da Praça',
    })

    if (enrollError || !data || data.type !== 'totp') {
      setError(ENROLL_ERROR)
      setIsSubmitting(false)
      return
    }

    setPendingFactorId(data.id)
    setQrSrc(totpQrImageSrc(data.totp.qr_code))
    setCode('')
    setEnrolling(true)
    setIsSubmitting(false)
  }

  async function cancelEnrollment() {
    setError(null)
    if (pendingFactorId) {
      const supabase = getSupabase()
      await supabase.auth.mfa.unenroll({ factorId: pendingFactorId })
    }
    setEnrolling(false)
    setPendingFactorId(null)
    setQrSrc(null)
    setCode('')
  }

  async function confirmEnrollment() {
    setError(null)
    if (!pendingFactorId || !isCompleteTotpCode(code)) {
      setError('Informe o código de 6 dígitos gerado pelo app.')
      return
    }

    setIsSubmitting(true)
    const supabase = getSupabase()
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: pendingFactorId,
      code,
    })

    if (verifyError) {
      setError(CONFIRM_ERROR)
      setIsSubmitting(false)
      return
    }

    setFactor({ id: pendingFactorId, createdAt: new Date().toISOString() })
    setEnrolling(false)
    setPendingFactorId(null)
    setQrSrc(null)
    setCode('')
    setIsSubmitting(false)
    router.refresh()
  }

  async function handleUnenroll() {
    if (!factor) return
    setError(null)
    setIsSubmitting(true)
    const supabase = getSupabase()
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({
      factorId: factor.id,
    })

    if (unenrollError) {
      setError(UNENROLL_ERROR)
      setIsSubmitting(false)
      return
    }

    setFactor(null)
    setConfirmingUnenroll(false)
    setIsSubmitting(false)
    router.refresh()
  }

  return (
    <div className="overflow-hidden rounded-card border border-bd bg-white shadow-card">
      <div className="flex items-center gap-2 border-b border-bd px-[18px] py-3.5">
        <Shield size={14} strokeWidth={1.6} className="text-t6" />
        <h2 className="text-[13px] font-semibold text-t9">Autenticação de dois fatores</h2>
      </div>

      <div className="px-[18px] py-5">
        {factor && !enrolling ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-t6">
              2FA ativado em {formatActivatedAt(factor.createdAt)}.
            </p>

            {confirmingUnenroll ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-t6">
                  Tem certeza? No próximo login o código do autenticador não será mais pedido.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleUnenroll()}
                    disabled={isSubmitting}
                    className="inline-flex h-[34px] items-center rounded-input bg-danger px-[18px] text-xs font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60"
                  >
                    {isSubmitting ? 'Desativando…' : 'Confirmar desativação'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingUnenroll(false)}
                    disabled={isSubmitting}
                    className="inline-flex h-[34px] items-center rounded-input border border-bd bg-white px-[18px] text-xs font-medium text-t6 transition-colors hover:bg-gray-100 disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingUnenroll(true)}
                className="inline-flex h-[34px] w-fit items-center rounded-input border border-bd bg-white px-[18px] text-xs font-medium text-t6 transition-colors hover:bg-gray-100"
              >
                Desativar
              </button>
            )}
          </div>
        ) : enrolling && qrSrc ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-t6">
              Abra o Google Authenticator, Authy ou similar, escaneie o QR e digite o primeiro código de 6 dígitos.
            </p>
            <div className="flex justify-center rounded-inner bg-white p-3">
              {/* QR do enroll é data URI SVG; next/image exige dangerouslyAllowSVG. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrSrc}
                alt="QR code para o aplicativo autenticador"
                width={180}
                height={180}
                className="h-[180px] w-[180px]"
              />
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void confirmEnrollment()
              }}
              className="flex flex-col gap-3"
            >
              <div>
                <label htmlFor="enroll-totp-code" className="mb-1.5 block text-xs font-medium text-t6">
                  Código de 6 dígitos
                </label>
                <input
                  id="enroll-totp-code"
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
                  className="h-[38px] w-full max-w-[220px] rounded-input border border-bd bg-white px-3 text-center text-lg tracking-[0.4em] text-t9 outline-none placeholder:tracking-normal placeholder:text-t4 focus:border-g focus:shadow-[0_0_0_3px_rgba(0,178,7,0.08)]"
                  placeholder="000000"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-[34px] items-center rounded-input bg-g px-[18px] text-xs font-semibold text-white transition-colors hover:bg-ghover disabled:opacity-60"
                >
                  {isSubmitting ? 'Confirmando…' : 'Confirmar e ativar'}
                </button>
                <button
                  type="button"
                  onClick={() => void cancelEnrollment()}
                  disabled={isSubmitting}
                  className="inline-flex h-[34px] items-center rounded-input border border-bd bg-white px-[18px] text-xs font-medium text-t6 transition-colors hover:bg-gray-100 disabled:opacity-60"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-t6">
              Protege o painel com um código temporário do celular. É opcional — você escolhe quando ativar.
            </p>
            <button
              type="button"
              onClick={() => void startEnrollment()}
              disabled={isSubmitting}
              className="inline-flex h-[34px] w-fit items-center rounded-input bg-g px-[18px] text-xs font-semibold text-white transition-colors hover:bg-ghover disabled:opacity-60"
            >
              {isSubmitting ? 'Gerando QR…' : 'Ativar autenticação de dois fatores'}
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-inner border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] font-medium text-danger"
          >
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
