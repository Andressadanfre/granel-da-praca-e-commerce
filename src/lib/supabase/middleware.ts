import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Renova o token de sessao a cada request. Sem isso, Server Components (que so
 * conseguem LER cookies, nunca escrever) nao renovam o access token expirado —
 * o usuario cai deslogado silenciosamente ao navegar. Nao reaproveita
 * getSupabaseServer() porque aqui os cookies vem de request/response, nao de
 * next/headers cookies().
 *
 * Retorna tambem o client `supabase` (anon + cookies) para o middleware
 * reaproveitar em queries sob RLS — sem recriar client nem usar service_role.
 */
export async function updateSession(
  request: NextRequest,
): Promise<{
  response: NextResponse
  user: User | null
  supabase: SupabaseClient<Database>
}> {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  return { response, user, supabase }
}
