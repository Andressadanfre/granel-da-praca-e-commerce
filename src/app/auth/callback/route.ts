import { NextResponse, type NextRequest } from 'next/server'

import { getSupabaseServer } from '@/lib/supabase/server'
import { createLogger, logError } from '@/lib/logger'
import { ensureAppUser } from '@/lib/auth/ensureAppUser'
import { safeRedirect } from '@/lib/auth/safeRedirect'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const redirectParam = request.nextUrl.searchParams.get('redirect')
  const destination = safeRedirect(redirectParam)

  if (code) {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Sem esta linha, o pedido do usuario quebra por FK (orders.user_id -> app_users.id)
      // Fluxo OAuth nao tem checkbox — consentimento implicito por texto visivel na tela de cadastro.
      // marketingOptIn sempre false aqui: opt-in de marketing exige acao explicita, nunca default.
      try {
        await ensureAppUser(data.user, { marketingOptIn: false, termsVersion: 'v1-10082026' })
        return NextResponse.redirect(new URL(destination, request.url))
      } catch (err) {
        const log = createLogger({ action: 'auth_callback', userId: data.user.id })
        logError(log, err, {}, 'Falha ao provisionar app_users no callback OAuth')
        return NextResponse.redirect(new URL('/conta/login?erro=perfil', request.url))
      }
    }

    const log = createLogger({ action: 'auth_callback' })
    logError(log, error, {}, 'Falha ao trocar codigo de autenticacao por sessao')
  }

  return NextResponse.redirect(new URL('/', request.url))
}
