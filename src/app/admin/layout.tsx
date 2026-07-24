import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutGrid, ClipboardList, Package, Users, Ticket, BarChart3, Settings } from 'lucide-react'
import type { ReactNode } from 'react'

import { getSupabaseServer } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/admin/orders'
import { getAdminSessionInfo, getSidebarCounts } from '@/lib/admin/shell'

const navLinkClass =
  'flex items-center gap-2 rounded-inner px-3 py-2 text-[13px] font-medium text-white hover:bg-white/10'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/conta/login?redirect=/admin/pedidos')
  }

  if (!(await isAdminUser(user.id))) {
    redirect('/?erro=acesso_negado')
  }

  const [session, counts] = await Promise.all([
    getAdminSessionInfo(user.id),
    getSidebarCounts(),
  ])

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-[220px] flex-shrink-0 flex-col bg-gdeep px-4 py-6 print:hidden">
        <div className="mb-8">
          <p className="text-base font-bold text-white">Granel da Praça</p>
          <p className="text-[11px] font-normal text-white/60">Admin Panel</p>
        </div>

        <nav className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <p className="px-3 text-[9.5px] font-semibold uppercase tracking-wide text-white/40">Principal</p>

            <Link href="/admin" className={navLinkClass}>
              <LayoutGrid size={16} strokeWidth={1.6} />
              Dashboard
            </Link>

            <Link href="/admin/pedidos" className={navLinkClass}>
              <ClipboardList size={16} strokeWidth={1.6} />
              Pedidos
              {counts.pedidosPendentes > 0 && (
                <span className="ml-auto rounded-pill bg-danger px-2 py-0.5 text-[11px] font-semibold text-white">
                  {`${counts.pedidosPendentes}`}
                </span>
              )}
            </Link>

            <Link href="/admin/produtos" className={navLinkClass}>
              <Package size={16} strokeWidth={1.6} />
              Produtos
              {counts.produtosAlerta > 0 && (
                <span className="ml-auto rounded-pill bg-promo px-2 py-0.5 text-[11px] font-semibold text-white">
                  {`${counts.produtosAlerta}`}
                </span>
              )}
            </Link>

            <Link href="/admin/clientes" className={navLinkClass}>
              <Users size={16} strokeWidth={1.6} />
              Clientes
            </Link>
          </div>

          <div className="flex flex-col gap-1">
            <p className="px-3 text-[9.5px] font-semibold uppercase tracking-wide text-white/40">Cupons</p>

            <Link href="#" className={navLinkClass}>
              <Ticket size={16} strokeWidth={1.6} />
              Cupons
            </Link>

            <Link href="#" className={navLinkClass}>
              <BarChart3 size={16} strokeWidth={1.6} />
              Relatórios
            </Link>
          </div>

          <div className="flex flex-col gap-1">
            <p className="px-3 text-[9.5px] font-semibold uppercase tracking-wide text-white/40">Sistema</p>

            <Link href="/admin/configuracoes" className={navLinkClass}>
              <Settings size={16} strokeWidth={1.6} />
              Configurações
            </Link>
          </div>
        </nav>

        <div className="mt-auto flex flex-col gap-3 pt-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-pill bg-white/10 text-[13px] font-semibold text-white">
              {session?.fullName?.charAt(0) ?? 'A'}
            </div>
            <div>
              <p className="text-[13px] font-medium text-white">{session?.fullName ?? 'Admin'}</p>
              <p className="text-[11px] font-normal text-white/60">
                {session?.role === 'owner' ? 'Owner' : 'Supervisora'}
              </p>
            </div>
          </div>

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
