import 'server-only'

import { createLogger, type Logger } from '@/lib/logger'

export type ServerActionContext = {
  requestId: string
  log: Logger
}

/** Gera requestId e logger com contexto para rastrear uma Server Action. */
export function createServerActionContext(
  action: string,
  userId?: string | null,
): ServerActionContext {
  const requestId = crypto.randomUUID()
  const log = createLogger({
    action,
    requestId,
    userId: userId ?? null,
  })
  return { requestId, log }
}
