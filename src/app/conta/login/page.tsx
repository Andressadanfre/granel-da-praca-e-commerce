import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/LoginForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Entrar | Granel da Praça',
  robots: { index: false },
}

interface LoginPageProps {
  searchParams: { erro?: string }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/checkout')
  }

  const initialError = searchParams.erro === 'perfil'
    ? 'Não foi possível completar seu login. Tente novamente.'
    : null

  return <LoginForm initialError={initialError} />
}
