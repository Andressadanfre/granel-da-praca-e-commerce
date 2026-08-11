'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { getStoredConsent, updateConsent } from '@/lib/consent/gtag'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!getStoredConsent()) {
      setVisible(true)
    }
  }, [])

  function handleChoice(accepted: boolean) {
    updateConsent(accepted, accepted)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Consentimento de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-bd shadow-drawer rounded-t-modal px-5 py-5 md:px-8 md:py-6"
    >
      <div className="max-w-container mx-auto flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        <p className="text-[13px] text-t6 leading-[1.6] flex-1">
          Usamos cookies para melhorar sua experiência e personalizar conteúdo. Ao continuar, você concorda com nossa{' '}
          <a href="/privacidade" className="text-g underline">
            Política de Privacidade
          </a>
          .
        </p>

        <div className="flex gap-3 shrink-0">
          <Button variant="secondary" size="md" onClick={() => handleChoice(false)}>
            Rejeitar
          </Button>
          <Button variant="primary" size="md" onClick={() => handleChoice(true)}>
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  )
}
