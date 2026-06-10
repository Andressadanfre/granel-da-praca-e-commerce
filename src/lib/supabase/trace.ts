import 'server-only'

import type { Logger } from '@/lib/logger'
import type { PostgrestError } from '@supabase/supabase-js'

import { logDebug, logError } from '@/lib/logger'
import { sanitizeForLog } from '@/lib/sanitizeForLog'

export type SupabaseTraceMeta = {
  queryName: string
  table: string
  operation: string
  requestId?: string
  userId?: string | null
}

export function logSupabaseError(
  log: Logger,
  meta: SupabaseTraceMeta,
  error: PostgrestError | null,
  durationMs: number,
): void {
  if (!error) return

  logError(
    log,
    new Error(error.message),
    sanitizeForLog({
      action: meta.queryName,
      requestId: meta.requestId,
      userId: meta.userId ?? null,
      table: meta.table,
      operation: meta.operation,
      errorCode: error.code,
      durationMs,
    }),
    `Supabase ${meta.operation} failed on ${meta.table}`,
  )
}

export async function traceSupabaseQuery<T>(
  log: Logger,
  meta: SupabaseTraceMeta,
  fn: () => Promise<T>,
): Promise<T> {
  const start = performance.now()
  try {
    const result = await fn()
    const durationMs = Math.round(performance.now() - start)
    logDebug(
      log,
      sanitizeForLog({
        action: meta.queryName,
        requestId: meta.requestId,
        userId: meta.userId ?? null,
        table: meta.table,
        operation: meta.operation,
        durationMs,
      }),
      `Supabase ${meta.operation} completed on ${meta.table}`,
    )
    return result
  } catch (error) {
    const durationMs = Math.round(performance.now() - start)
    logError(
      log,
      error,
      sanitizeForLog({
        action: meta.queryName,
        requestId: meta.requestId,
        userId: meta.userId ?? null,
        table: meta.table,
        operation: meta.operation,
        durationMs,
      }),
      `Supabase ${meta.operation} threw on ${meta.table}`,
    )
    throw error
  }
}
