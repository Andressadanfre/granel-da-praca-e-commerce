import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// REGRA: nunca instanciar no top-level do módulo
// Sempre usar getSupabase() ou getSupabaseServer()

let _client: ReturnType<typeof createClientComponentClient> | null = null

export function getSupabase() {
  if (!_client) {
    _client = createClientComponentClient()
  }
  return _client
}

export function getSupabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
