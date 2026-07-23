import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request)

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
      .select('id')
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
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
