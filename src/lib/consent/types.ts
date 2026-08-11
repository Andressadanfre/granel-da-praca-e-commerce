export type ConsentStatus = 'granted' | 'denied'

export interface ConsentState {
  analytics: ConsentStatus
  ads: ConsentStatus
  timestamp: string
}

export const CONSENT_STORAGE_KEY = 'granel_cookie_consent'
