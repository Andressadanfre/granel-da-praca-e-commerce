import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { AccountDataForm } from '@/components/account/AccountDataForm'
import { AccountSidebar } from '@/components/account/AccountSidebar'
import { FidelityStubCard } from '@/components/account/FidelityStubCard'
import { OrdersSection } from '@/components/account/OrdersSection'
import { Footer } from '@/components/layout/Footer'
import { Navigation } from '@/components/layout/Navigation'
import { loadAccountPageData } from '@/lib/account/loadAccountPageData'
import { getSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Minha Conta | Granel da Praça',
  robots: { index: false },
}

export default async function ContaPage() {
  const supabase = getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/conta/login?redirect=/conta')
  }

  const { user: accountUser, orders } = await loadAccountPageData(
    user.id,
    user.email ?? '',
  )

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-cream">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-5 px-5 py-6 md:gap-8 md:py-10 lg:grid-cols-[260px_1fr] lg:gap-8 xl:px-0">
          <AccountSidebar fullName={accountUser.fullName} email={accountUser.email} />

          <div className="flex flex-col gap-8">
            <FidelityStubCard />
            <OrdersSection orders={orders} />
            <AccountDataForm user={accountUser} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
