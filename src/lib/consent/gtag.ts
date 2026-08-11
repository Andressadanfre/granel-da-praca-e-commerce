'use client'

import { CONSENT_STORAGE_KEY, type ConsentState } from './types'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

export function getStoredConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ConsentState
  } catch {
    return null
  }
}

export function updateConsent(analytics: boolean, ads: boolean) {
  const state: ConsentState = {
    analytics: analytics ? 'granted' : 'denied',
    ads: ads ? 'granted' : 'denied',
    timestamp: new Date().toISOString(),
  }

  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state))

  window.gtag?.('consent', 'update', {
    analytics_storage: state.analytics,
    ad_storage: state.ads,
    ad_user_data: state.ads,
    ad_personalization: state.ads,
  })
}
