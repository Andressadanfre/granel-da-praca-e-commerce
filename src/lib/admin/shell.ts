import 'server-only'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import type { AdminRole } from '@/types/admin'

export interface AdminSessionInfo {
  fullName: string
  role: AdminRole
}

export async function getAdminSessionInfo(authUserId: string): Promise<AdminSessionInfo | null> {
  const supabase = getSupabaseAdmin()

  const { data: adminRow, error: adminError } = await supabase
    .from('admin_users')
    .select('user_id, role')
    .eq('user_id', authUserId)
    .eq('is_active', true)
    .limit(1)
    .single()

  if (adminError || !adminRow) return null

  const { data: profileRow } = await supabase
    .from('app_users')
    .select('full_name')
    .eq('id', authUserId)
    .single()

  return {
    fullName: profileRow?.full_name ?? 'Admin',
    role: adminRow.role,
  }
}

export interface AdminSidebarCounts {
  pedidosPendentes: number
  produtosAlerta: number
}

export async function getSidebarCounts(): Promise<AdminSidebarCounts> {
  const supabase = getSupabaseAdmin()

  const [pedidos, produtos] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true })
      .eq('status', 'recebido').eq('is_deleted', false),
    supabase.from('products').select('id', { count: 'exact', head: true })
      .in('stock_status', ['low_stock', 'out_of_stock'])
      .eq('is_active', true).eq('is_deleted', false),
  ])

  return {
    pedidosPendentes: pedidos.count ?? 0,
    produtosAlerta: produtos.count ?? 0,
  }
}
