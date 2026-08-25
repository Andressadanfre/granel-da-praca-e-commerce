import { createBrowserClient } from '@supabase/ssr'

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`[Supabase] Variavel de ambiente ausente: ${name}. Verifique o .env.local`)
  }
  return value
}

// Usar em Client Components ('use client') com ANON_KEY - RLS ativo
export function getSupabase() {
  return createBrowserClient(
    requireEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  )
}
