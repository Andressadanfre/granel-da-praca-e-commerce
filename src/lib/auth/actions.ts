'use server'

import { getSupabaseServer } from '@/lib/supabase/server'
import { createLogger, logError } from '@/lib/logger'
import { loginSchema, signupSchema } from './schemas'
import { ensureAppUser } from './ensureAppUser'

type Result = { success: true } | { success: false; error: string }

export async function signInWithPasswordAction(input: unknown): Promise<Result> {
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
    await ensureAppUser(data.user)
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
