import type { Metadata } from 'next'
import { getSupabaseServer } from '@/lib/supabase/server'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Finalizar pedido | Granel da Praça',
  robots: { index: false },
}

export default async function CheckoutPage() {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  return <CheckoutForm prefillEmail={user?.email ?? null} />
}
