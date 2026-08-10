'use server'

import { revalidatePath } from 'next/cache'

import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/admin/orders'
import { logger, logError } from '@/lib/logger'
import type { OrderStatus, DeliveryType } from '@/types/admin'

function validateStatusTransition(
  current: OrderStatus,
  next: OrderStatus,
  deliveryType: DeliveryType,
): boolean {
  switch (current) {
    case 'recebido':
      return next === 'aceito' || next === 'cancelado'
    case 'aceito':
      return next === 'em_separacao' || next === 'cancelado'
    case 'em_separacao':
      if (next === 'cancelado') return true
      return deliveryType === 'entrega'
        ? next === 'saiu_para_entrega'
        : next === 'pronto_para_retirada'
    case 'saiu_para_entrega':
      return next === 'entregue'
    case 'pronto_para_retirada':
      return next === 'retirado'
    case 'entregue':
    case 'retirado':
    case 'cancelado':
      return false
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  deliveryType: DeliveryType,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  const supabaseServer = getSupabaseServer()
  const { data: { user } } = await supabaseServer.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  if (!(await isAdminUser(user.id))) {
    return { success: false, error: 'Acesso negado' }
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single()

    if (fetchError || !currentOrder) {
      return { success: false, error: 'Pedido não encontrado' }
    }

    if (!validateStatusTransition(currentOrder.status, newStatus, deliveryType)) {
      return { success: false, error: 'Transição de status inválida' }
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('is_deleted', false)

    if (updateError) {
      logError(logger, updateError, { route: 'admin/updateOrderStatus', user_id: user.id, order_id: orderId }, 'Erro ao atualizar status do pedido')
      return { success: false, error: 'Erro interno' }
    }

    const { error: auditError } = await supabaseAdmin.from('admin_audit_log').insert({
      action: 'update_status',
      entity: 'orders',
      entity_id: orderId,
      user_id: user.id,
      old_value: { status: currentOrder.status },
      new_value: { status: newStatus },
      reason: reason ?? null,
    })

    if (auditError) {
      logError(logger, auditError, { route: 'admin/updateOrderStatus', user_id: user.id, order_id: orderId }, 'Erro ao registrar audit log')
      return { success: false, error: 'Erro interno' }
    }

    revalidatePath('/admin/pedidos')
    return { success: true }
  } catch (error) {
    logError(logger, error, { route: 'admin/updateOrderStatus', user_id: user.id, order_id: orderId }, 'Erro inesperado ao atualizar status do pedido')
    return { success: false, error: 'Erro interno' }
  }
}

export async function markItemSeparated(
  itemId: string,
  separated: boolean,
): Promise<{ success: boolean; error?: string }> {
  const supabaseServer = getSupabaseServer()
  const { data: { user } } = await supabaseServer.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  if (!(await isAdminUser(user.id))) {
    return { success: false, error: 'Acesso negado' }
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('order_items')
      .update({
        is_separated: separated,
        separated_at: separated ? new Date().toISOString() : null,
      })
      .eq('id', itemId)
      .select('order_id')
      .single()

    if (error) {
      logError(logger, error, { route: 'admin/markItemSeparated', user_id: user.id, item_id: itemId }, 'Erro ao marcar item como separado')
      return { success: false, error: 'Erro interno' }
    }

    if (data?.order_id) {
      revalidatePath(`/admin/pedidos/${data.order_id}`)
    }
    return { success: true }
  } catch (error) {
    logError(logger, error, { route: 'admin/markItemSeparated', user_id: user.id, item_id: itemId }, 'Erro inesperado ao marcar item como separado')
    return { success: false, error: 'Erro interno' }
  }
}
