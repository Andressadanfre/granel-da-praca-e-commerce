'use server'

import { getSupabaseServer } from '@/lib/supabase/server'
import { logWarn, logger } from '@/lib/logger'
import { createOrderSchema } from './schemas'
import type { ServerCartItem } from './calculations'

// ─── Tipos de retorno ─────────────────────────────────────────────────────────

export interface CreateOrderResult {
  success: true
  orderId: string
  orderCode: string
  preferenceId: string
  initPoint: string
  sandboxInitPoint: string
}

export interface CreateOrderError {
  success: false
  error: string
}

// ─── Server Action principal — criar pedido + preferência MP ──────────────────
export async function createOrderAction(
  input: unknown,
): Promise<CreateOrderResult | CreateOrderError> {

  // 1. Validar input com Zod
  const parsed = createOrderSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Dados do pedido inválidos' }
  }

  // 2. Autenticar — identidade sempre do servidor, nunca do cliente
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  // 3. Buscar itens do carrinho no banco — nunca confiar no carrinho do cliente
  // Implementação provisória — carrinho server-side pendente (A3 em progresso)
  return { success: false, error: 'Implementação do carrinho server-side pendente (A3 em progresso)' }
}

// ─── Helper — busca produto do banco para recalcular preço ───────────────────
// Garante que o preço usado é o do banco, nunca o enviado pelo cliente
export async function getProductsForOrder(
  productIds: number[],
): Promise<{ items: ServerCartItem[], names: Record<number, string> } | null> {
  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from('products')
    .select('id, name, price_cents, product_type')
    .in('id', productIds)
    .eq('is_active', true)
    .eq('is_deleted', false)

  if (error || !data || data.length !== productIds.length) {
    logWarn(
      logger,
      { route: '/api/orders' },
      'Produtos não encontrados ou inativos ao montar pedido',
    )
    return null
  }

  const names: Record<number, string> = {}
  data.forEach(p => { names[p.id] = p.name ?? '' })

  return { items: [], names }
}
