'use server'

import { revalidatePath } from 'next/cache'

import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/admin/orders'
import { updateProductSchema } from '@/lib/admin/schemas'
import { logger, logError } from '@/lib/logger'
import type { Json } from '@/types/database'

export type UpdateProductResult = { success: true } | { success: false; error: string }

export async function updateProduct(id: number, input: unknown): Promise<UpdateProductResult> {
  const parsed = updateProductSchema.safeParse(input)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return { success: false, error: firstIssue?.message ?? 'Dados inválidos' }
  }

  const supabaseServer = getSupabaseServer()
  const {
    data: { user },
  } = await supabaseServer.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  if (!(await isAdminUser(user.id))) {
    return { success: false, error: 'Acesso negado' }
  }

  const data = parsed.data

  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data: current, error: fetchError } = await supabaseAdmin
      .from('products')
      .select(
        'id, product_type, slug, category_id, name, description, price_cents, compare_at_cents, is_active, is_featured, stock_quantity_grams, stock_quantity_units, low_stock_threshold_grams, low_stock_threshold_units, is_deleted, categories(slug)',
      )
      .eq('id', id)
      .maybeSingle()

    if (fetchError) {
      logError(
        logger,
        fetchError,
        { action: 'updateProduct', productId: id, user_id: user.id },
        'Falha ao buscar produto antes da atualização',
      )
      return { success: false, error: 'Erro interno' }
    }

    if (!current || current.is_deleted) {
      return { success: false, error: 'Produto não encontrado' }
    }

    const isGranel = current.product_type === 'granel'

    const updatePayload = {
      name: data.name,
      category_id: data.categoryId,
      description: data.description?.trim() ? data.description.trim() : null,
      price_cents: data.priceCents,
      compare_at_cents: data.compareAtCents ?? null,
      is_active: data.isActive,
      is_featured: data.isFeatured,
      low_stock_threshold_grams: data.lowStockThresholdGrams,
      low_stock_threshold_units: data.lowStockThresholdUnits,
      // Só atualiza o campo de quantidade relevante ao product_type real do banco.
      ...(isGranel
        ? { stock_quantity_grams: data.stockQuantityGrams ?? null }
        : { stock_quantity_units: data.stockQuantityUnits ?? null }),
      updated_at: new Date().toISOString(),
    }

    const { error: updateError } = await supabaseAdmin.from('products').update(updatePayload).eq('id', id).eq('is_deleted', false)

    if (updateError) {
      logError(
        logger,
        updateError,
        { action: 'updateProduct', productId: id, user_id: user.id },
        'Falha ao atualizar produto',
      )
      return { success: false, error: 'Erro interno' }
    }

    const { error: auditError } = await supabaseAdmin.from('admin_audit_log').insert({
      action: 'update_product',
      entity: 'products',
      entity_id: String(id),
      user_id: user.id,
      old_value: {
        name: current.name,
        category_id: current.category_id,
        description: current.description,
        price_cents: current.price_cents,
        compare_at_cents: current.compare_at_cents,
        is_active: current.is_active,
        is_featured: current.is_featured,
        stock_quantity_grams: current.stock_quantity_grams,
        stock_quantity_units: current.stock_quantity_units,
        low_stock_threshold_grams: current.low_stock_threshold_grams,
        low_stock_threshold_units: current.low_stock_threshold_units,
      } as Json,
      new_value: updatePayload as Json,
      reason: null,
    })

    if (auditError) {
      logError(
        logger,
        auditError,
        { action: 'updateProduct', productId: id, user_id: user.id },
        'Erro ao registrar audit log de produto',
      )
      // Atualização já persistiu — não reverter; só logar falha de auditoria.
    }

    revalidatePath('/admin/produtos')
    revalidatePath(`/admin/produtos/${id}/editar`)

    const categorySlug = (current.categories as { slug: string } | null)?.slug
    if (categorySlug && current.slug) {
      revalidatePath(`/loja/${categorySlug}/${current.slug}`)
      revalidatePath('/loja')
    }

    return { success: true }
  } catch (error) {
    logError(logger, error, { action: 'updateProduct', productId: id, user_id: user.id }, 'Erro inesperado ao atualizar produto')
    return { success: false, error: 'Erro interno' }
  }
}
