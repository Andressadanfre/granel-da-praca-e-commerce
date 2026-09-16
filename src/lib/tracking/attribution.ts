import { z } from 'zod'

export const ATTRIBUTION_COOKIE_NAME = 'granel_attribution'
export const ATTRIBUTION_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60

const MAX_PARAM_LENGTH = 255
const MAX_FBC_LENGTH = 512
const MAX_COOKIE_LENGTH = 2048

export type Attribution = {
  gclid?: string
  fbc?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  channel_origin?: string
}

const attributionSchema = z.object({
  gclid: z.string().min(1).max(MAX_PARAM_LENGTH).optional(),
  fbc: z.string().min(1).max(MAX_FBC_LENGTH).optional(),
  utm_source: z.string().min(1).max(MAX_PARAM_LENGTH).optional(),
  utm_medium: z.string().min(1).max(MAX_PARAM_LENGTH).optional(),
  utm_campaign: z.string().min(1).max(MAX_PARAM_LENGTH).optional(),
  utm_content: z.string().min(1).max(MAX_PARAM_LENGTH).optional(),
  utm_term: z.string().min(1).max(MAX_PARAM_LENGTH).optional(),
  channel_origin: z.string().min(1).max(MAX_PARAM_LENGTH).optional(),
})

const ATTRIBUTION_KEYS = [
  'gclid',
  'fbc',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'channel_origin',
] as const

function sanitizeParam(value: string | null, maxLength = MAX_PARAM_LENGTH): string | undefined {
  if (!value) return undefined
  const cleaned = value.trim().replace(/[\u0000-\u001F\u007F]/g, '')
  if (!cleaned) return undefined
  return cleaned.slice(0, maxLength)
}

function compactAttribution(input: Attribution): Attribution | null {
  const out: Attribution = {}
  for (const key of ATTRIBUTION_KEYS) {
    const value = input[key]
    if (typeof value === 'string' && value.length > 0) {
      out[key] = value
    }
  }
  return ATTRIBUTION_KEYS.some((key) => out[key] !== undefined) ? out : null
}

function deriveChannelOrigin(gclid?: string, fbclid?: string, utmSource?: string): string | undefined {
  if (gclid) return 'google_ads'
  if (fbclid) return 'meta_ads'

  const source = utmSource?.toLowerCase()
  if (!source) return undefined
  if (source === 'google' || source === 'googleads' || source === 'adwords') return 'google_ads'
  if (
    source === 'meta' ||
    source === 'facebook' ||
    source === 'fb' ||
    source === 'ig' ||
    source === 'instagram'
  ) {
    return 'meta_ads'
  }
  return source
}

/** Formato CAPI do Meta: fb.{subdomainIndex}.{createdAtMs}.{fbclid} */
export function buildFbc(fbclid: string, createdAtMs = Date.now()): string {
  return `fb.1.${createdAtMs}.${fbclid}`
}

export function extractAttributionFromUrl(
  url: URL,
  createdAtMs = Date.now(),
): Attribution | null {
  const gclid = sanitizeParam(url.searchParams.get('gclid'))
  const fbclid = sanitizeParam(url.searchParams.get('fbclid'))
  const utm_source = sanitizeParam(url.searchParams.get('utm_source'))
  const utm_medium = sanitizeParam(url.searchParams.get('utm_medium'))
  const utm_campaign = sanitizeParam(url.searchParams.get('utm_campaign'))
  const utm_content = sanitizeParam(url.searchParams.get('utm_content'))
  const utm_term = sanitizeParam(url.searchParams.get('utm_term'))

  const hasCampaignSignal = Boolean(
    gclid || fbclid || utm_source || utm_medium || utm_campaign || utm_content || utm_term,
  )
  if (!hasCampaignSignal) return null

  return compactAttribution({
    gclid,
    fbc: fbclid ? buildFbc(fbclid, createdAtMs) : undefined,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    channel_origin: deriveChannelOrigin(gclid, fbclid, utm_source),
  })
}

export function parseAttributionCookie(value: string | undefined): Attribution | null {
  if (!value || value.length > MAX_COOKIE_LENGTH) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(value) as unknown
  } catch {
    return null
  }

  const result = attributionSchema.safeParse(parsed)
  if (!result.success) return null

  return compactAttribution(result.data)
}
