'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Home, LogOut, Star, User } from 'lucide-react'

import { signOutAction } from '@/lib/auth/actions'
import { cn } from '@/lib/utils'

const DANGER_HOVER_BG = 'hover:bg-[#FEF2F2]' // soft red — sem token no DS

type AccountSection = 'pedidos' | 'dados'

interface AccountSidebarProps {
  fullName: string | null
  email: string
}

function getInitial(fullName: string | null, email: string): string {
  const source = fullName?.trim() || email.trim()
  return source.charAt(0).toUpperCase() || '?'
}

export function AccountSidebar({ fullName, email }: AccountSidebarProps) {
  const router = useRouter()
  const [active, setActive] = useState<AccountSection>('pedidos')
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    function syncFromHash() {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'dados') setActive('dados')
      else setActive('pedidos')
    }
    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  async function handleSignOut() {
    setSigningOut(true)
    await signOutAction()
    router.push('/')
    router.refresh()
  }

  const displayName = fullName?.trim() || 'Cliente'

  return (
    <aside
      className={cn(
        'h-fit rounded-card bg-white py-4 shadow-card',
        'lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)] lg:overflow-y-auto',
      )}
    >
      <div className="mb-1.5 flex items-center gap-3 border-b border-bd px-5 pb-3.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-badge-diet-bg text-sm font-bold text-badge-diet-tx"
          aria-hidden
        >
          {getInitial(fullName, email)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-semibold text-t9">{displayName}</p>
          <p className="truncate text-[11.5px] text-t6">{email}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-3 py-1.5" aria-label="Minha conta">
        <a
          href="#pedidos"
          onClick={() => setActive('pedidos')}
          className={cn(
            'flex items-center gap-3 rounded-sel px-3 py-2.5 text-[13.5px] font-medium transition-colors',
            active === 'pedidos'
              ? 'bg-badge-diet-bg font-semibold text-gd'
              : 'text-t6 hover:bg-gray-100 hover:text-t9',
          )}
        >
          <Home size={18} strokeWidth={1.6} className="shrink-0" aria-hidden />
          Meus Pedidos
        </a>

        <a
          href="#dados"
          onClick={() => setActive('dados')}
          className={cn(
            'flex items-center gap-3 rounded-sel px-3 py-2.5 text-[13.5px] font-medium transition-colors',
            active === 'dados'
              ? 'bg-badge-diet-bg font-semibold text-gd'
              : 'text-t6 hover:bg-gray-100 hover:text-t9',
          )}
        >
          <User size={18} strokeWidth={1.6} className="shrink-0" aria-hidden />
          Meus Dados
        </a>

        <span
          className="flex cursor-default items-center gap-3 rounded-sel px-3 py-2.5 text-[13.5px] font-medium text-t4"
          aria-disabled="true"
        >
          <Star size={18} strokeWidth={1.6} className="shrink-0" aria-hidden />
          Fidelidade
          <span className="ml-auto rounded-pill bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em] text-t4">
            Em breve
          </span>
        </span>

        <div className="mx-3 my-2 h-px bg-bd" role="separator" />

        <button
          type="button"
          disabled={signingOut}
          onClick={handleSignOut}
          className={cn(
            'flex items-center gap-3 rounded-sel px-3 py-2.5 text-left text-[13.5px] font-medium text-danger',
            DANGER_HOVER_BG,
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <LogOut size={18} strokeWidth={1.6} className="shrink-0" aria-hidden />
          {signingOut ? 'Saindo…' : 'Sair'}
        </button>
      </nav>
    </aside>
  )
}
