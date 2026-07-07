'use client'

import React, { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Loader2, Leaf, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { subscribeNewsletter } from '@/app/actions/newsletter'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'granel_popup_shown'
const TRIGGER_DELAY = 3000
const EXCLUDED_PREFIXES = ['/conta', '/checkout', '/pedido', '/admin']

type Status = 'idle' | 'loading' | 'success' | 'error'

export function NewsletterPopup() {
  const pathname = usePathname()
  const isExcludedRoute = EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isExcludedRoute) return
    if (typeof window === 'undefined') return
    if (localStorage.getItem(STORAGE_KEY)) return

    timerRef.current = setTimeout(() => setIsOpen(true), TRIGGER_DELAY)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isExcludedRoute])

  function handleClose() {
    setIsOpen(false)
    localStorage.setItem(STORAGE_KEY, '1')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'loading') return

    setStatus('loading')
    setErrorMsg('')

    const result = await subscribeNewsletter(email)

    if (result.success) {
      setStatus('success')
      setTimeout(() => {
        handleClose()
      }, 2000)
    } else {
      setStatus('error')
      setErrorMsg(result.error)
    }
  }

  if (isExcludedRoute) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size='xl'>
      <div className='flex min-h-[320px]'>

        {/* Coluna esquerda — decorativa */}
        <div className='hidden md:flex w-[340px] shrink-0 flex-col items-center justify-center gap-4 rounded-l-modal bg-cream-img px-8'>
          <div className='flex h-20 w-20 items-center justify-center rounded-full bg-white/60'>
            <Leaf className='h-10 w-10 text-gd' strokeWidth={1.6} />
          </div>
          <p className='text-center text-sm font-medium leading-relaxed text-t6'>
            Produtos naturais direto<br />da fonte para sua mesa
          </p>
        </div>

        {/* Coluna direita — conteúdo */}
        <div className='flex flex-1 flex-col justify-center px-8 py-10'>

          {/* Fechamento mobile */}
          <button
            type='button'
            onClick={handleClose}
            className='absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-t4 transition hover:bg-gray-100 hover:text-t9 md:hidden'
            aria-label='Fechar'
          >
            <X className='h-4 w-4' strokeWidth={1.6} />
          </button>

          {status === 'success' ? (
            <div className='flex flex-col items-center gap-3 text-center'>
              <div className='flex h-14 w-14 items-center justify-center rounded-full bg-g/10'>
                <Leaf className='h-7 w-7 text-g' strokeWidth={1.6} />
              </div>
              <p className='text-lg font-semibold text-t9'>Bem-vinda à família Granel!</p>
              <p className='text-sm text-t6'>Seu desconto de 10% chegará no e-mail em instantes.</p>
            </div>
          ) : (
            <>
              <h2 className='mb-1 text-2xl font-bold text-t9'>
                10% off na primeira compra
              </h2>
              <p className='mb-6 text-sm leading-relaxed text-t6'>
                Cadastre seu e-mail e receba ofertas exclusivas de produtos naturais a granel.
              </p>

              <form onSubmit={handleSubmit} noValidate className='flex flex-col gap-3'>
                <div className='flex flex-col gap-1'>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (status === 'error') setStatus('idle')
                    }}
                    placeholder='seu@email.com'
                    required
                    disabled={status === 'loading'}
                    className={cn(
                      'h-12 rounded-input border bg-white px-4 text-sm text-t9 outline-none',
                      'placeholder:text-t4',
                      'transition focus:border-g focus:ring-2 focus:ring-g/20',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                      status === 'error' ? 'border-danger' : 'border-bd',
                    )}
                  />
                  {status === 'error' && errorMsg && (
                    <p className='text-xs text-danger'>{errorMsg}</p>
                  )}
                </div>

                <button
                  type='submit'
                  disabled={status === 'loading' || !email}
                  className={cn(
                    'flex h-10 items-center justify-center gap-2 rounded-sel',
                    'bg-g text-sm font-semibold text-white',
                    'transition hover:bg-ghover',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                >
                  {status === 'loading' ? (
                    <Loader2 className='h-4 w-4 animate-spin' strokeWidth={1.6} />
                  ) : (
                    'Quero meu desconto'
                  )}
                </button>
              </form>

              <p className='mt-4 text-center text-xs text-t4'>
                Sem spam. Cancele quando quiser.
              </p>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
