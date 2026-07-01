import { NextResponse, type NextRequest } from 'next/server'

import { getSupabaseServer } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')

  if (code) {
    const supabase = getSupabaseServer()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL('/checkout', request.url))
    }

    logger.error({ route: '/auth/callback' }, 'Falha ao trocar codigo de autenticacao por sessao')
  }

  return NextResponse.redirect(new URL('/', request.url))
}
