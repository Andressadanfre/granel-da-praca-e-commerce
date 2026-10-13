'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const INTERVALO_MS = 5_000
const LIMITE_MS = 10 * 60_000

// Recarrega os dados do Server Component enquanto o pagamento está pendente.
// O webhook do MP marca o pedido como pago; ao re-renderizar sem pendência,
// este componente deixa de ser montado e o polling termina sozinho.
export function PaymentStatusWatcher() {
  const router = useRouter()

  useEffect(() => {
    const inicio = Date.now()
    const id = setInterval(() => {
      if (Date.now() - inicio > LIMITE_MS) return clearInterval(id)
      if (document.visibilityState === 'visible') router.refresh()
    }, INTERVALO_MS)
    return () => clearInterval(id)
  }, [router])

  return null
}
