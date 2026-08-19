import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { LayoutGrid, ClipboardList, Package, Users, Ticket, BarChart3, Settings } from 'lucide-react'
import type { ReactNode } from 'react'

import { getSupabaseServer } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/admin/orders'
import { getAdminSessionInfo, getSidebarCounts } from '@/lib/admin/shell'
import { AdminPermissionToast } from '@/components/admin/AdminPermissionToast'
import { cn } from '@/lib/utils'

const navLinkClass =
  'flex items-center gap-2 rounded-inner px-3 py-2 text-[13px] font-medium text-white hover:bg-white/10'

type AdminNavItem = {
  label: string
  href: string
  icon: typeof LayoutGrid
  badge?: number
  ownerOnly?: boolean
  comingSoon?: boolean
}

type AdminNavSection = {
  label: string
  items: AdminNavItem[]
  ownerOnly?: boolean
}

function buildNavSections(counts: Awaited<ReturnType<typeof getSidebarCounts>>): AdminNavSection[] {
  return [
    {
      label: 'PRINCIPAL',
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutGrid, ownerOnly: true },
        { label: 'Pedidos', href: '/admin/pedidos', icon: ClipboardList, badge: counts.pedidosPendentes },
        { label: 'Produtos', href: '/admin/produtos', icon: Package, badge: counts.produtosAlerta },
        { label: 'Clientes', href: '/admin/clientes', icon: Users, ownerOnly: true, comingSoon: true },
      ],
    },
    {
      label: 'CUPONS',
      ownerOnly: true,
      items: [
        { label: 'Cupons', href: '#', icon: Ticket, comingSoon: true },
        { label: 'Relatórios', href: '#', icon: BarChart3, comingSoon: true },
      ],
    },
    {
      label: 'SISTEMA',
      ownerOnly: true,
      items: [
        { label: 'Configurações', href: '/admin/configuracoes', icon: Settings, comingSoon: true },
      ],
    },
  ]
}

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

  const isOwner = session?.role === 'owner'
  const navSections = buildNavSections(counts)
  const visibleSections = navSections
    .filter((section) => !section.ownerOnly || isOwner)
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.ownerOnly || isOwner),
    }))

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-[220px] flex-shrink-0 flex-col bg-gdeep px-4 py-6 print:hidden">
        <div className="mb-8">
          <p className="text-base font-bold text-white">Granel da Praça</p>
          <p className="text-[11px] font-normal text-white/60">Admin Panel</p>
        </div>

        <nav className="flex flex-col gap-5">
          {visibleSections.map((section) => (
            <div key={section.label} className="flex flex-col gap-1">
              <p className="px-3 text-[9.5px] font-semibold uppercase tracking-wide text-white/40">
                {section.label}
              </p>

              {section.items.map((item) => {
                const Icon = item.icon

                if (item.comingSoon) {
                  return (
                    <div
                      key={item.href + item.label}
                      className={cn(navLinkClass, 'cursor-not-allowed text-white/40 hover:bg-transparent')}
                      title="Em breve"
                      aria-disabled="true"
                    >
                      <Icon size={16} strokeWidth={1.6} />
                      {item.label}
                      <span className="ml-auto rounded-pill bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/50">
                        em breve
                      </span>
                    </div>
                  )
                }

                return (
                  <Link key={item.href + item.label} href={item.href} className={navLinkClass}>
                    <Icon size={16} strokeWidth={1.6} />
                    {item.label}
                    {item.badge != null && item.badge > 0 && (
                      <span
                        className={cn(
                          'ml-auto rounded-pill px-2 py-0.5 text-[11px] font-semibold text-white',
                          item.href === '/admin/pedidos' ? 'bg-danger' : 'bg-promo',
                        )}
                      >
                        {`${item.badge}`}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
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
        <Suspense fallback={null}>
          <AdminPermissionToast />
        </Suspense>
        {children}
      </main>
    </div>
  )
}
