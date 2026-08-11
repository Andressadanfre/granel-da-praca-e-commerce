'use server'

import { headers } from 'next/headers'

import { getSupabaseServer } from '@/lib/supabase/server'
import { createLogger, logError } from '@/lib/logger'
import { authRatelimit } from '@/lib/rate-limit'
import { loginSchema, signupSchema } from './schemas'
import { ensureAppUser } from './ensureAppUser'

type Result = { success: true } | { success: false; error: string }

function getClientIp(): string {
  return headers().get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

export async function signInWithPasswordAction(input: unknown): Promise<Result> {
  const ip = getClientIp()
  const { success: rateLimitOk } = await authRatelimit.limit(ip)
  if (!rateLimitOk) {
    return { success: false, error: 'Muitas tentativas. Aguarde um minuto e tente novamente.' }
  }

  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Dados inválidos.' }
  }

  const supabase = getSupabaseServer()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { success: false, error: 'E-mail ou senha incorretos.' }
  }

  return { success: true }
}

export async function signUpWithPasswordAction(input: unknown): Promise<Result> {
  const ip = getClientIp()
  const { success: rateLimitOk } = await authRatelimit.limit(ip)
  if (!rateLimitOk) {
    return { success: false, error: 'Muitas tentativas. Aguarde um minuto e tente novamente.' }
  }

  const parsed = signupSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Dados inválidos.' }
  }

  const supabase = getSupabaseServer()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.name } },
  })

  if (error) {
    const log = createLogger({ action: 'signUpWithPasswordAction' })
    logError(log, error, { errorCode: error.code }, 'Falha ao criar conta')

    if (error.message.toLowerCase().includes('already registered')) {
      return { success: false, error: 'Este e-mail já possui cadastro.' }
    }
    return { success: false, error: 'Não foi possível criar sua conta.' }
  }

  if (!data.user) {
    return { success: false, error: 'Não foi possível criar sua conta.' }
  }

  // Sem esta linha, o pedido do usuario quebra por FK (orders.user_id -> app_users.id)
  try {
    await ensureAppUser(data.user, {
      marketingOptIn: parsed.data.marketingOptIn,
      termsVersion: 'v1-10082026',
    })
  } catch (err) {
    const log = createLogger({ action: 'signUpWithPasswordAction', userId: data.user.id })
    logError(log, err, {}, 'Falha ao provisionar app_users apos cadastro')
    return { success: false, error: 'Erro ao criar seu perfil. Tente novamente.' }
  }

  return { success: true }
}

export async function signOutAction(): Promise<{ success: true }> {
  const supabase = getSupabaseServer()
  await supabase.auth.signOut()
  return { success: true }
}
