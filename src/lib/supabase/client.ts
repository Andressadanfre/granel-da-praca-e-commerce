import { createBrowserClient } from '@supabase/ssr'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`[Supabase] Variavel de ambiente ausente: ${name}. Verifique o .env.local`)
  }
  return value
}

const SUPABASE_URL = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
const SUPABASE_ANON_KEY = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

// Usar em Client Components ('use client') com ANON_KEY - RLS ativo
export function getSupabase() {
  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
  )
}
