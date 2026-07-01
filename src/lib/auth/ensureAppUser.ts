import 'server-only'
import type { User } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase/server'

/**
 * orders.user_id tem FK para public.app_users(id) — nao para auth.users direto.
 * Sem esta linha, o primeiro pedido de um usuario novo quebra por violacao de FK.
 * Usa getSupabaseAdmin() porque authenticated so tem policy de select/update, nao insert.
 */
export async function ensureAppUser(user: User): Promise<void> {
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('app_users')
    .upsert({ id: user.id, full_name: fullName }, { onConflict: 'id' })

  if (error) {
    throw new Error(`Falha ao provisionar app_users: ${error.message}`)
  }
}
