import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import type { ReactNode } from 'react'

import { getSupabaseServer } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/admin/orders'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/conta/login?redirect=/admin/pedidos')
  }

  if (!(await isAdminUser(user.id))) {
    redirect('/?erro=acesso_negado')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-[220px] flex-shrink-0 flex-col bg-gdeep px-4 py-6 print:hidden">
        <div className="mb-8">
          <p className="text-base font-bold text-white">Granel</p>
          <p className="text-[11px] font-normal text-white/60">Admin</p>
        </div>

        <nav className="flex flex-col gap-1">
          <Link
            href="/admin/pedidos"
            className="flex items-center gap-2 rounded-inner px-3 py-2 text-[13px] font-medium text-white hover:bg-white/10"
          >
            <ClipboardList size={16} strokeWidth={1.6} />
            Pedidos
          </Link>
        </nav>

        <div className="mt-auto">
          <Link href="/" className="text-[11px] text-white/50 hover:text-white/70">
            ← Voltar à loja
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-cream p-8 print:bg-white print:p-0">
        {children}
      </main>
    </div>
  )
}
