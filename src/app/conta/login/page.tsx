import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/LoginForm'
import { safeRedirect } from '@/lib/auth/safeRedirect'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Entrar | Granel da Praça',
  robots: { index: false },
}

interface LoginPageProps {
  searchParams: { erro?: string; redirect?: string }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect(safeRedirect(searchParams.redirect))
  }

  const initialError = searchParams.erro === 'perfil'
    ? 'Não foi possível completar seu login. Tente novamente.'
    : null

  return (
    <Suspense fallback={null}>
      <LoginForm initialError={initialError} />
    </Suspense>
  )
}
