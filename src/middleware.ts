import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { safeAdminRedirect } from '@/lib/auth/safeRedirect'
import {
  ATTRIBUTION_COOKIE_NAME,
  ATTRIBUTION_COOKIE_MAX_AGE_SECONDS,
  extractAttributionFromUrl,
} from '@/lib/tracking/attribution'

function isAdminMfaChallengePath(pathname: string): boolean {
  return (
    pathname === '/admin/mfa-challenge' ||
    pathname.startsWith('/admin/mfa-challenge/')
  )
}

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request)

  // Fase 1B — first-touch: só grava se ainda não existe cookie de atribuição
  // e a URL atual carrega algum sinal de campanha (gclid/fbclid/utm_*).
  if (!request.cookies.get(ATTRIBUTION_COOKIE_NAME)) {
    const attribution = extractAttributionFromUrl(request.nextUrl)
    if (attribution) {
      response.cookies.set(ATTRIBUTION_COOKIE_NAME, JSON.stringify(attribution), {
        httpOnly: true,
        // Secure cookies são rejeitados em http://localhost; em Vercel o request é https.
        secure: request.nextUrl.protocol === 'https:',
        sameSite: 'lax',
        maxAge: ATTRIBUTION_COOKIE_MAX_AGE_SECONDS,
        path: '/',
      })
    }
  }

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(
        new URL('/conta/login?redirect=/admin/pedidos', request.url),
      )
    }

    // RLS admin_users_select_own: só retorna linha se o próprio user for admin ativo.
    // Query roda APENAS em /admin — zero latência extra em rotas públicas.
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)

    if (error) {
      // Falha de infra (banco/timeout) — bloqueia, mas não afirma "acesso negado"
      return NextResponse.redirect(
        new URL('/?erro=admin_indisponivel', request.url),
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.redirect(
        new URL('/?erro=acesso_negado', request.url),
      )
    }

    const role = data[0].role as 'owner' | 'supervisora'
    const { pathname } = request.nextUrl
    const isMfaChallengePath = isAdminMfaChallengePath(pathname)

    if (role === 'supervisora') {
      const isAllowedArea =
        pathname.startsWith('/admin/produtos') ||
        pathname.startsWith('/admin/pedidos') ||
        isMfaChallengePath

      const isHomeRoot = pathname === '/admin' || pathname === '/admin/dashboard'

      if (isHomeRoot) {
        return NextResponse.redirect(new URL('/admin/produtos', request.url))
      }

      if (!isAllowedArea) {
        return NextResponse.redirect(
          new URL('/admin/produtos?erro=sem_permissao', request.url),
        )
      }
    }

    const { data: aalData, error: aalError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

    if (aalError || !aalData) {
      return NextResponse.redirect(
        new URL('/?erro=admin_indisponivel', request.url),
      )
    }

    // 2FA opt-in: sem fator verificado, currentLevel === nextLevel (ambos aal1) — passa.
    // Com fator verificado e sessão ainda em aal1, currentLevel !== nextLevel — challenge.
    if (aalData.currentLevel !== aalData.nextLevel) {
      if (!isMfaChallengePath) {
        const challengeUrl = new URL('/admin/mfa-challenge', request.url)
        const from = `${pathname}${request.nextUrl.search}`
        if (from.startsWith('/admin') && !from.startsWith('/admin/mfa-challenge')) {
          challengeUrl.searchParams.set('redirect', from)
        }
        return NextResponse.redirect(challengeUrl)
      }
    } else if (isMfaChallengePath) {
      return NextResponse.redirect(
        new URL(safeAdminRedirect(request.nextUrl.searchParams.get('redirect')), request.url),
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
