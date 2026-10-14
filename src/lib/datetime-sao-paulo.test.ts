import { describe, it, expect, vi } from 'vitest'

import { formatOrderDateLong } from '@/lib/account/formatOrderDateLong'

vi.mock('server-only', () => ({}))

// Os testes rodam com TZ=UTC no script (igual à Vercel) para provar que o
// resultado não depende do fuso do servidor.
describe('formatOrderDateTime (admin)', () => {
  it('converte UTC para America/Sao_Paulo (caso real: pedido 15:56 aparecia 18:56)', async () => {
    const { formatOrderDateTime } = await import('@/lib/admin/labels')
    expect(formatOrderDateTime('2026-10-13T18:56:00.000Z')).toBe('13/10/2026 15:56')
  })

  it('volta o dia quando a conversão cruza a meia-noite', async () => {
    const { formatOrderDateTime } = await import('@/lib/admin/labels')
    expect(formatOrderDateTime('2026-10-14T02:30:00.000Z')).toBe('13/10/2026 23:30')
  })

  it('meia-noite de São Paulo aparece como 00:00, não 24:00', async () => {
    const { formatOrderDateTime } = await import('@/lib/admin/labels')
    expect(formatOrderDateTime('2026-10-14T03:00:00.000Z')).toBe('14/10/2026 00:00')
  })
})

describe('formatOrderDateLong (Minha Conta)', () => {
  it('converte UTC para America/Sao_Paulo', () => {
    expect(formatOrderDateLong('2026-07-21T17:32:00.000Z')).toBe('21 de julho de 2026 · 14:32')
  })

  it('volta o dia quando a conversão cruza a meia-noite', () => {
    expect(formatOrderDateLong('2026-10-01T01:10:00.000Z')).toBe('30 de setembro de 2026 · 22:10')
  })
})
