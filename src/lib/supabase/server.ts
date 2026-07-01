import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`[Supabase] Variavel de ambiente ausente: ${name}. Verifique o .env.local`)
  }
  return value
}

const SUPABASE_URL = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
const SUPABASE_ANON_KEY = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

// Server Components e Server Actions - RLS ativo via cookies
export function getSupabaseServer() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Chamado a partir de um Server Component - cookies sao somente leitura.
            // Seguro ignorar: sessao ja foi validada e sera refletida via middleware/Route Handler.
          }
        },
      },
    },
  )
}

// Operacoes administrativas - bypass de RLS - NUNCA importar em Client Components
export function getSupabaseAdmin(): SupabaseClient<Database> {
  return createClient<Database>(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
  )
}
