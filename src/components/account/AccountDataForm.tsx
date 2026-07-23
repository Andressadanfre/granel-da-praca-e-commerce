'use client'

import { useState, type FormEvent } from 'react'

import {
  changePasswordAction,
  updateProfileAction,
} from '@/app/conta/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import type { AccountUser } from '@/lib/account/types'
import { cn } from '@/lib/utils'

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

interface AccountDataFormProps {
  user: AccountUser
}

export function AccountDataForm({ user }: AccountDataFormProps) {
  const [fullName, setFullName] = useState(user.fullName ?? '')
  const [phone, setPhone] = useState(user.phone ? maskPhone(user.phone) : '')
  const [password, setPassword] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault()
    setProfileError(null)
    setProfileSuccess(false)
    setProfileLoading(true)

    const result = await updateProfileAction({ fullName, phone })
    setProfileLoading(false)

    if (!result.success) {
      setProfileError(result.error)
      return
    }
    setProfileSuccess(true)
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)
    setPasswordLoading(true)

    const result = await changePasswordAction({ password })
    setPasswordLoading(false)

    if (!result.success) {
      setPasswordError(result.error)
      return
    }
    setPassword('')
    setPasswordSuccess(true)
  }

  return (
    <section id="dados">
      <h2 className="mb-1 text-xl font-bold text-t9 md:text-2xl">Meus Dados</h2>
      <p className="mb-5 text-[13.5px] text-t6">
        Mantenha suas informações de contato atualizadas.
      </p>

      <div className="rounded-card bg-white p-7 shadow-card">
        <form onSubmit={handleSaveProfile}>
          <p className="mb-4 text-sm font-semibold text-t9">Informações pessoais</p>

          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nome completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              required
            />
            <div>
              <Input
                label="E-mail"
                type="email"
                value={user.email}
                disabled
                autoComplete="email"
              />
              <p className="mt-1 text-[11px] text-t4">
                Para alterar o e-mail, entre em contato com o suporte.
              </p>
            </div>
            <div className="sm:col-span-2">
              <Input
                label="WhatsApp"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                autoComplete="tel"
                inputMode="tel"
                required
              />
            </div>
          </div>

          {profileError && (
            <p role="alert" className="mb-3 text-sm text-danger">
              {profileError}
            </p>
          )}
          {profileSuccess && (
            <p role="status" className="mb-3 text-sm font-medium text-gd">
              Dados salvos com sucesso.
            </p>
          )}

          <Button type="submit" variant="cart" isLoading={profileLoading}>
            Salvar alterações
          </Button>
        </form>

        <div className="my-6 h-px bg-bd" role="separator" />

        <form onSubmit={handleChangePassword}>
          <p className="mb-4 text-sm font-semibold text-t9">Senha</p>
          <div className={cn('mb-5 max-w-md')}>
            <PasswordInput
              label="Nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>

          {passwordError && (
            <p role="alert" className="mb-3 text-sm text-danger">
              {passwordError}
            </p>
          )}
          {passwordSuccess && (
            <p role="status" className="mb-3 text-sm font-medium text-gd">
              Senha alterada com sucesso.
            </p>
          )}

          <Button type="submit" variant="secondary" isLoading={passwordLoading}>
            Alterar senha
          </Button>
        </form>
      </div>
    </section>
  )
}
