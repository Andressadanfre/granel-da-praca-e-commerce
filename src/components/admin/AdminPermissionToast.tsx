'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useToast } from '@/components/ui/ToastProvider'

export function AdminPermissionToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { showToast } = useToast()

  useEffect(() => {
    if (searchParams.get('erro') === 'sem_permissao') {
      showToast('Você não tem permissão para acessar essa área.', 'error')
      router.replace(pathname)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return null
}
