import 'server-only'
import type { User } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase/server'

/**
 * orders.user_id tem FK para public.app_users(id) — nao para auth.users direto.
 * Sem esta linha, o primeiro pedido de um usuario novo quebra por violacao de FK.
 * Usa getSupabaseAdmin() porque authenticated so tem policy de select/update, nao insert.
 */
/** Versão vigente dos Termos de Uso / Política de Privacidade. Fonte única. */
export const TERMS_VERSION = 'v1-10082026'

interface ConsentInput {
  marketingOptIn: boolean
  termsVersion?: string
}

/**
 * Provisiona o registro em app_users. O consentimento é gravado UMA ÚNICA VEZ:
 * se terms_accepted_at já existe, nenhum campo de consentimento é tocado.
 * Isso preserva o valor probatório do aceite (data original) e impede que
 * login repetido ou provisionamento defensivo revoguem opt-in de marketing.
 */
export async function ensureAppUser(user: User, consent?: ConsentInput): Promise<void> {
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null

  const now = new Date().toISOString()
  const supabase = getSupabaseAdmin()

  const { data: existing, error: selectError } = await supabase
    .from('app_users')
    .select('terms_accepted_at')
    .eq('id', user.id)
    .maybeSingle()

  if (selectError) {
    throw new Error(`Falha ao consultar app_users: ${selectError.message}`)
  }

  const jaConsentiu = existing?.terms_accepted_at != null
  const deveGravarConsentimento = consent != null && !jaConsentiu

  const payload = {
    id: user.id,
    full_name: fullName,
    ...(deveGravarConsentimento
      ? {
          terms_accepted_at: now,
          terms_version: consent.termsVersion ?? TERMS_VERSION,
          marketing_opt_in: consent.marketingOptIn,
          marketing_opt_in_at: consent.marketingOptIn ? now : null,
        }
      : {}),
  }

  const { error } = await supabase
    .from('app_users')
    .upsert(payload, { onConflict: 'id' })

  if (error) {
    throw new Error(`Falha ao provisionar app_users: ${error.message}`)
  }
}
