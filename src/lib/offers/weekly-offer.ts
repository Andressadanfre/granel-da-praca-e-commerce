import { getSupabaseServer } from '@/lib/supabase/server'
import { logger, logError, logWarn } from '@/lib/logger'

function getNextSundayEndISO(): string {
  const now = new Date()
  const sunday = new Date()
  sunday.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7))
  sunday.setHours(23, 59, 59, 0)
  return sunday.toISOString()
}

export async function getWeeklyOfferExpiresAt(): Promise<string> {
  try {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from('weekly_offer_settings')
      .select('expires_at')
      .eq('id', true)
      .maybeSingle()

    if (error) {
      logError(
        logger,
        error,
        { route: 'offers/getWeeklyOfferExpiresAt' },
        'Falha ao buscar prazo da oferta semanal — usando fallback de domingo',
      )
      return getNextSundayEndISO()
    }

    if (!data?.expires_at) {
      logWarn(
        logger,
        { route: 'offers/getWeeklyOfferExpiresAt' },
        'Nenhuma linha em weekly_offer_settings — usando fallback de domingo',
      )
      return getNextSundayEndISO()
    }

    return data.expires_at
  } catch (error) {
    logError(
      logger,
      error,
      { route: 'offers/getWeeklyOfferExpiresAt' },
      'Erro inesperado ao buscar prazo da oferta semanal — usando fallback de domingo',
    )
    return getNextSundayEndISO()
  }
}
