import { createBrowserClient } from '@supabase/ssr'

// Usar em Client Components ('use client') com ANON_KEY — RLS ativo
export function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
