import 'server-only'

import pino, { type Logger as PinoLogger } from 'pino'

export type Logger = PinoLogger

import { sanitizeForLog } from '@/lib/sanitizeForLog'

export const SERVICE_NAME = 'granel-ecommerce'

const isProduction = process.env.NODE_ENV === 'production'

const pinoOptions = {
  level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
  base: { service: SERVICE_NAME },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label: string) => ({ level: label }),
  },
}

/**
 * Dev: pino-pretty como stream síncrono no processo principal
 * (evita worker thread / thread-stream — fonte de uncaughtException no Next.js).
 * Prod: JSON puro no stdout, sem pretty.
 */
const basePino: PinoLogger = isProduction
  ? pino(pinoOptions)
  : pino(
      pinoOptions,
      // require condicional: pino-pretty é devDependency e não deve entrar no bundle de prod
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require('pino-pretty') as typeof import('pino-pretty'))({
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        sync: true,
      }),
    )

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

type SerializedError = {
  message: string
  stack?: string
  name?: string
  code?: string
  details?: string
  hint?: string
}

function asOptionalString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return undefined
}

function stringifyUnknown(value: unknown): string {
  if (typeof value === 'string') return value
  try {
    const json = JSON.stringify(value)
    if (typeof json === 'string' && json.length > 0) return json
  } catch {
    // ignore — fallback abaixo
  }
  return String(value)
}

/**
 * Serializa Error nativo e objetos planos de erro (ex.: PostgrestError do Supabase
 * com message/code/details/hint) sem cair em String(obj) → "[object Object]".
 */
export function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    const withExtras = error as Error & {
      code?: unknown
      details?: unknown
      hint?: unknown
    }
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: asOptionalString(withExtras.code),
      details: asOptionalString(withExtras.details),
      hint: asOptionalString(withExtras.hint),
    }
  }

  if (error !== null && typeof error === 'object') {
    const obj = error as Record<string, unknown>
    const message = asOptionalString(obj.message) ?? stringifyUnknown(error)
    return {
      message,
      name: asOptionalString(obj.name),
      stack: asOptionalString(obj.stack),
      code: asOptionalString(obj.code),
      details: asOptionalString(obj.details),
      hint: asOptionalString(obj.hint),
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
  try {
    const sanitized = sanitizeForLog(fields)
    log[level](sanitized, message)
  } catch (err) {
    try {
      process.stderr.write(
        `[${level}] ${message} | logging_failed=${JSON.stringify(serializeError(err))}\n`,
      )
    } catch {
      // Último recurso: nunca relançar — logging não pode derrubar a request
    }
  }
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
