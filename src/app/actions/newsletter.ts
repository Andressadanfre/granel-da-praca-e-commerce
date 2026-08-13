'use server'

import { headers } from 'next/headers'

import { createLogger, logError } from '@/lib/logger'
import { newsletterRatelimit } from '@/lib/rate-limit'
import { getSupabaseAdmin } from '@/lib/supabase/server'

type Result = { success: true } | { success: false; error: string }

export async function subscribeNewsletter(email: string): Promise<Result> {
  const ip = headers().get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rateLimitResult = await newsletterRatelimit.limit(ip)
  if (rateLimitResult.pending) {
    await rateLimitResult.pending
  }
  const { success: rateLimitOk } = rateLimitResult
  if (!rateLimitOk) {
    return { success: false, error: 'Muitas tentativas. Tente novamente em alguns minutos.' }
  }

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
