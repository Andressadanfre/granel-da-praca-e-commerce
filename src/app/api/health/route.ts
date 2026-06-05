import { NextResponse } from 'next/server'

import { createLogger, logError, logInfo } from '@/lib/logger'
import { getSupabaseServer } from '@/lib/supabase/server'
import { logSupabaseError } from '@/lib/supabase/trace'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const requestId = crypto.randomUUID()
  const log = createLogger({ action: 'healthCheck', requestId })
  const ts = Date.now()

  try {
    const start = performance.now()
    const supabase = getSupabaseServer()
    const { error } = await supabase.from('categories').select('id').limit(1)
    const durationMs = Math.round(performance.now() - start)

    if (error) {
      logSupabaseError(
        log,
        {
          queryName: 'healthCheck',
          table: 'categories',
          operation: 'select',
          requestId,
        },
        error,
        durationMs,
      )
      return NextResponse.json(
        { status: 'error', db: 'disconnected', ts },
        { status: 503 },
      )
    }

    logInfo(log, { durationMs, table: 'categories', operation: 'select' }, 'Health check OK')
    return NextResponse.json({ status: 'ok', db: 'connected', ts })
  } catch (error) {
    logError(log, error, { durationMs: 0 }, 'Health check exception')
    return NextResponse.json(
      { status: 'error', db: 'disconnected', ts },
      { status: 503 },
    )
  }
}
