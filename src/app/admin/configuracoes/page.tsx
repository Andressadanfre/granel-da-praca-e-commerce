import { redirect } from 'next/navigation'

import { MfaSettingsForm } from '@/components/admin/MfaSettingsForm'
import { getAdminSessionInfo } from '@/lib/admin/shell'
import { getSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminConfiguracoesPage() {
  const supabase = getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/conta/login?redirect=/admin/configuracoes')
  }

  const session = await getAdminSessionInfo(user.id)
  if (session?.role !== 'owner') {
    redirect('/admin/produtos?erro=sem_permissao')
  }

  const { data: factors } = await supabase.auth.mfa.listFactors()
  const totp = factors?.totp[0] ?? null

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gdeep">Configurações</h1>
        <p className="mt-0.5 text-xs text-t4">Segurança da conta administrativa</p>
      </div>

      <div className="max-w-[560px]">
        <MfaSettingsForm
          verifiedFactor={
            totp ? { id: totp.id, createdAt: totp.created_at } : null
          }
        />
      </div>
    </div>
  )
}
