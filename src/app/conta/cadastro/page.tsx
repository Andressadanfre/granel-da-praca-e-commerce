import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { SignupForm } from '@/components/auth/SignupForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Criar conta | Granel da Praça',
  robots: { index: false },
}

export default async function CadastroPage() {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/checkout')
  }

  return <SignupForm />
}
