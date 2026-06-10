import 'server-only'

import pino, { type Logger as PinoLogger } from 'pino'

export type Logger = PinoLogger

import { sanitizeForLog } from '@/lib/sanitizeForLog'

export const SERVICE_NAME = 'granel-ecommerce'

const isProduction = process.env.NODE_ENV === 'production'

const basePino = pino({
  level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
  base: { service: SERVICE_NAME },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
  ...(!isProduction && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
})

export type LogContext = {
  userId?: string | null
  action?: string
  requestId?: string
}

export type AppLogFields = LogContext & {
  timestamp?: string
  level?: string
  service?: string
  [key: string]: unknown
}

/** Campos obrigatórios injetados em cada log via child logger. */
export function createLogger(ctx: LogContext = {}): Logger {
  return basePino.child({
    userId: ctx.userId ?? null,
    action: ctx.action ?? null,
    requestId: ctx.requestId ?? null,
  })
}

export const logger = createLogger()

export function serializeError(error: unknown): {
  message: string
  stack?: string
  name?: string
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    }
  }
  return { message: String(error) }
}

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

function logWithSanitize(
  log: Logger,
  level: LogLevel,
  fields: Record<string, unknown>,
  message: string,
): void {
  const sanitized = sanitizeForLog(fields)
  log[level](sanitized, message)
}

export function logError(
  log: Logger,
  error: unknown,
  fields: Record<string, unknown>,
  message: string,
): void {
  logWithSanitize(
    log,
    'error',
    {
      ...fields,
      err: serializeError(error),
    },
    message,
  )
}

export function logWarn(
  log: Logger,
  fields: Record<string, unknown>,
  message: string,
): void {
  logWithSanitize(log, 'warn', fields, message)
}

export function logInfo(
  log: Logger,
  fields: Record<string, unknown>,
  message: string,
): void {
  logWithSanitize(log, 'info', fields, message)
}

export function logDebug(
  log: Logger,
  fields: Record<string, unknown>,
  message: string,
): void {
  logWithSanitize(log, 'debug', fields, message)
}
