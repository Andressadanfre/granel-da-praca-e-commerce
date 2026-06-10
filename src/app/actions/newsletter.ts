'use server'

import { createLogger, logError } from '@/lib/logger'
import { getSupabaseAdmin } from '@/lib/supabase/server'

type Result = { success: true } | { success: false; error: string }

export async function subscribeNewsletter(email: string): Promise<Result> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'E-mail inválido.' }
  }

  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('newsletter_subscriptions')
    .insert({ email: email.toLowerCase().trim() })

  if (error) {
    // Violação de unique constraint = e-mail já cadastrado
    if (error.code === '23505') {
      return { success: false, error: 'E-mail já cadastrado.' }
    }
    const log = createLogger({ action: 'subscribeNewsletter' })
    logError(log, error, { errorCode: error.code }, 'Newsletter subscription failed')
    return { success: false, error: 'Erro ao cadastrar. Tente novamente.' }
  }

  return { success: true }
}
