const SENSITIVE_KEYS = new Set([
  'password',
  'passwd',
  'token',
  'access_token',
  'refresh_token',
  'id_token',
  'cardnumber',
  'card_number',
  'pan',
  'cvv',
  'cvc',
  'cpf',
  'cnpj',
  'email',
  'authorization',
  'apikey',
  'api_key',
  'secret',
  'service_role_key',
  'anon_key',
])

const ALLOWED_KEYS = new Set(['last4', 'last_4', 'userid', 'user_id', 'requestid', 'request_id'])

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CPF_PATTERN = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[-\s]/g, '_')
}

function maskEmail(value: string): string {
  const at = value.indexOf('@')
  if (at <= 0) return '***'
  return `***@${value.slice(at + 1)}`
}

function maskCpf(): string {
  return '***.***.***-**'
}

function maskCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length >= 4) return `****${digits.slice(-4)}`
  return '****'
}

function maskScalar(key: string, value: unknown): unknown {
  const normalized = normalizeKey(key)

  if (ALLOWED_KEYS.has(normalized)) {
    return value
  }

  if (SENSITIVE_KEYS.has(normalized)) {
    if (typeof value !== 'string') return '[REDACTED]'
    if (normalized === 'email' || EMAIL_PATTERN.test(value)) return maskEmail(value)
    if (normalized === 'cpf' || CPF_PATTERN.test(value)) return maskCpf()
    if (normalized === 'cardnumber' || normalized === 'card_number') {
      return maskCardNumber(value)
    }
    return '[REDACTED]'
  }

  if (typeof value === 'string') {
    if (EMAIL_PATTERN.test(value)) return maskEmail(value)
    if (CPF_PATTERN.test(value)) return maskCpf()
  }

  return value
}

function sanitizeValue(value: unknown, depth = 0): unknown {
  if (depth > 8) return '[MAX_DEPTH]'

  if (value === null || value === undefined) return value

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, depth + 1))
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(record)) {
      if (typeof child === 'object' && child !== null && !Array.isArray(child)) {
        out[key] = sanitizeValue(child, depth + 1)
      } else if (Array.isArray(child)) {
        out[key] = sanitizeValue(child, depth + 1)
      } else {
        out[key] = maskScalar(key, child)
      }
    }
    return out
  }

  if (typeof value === 'string' && EMAIL_PATTERN.test(value)) {
    return maskEmail(value)
  }

  return value
}

/** Remove ou mascara dados sensíveis (LGPD) antes de enviar ao logger. */
export function sanitizeForLog<T>(payload: T): T {
  return sanitizeValue(payload) as T
}
