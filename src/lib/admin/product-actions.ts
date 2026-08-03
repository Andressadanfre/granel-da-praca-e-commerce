'use server'

import { revalidatePath } from 'next/cache'
import sharp from 'sharp'

import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/admin/orders'
import { createProductSchema, updateProductSchema } from '@/lib/admin/schemas'
import { logger, logError } from '@/lib/logger'
import { generateSlug } from '@/lib/utils'
import type { Json } from '@/types/database'

export type UpdateProductResult = { success: true } | { success: false; error: string }

export type CreateProductResult =
  | { success: true; productId: number }
  | { success: false; error: string }

const PRODUCT_IMAGES_BUCKET = 'product-images'
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'webp'])
const PRODUCT_IMAGE_MAX_PX = 800
const PRODUCT_IMAGE_WEBP_QUALITY = 80

type AdminClient = ReturnType<typeof getSupabaseAdmin>

function normalizeImageMime(mime: string): string {
  return mime === 'image/jpg' ? 'image/jpeg' : mime
}

function getImageExtension(file: File): string | null {
  const fromName = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (ALLOWED_IMAGE_EXT.has(fromName)) {
    return fromName === 'jpeg' ? 'jpg' : fromName
  }
  const mime = normalizeImageMime(file.type)
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return null
}

function validateProductImageFile(file: File): string | null {
  if (file.size <= 0) return 'Arquivo de imagem inválido'
  if (file.size > MAX_IMAGE_BYTES) return 'Imagem deve ter no máximo 5MB'
  const mime = normalizeImageMime(file.type)
  if (!ALLOWED_IMAGE_MIME.has(mime)) {
    return 'Formato de imagem inválido. Use JPG, PNG ou WebP'
  }
  if (!getImageExtension(file)) {
    return 'Formato de imagem inválido. Use JPG, PNG ou WebP'
  }
  return null
}

function formDataString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '')
}

function formDataOptionalString(formData: FormData, key: string): string | null {
  const raw = formDataString(formData, key).trim()
  return raw.length > 0 ? raw : null
}

function formDataInt(formData: FormData, key: string): number {
  const raw = formDataString(formData, key).trim()
  if (raw === '') return Number.NaN
  return Number(raw)
}

function formDataOptionalInt(formData: FormData, key: string): number | null {
  const raw = formDataString(formData, key).trim()
  if (raw === '') return null
  return Number(raw)
}

function formDataBoolean(formData: FormData, key: string): boolean {
  const raw = formDataString(formData, key).toLowerCase()
  return raw === 'true' || raw === '1' || raw === 'on'
}

function formDataOptionalFile(formData: FormData, key: string): File | undefined {
  const raw = formData.get(key)
  return raw instanceof File && raw.size > 0 ? raw : undefined
}

async function uploadProductImage(
  supabaseAdmin: AdminClient,
  file: File,
  objectPath: string,
  options?: { upsert?: boolean },
): Promise<{ success: true; publicUrl: string } | { success: false }> {
  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer())
    const processedBuffer = await sharp(inputBuffer)
      .resize(PRODUCT_IMAGE_MAX_PX, PRODUCT_IMAGE_MAX_PX, { fit: 'inside' })
      .webp({ quality: PRODUCT_IMAGE_WEBP_QUALITY })
      .toBuffer()

    const { error: uploadError } = await supabaseAdmin.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(objectPath, processedBuffer, {
        contentType: 'image/webp',
        upsert: options?.upsert ?? false,
      })

    if (uploadError) {
      logError(logger, uploadError, { action: 'uploadProductImage', path: objectPath }, 'Falha no upload de imagem de produto')
      return { success: false }
    }

    const { data } = supabaseAdmin.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(objectPath)
    return { success: true, publicUrl: data.publicUrl }
  } catch (error) {
    logError(logger, error, { action: 'uploadProductImage', path: objectPath }, 'Falha ao processar imagem de produto com Sharp')
    return { success: false }
  }
}

/**
 * Limpeza best-effort após falha na criação.
 * Caveat: se storage.remove() falhar, as imagens ficam órfãs no bucket
 * (sem produto apontando para elas). O erro é logado; limpeza manual/cron futura se necessário.
 */
async function removeUploadedPaths(supabaseAdmin: AdminClient, paths: string[]): Promise<void> {
  if (paths.length === 0) return
  const { error } = await supabaseAdmin.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths)
  if (error) {
    logError(logger, error, { action: 'removeUploadedPaths', paths }, 'Falha ao limpar imagens após erro na criação')
  }
}

export async function updateProduct(id: number, formData: FormData): Promise<UpdateProductResult> {
  const imageFile = formDataOptionalFile(formData, 'image')
  const nutritionalImageFile = formDataOptionalFile(formData, 'nutritionalImage')

  const rawInput = {
    name: formDataString(formData, 'name'),
    categoryId: formDataInt(formData, 'categoryId'),
    description: formDataOptionalString(formData, 'description'),
    priceCents: formDataInt(formData, 'priceCents'),
    compareAtCents: formDataOptionalInt(formData, 'compareAtCents'),
    stockQuantityGrams: formDataOptionalInt(formData, 'stockQuantityGrams'),
    stockQuantityUnits: formDataOptionalInt(formData, 'stockQuantityUnits'),
    // '' no FormData → formDataOptionalInt retorna null; .optional() do Zod
    // aceita só undefined — converter null → undefined (campo ausente).
    lowStockThresholdGrams: formDataOptionalInt(formData, 'lowStockThresholdGrams') ?? undefined,
    lowStockThresholdUnits: formDataOptionalInt(formData, 'lowStockThresholdUnits') ?? undefined,
    isActive: formDataBoolean(formData, 'isActive'),
    isFeatured: formDataBoolean(formData, 'isFeatured'),
  }

  const parsed = updateProductSchema.safeParse(rawInput)
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

  if (imageFile) {
    const imageError = validateProductImageFile(imageFile)
    if (imageError) return { success: false, error: imageError }
  }

  if (nutritionalImageFile) {
    const nutritionalError = validateProductImageFile(nutritionalImageFile)
    if (nutritionalError) return { success: false, error: nutritionalError }
  }

  const data = parsed.data

  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data: current, error: fetchError } = await supabaseAdmin
      .from('products')
      .select(
        'id, product_type, slug, category_id, name, description, price_cents, compare_at_cents, is_active, is_featured, stock_quantity_grams, stock_quantity_units, low_stock_threshold_grams, low_stock_threshold_units, image_url, nutritional_table_image_url, is_deleted, categories(slug)',
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
    let imageUrl: string | undefined
    let nutritionalTableImageUrl: string | undefined

    // upsert:true sobrescreve o objeto no path canônico ({slug}-produto.webp).
    // Pendência futura: se a URL antiga apontar para path diferente do canônico,
    // remover o objeto antigo do Storage para não acumular lixo órfão.
    if (imageFile) {
      const objectPath = `${current.slug}-produto.webp`
      const uploaded = await uploadProductImage(supabaseAdmin, imageFile, objectPath, { upsert: true })
      if (!uploaded.success) {
        return { success: false, error: 'Erro ao enviar imagem do produto' }
      }
      imageUrl = uploaded.publicUrl
    }

    if (nutritionalImageFile) {
      const objectPath = `${current.slug}-nutricional.webp`
      const uploaded = await uploadProductImage(supabaseAdmin, nutritionalImageFile, objectPath, {
        upsert: true,
      })
      if (!uploaded.success) {
        return { success: false, error: 'Erro ao enviar imagem da tabela nutricional' }
      }
      nutritionalTableImageUrl = uploaded.publicUrl
    }

    const updatePayload = {
      name: data.name,
      category_id: data.categoryId,
      description: data.description?.trim() ? data.description.trim() : null,
      price_cents: data.priceCents,
      compare_at_cents: data.compareAtCents ?? null,
      is_active: data.isActive,
      is_featured: data.isFeatured,
      // Thresholds NOT NULL no banco (DEFAULT 500/5). Omitir o irrelevante
      // preserva o valor já salvo — não resetar pro DEFAULT a cada edição.
      ...(data.lowStockThresholdGrams != null
        ? { low_stock_threshold_grams: data.lowStockThresholdGrams }
        : {}),
      ...(data.lowStockThresholdUnits != null
        ? { low_stock_threshold_units: data.lowStockThresholdUnits }
        : {}),
      // Só atualiza o campo de quantidade relevante ao product_type real do banco.
      ...(isGranel
        ? { stock_quantity_grams: data.stockQuantityGrams ?? null }
        : { stock_quantity_units: data.stockQuantityUnits ?? null }),
      // Só inclui campos de imagem quando um arquivo novo foi enviado —
      // omitir preserva a URL existente no banco (não sobrescreve com null).
      ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
      ...(nutritionalTableImageUrl !== undefined
        ? { nutritional_table_image_url: nutritionalTableImageUrl }
        : {}),
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
        image_url: current.image_url,
        nutritional_table_image_url: current.nutritional_table_image_url,
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

export async function createProduct(formData: FormData): Promise<CreateProductResult> {
  const imageFile = formDataOptionalFile(formData, 'image')
  const nutritionalImageFile = formDataOptionalFile(formData, 'nutritionalImage')

  const rawInput = {
    name: formDataString(formData, 'name'),
    slug: formDataString(formData, 'slug'),
    categoryId: formDataInt(formData, 'categoryId'),
    productType: formDataString(formData, 'productType'),
    description: formDataOptionalString(formData, 'description'),
    priceCents: formDataInt(formData, 'priceCents'),
    compareAtCents: formDataOptionalInt(formData, 'compareAtCents'),
    stockQuantityGrams: formDataOptionalInt(formData, 'stockQuantityGrams'),
    stockQuantityUnits: formDataOptionalInt(formData, 'stockQuantityUnits'),
    // '' no FormData → formDataOptionalInt retorna null; .optional() do Zod
    // aceita só undefined — converter null → undefined (campo ausente).
    lowStockThresholdGrams: formDataOptionalInt(formData, 'lowStockThresholdGrams') ?? undefined,
    lowStockThresholdUnits: formDataOptionalInt(formData, 'lowStockThresholdUnits') ?? undefined,
    isActive: formDataBoolean(formData, 'isActive'),
    isFeatured: formDataBoolean(formData, 'isFeatured'),
  }

  const parsed = createProductSchema.safeParse(rawInput)
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
  const slug = generateSlug(data.slug) || generateSlug(data.name)

  if (!slug) {
    return { success: false, error: 'Identificador (slug) inválido' }
  }

  if (imageFile) {
    const imageError = validateProductImageFile(imageFile)
    if (imageError) return { success: false, error: imageError }
  }

  if (nutritionalImageFile) {
    const nutritionalError = validateProductImageFile(nutritionalImageFile)
    if (nutritionalError) return { success: false, error: nutritionalError }
  }

  const uploadedPaths: string[] = []

  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data: existingSlug, error: slugError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (slugError) {
      logError(
        logger,
        slugError,
        { action: 'createProduct', user_id: user.id, slug },
        'Falha ao verificar unicidade do slug',
      )
      return { success: false, error: 'Erro interno' }
    }

    if (existingSlug) {
      return {
        success: false,
        error: 'Já existe um produto com esse identificador (slug), escolha outro',
      }
    }

    let imageUrl: string | null = null
    let nutritionalTableImageUrl: string | null = null

    if (imageFile) {
      const objectPath = `${slug}-produto.webp`
      const uploaded = await uploadProductImage(supabaseAdmin, imageFile, objectPath)
      if (!uploaded.success) {
        return { success: false, error: 'Erro ao enviar imagem do produto' }
      }
      uploadedPaths.push(objectPath)
      imageUrl = uploaded.publicUrl
    }

    if (nutritionalImageFile) {
      const objectPath = `${slug}-nutricional.webp`
      const uploaded = await uploadProductImage(supabaseAdmin, nutritionalImageFile, objectPath)
      if (!uploaded.success) {
        await removeUploadedPaths(supabaseAdmin, uploadedPaths)
        return { success: false, error: 'Erro ao enviar imagem da tabela nutricional' }
      }
      uploadedPaths.push(objectPath)
      nutritionalTableImageUrl = uploaded.publicUrl
    }

    const isGranel = data.productType === 'granel'
    const incrementGrams = isGranel ? 100 : 1

    const insertPayload = {
      name: data.name,
      slug,
      category_id: data.categoryId,
      product_type: data.productType,
      unit: isGranel ? ('KG' as const) : ('UN' as const),
      increment_grams: incrementGrams,
      description: data.description?.trim() ? data.description.trim() : null,
      price_cents: data.priceCents,
      compare_at_cents: data.compareAtCents ?? null,
      is_active: data.isActive,
      is_featured: data.isFeatured,
      // Thresholds NOT NULL no banco (DEFAULT 500/5). Omitir o irrelevante
      // deixa o Postgres aplicar o DEFAULT — nunca enviar null.
      ...(data.lowStockThresholdGrams != null
        ? { low_stock_threshold_grams: data.lowStockThresholdGrams }
        : {}),
      ...(data.lowStockThresholdUnits != null
        ? { low_stock_threshold_units: data.lowStockThresholdUnits }
        : {}),
      stock_quantity_grams: isGranel ? (data.stockQuantityGrams ?? null) : null,
      stock_quantity_units: isGranel ? null : (data.stockQuantityUnits ?? null),
      image_url: imageUrl,
      nutritional_table_image_url: nutritionalTableImageUrl,
    }

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('products')
      .insert(insertPayload)
      .select('id')
      .single()

    if (insertError || !inserted) {
      logError(
        logger,
        insertError ?? new Error('Insert sem retorno de id'),
        { action: 'createProduct', user_id: user.id, slug },
        'Falha ao criar produto',
      )
      await removeUploadedPaths(supabaseAdmin, uploadedPaths)
      return { success: false, error: 'Erro interno' }
    }

    const productId = inserted.id

    const { error: auditError } = await supabaseAdmin.from('admin_audit_log').insert({
      action: 'create_product',
      entity: 'products',
      entity_id: String(productId),
      user_id: user.id,
      old_value: null,
      new_value: insertPayload as Json,
      reason: null,
    })

    if (auditError) {
      logError(
        logger,
        auditError,
        { action: 'createProduct', productId, user_id: user.id },
        'Erro ao registrar audit log de criação de produto',
      )
      // Criação já persistiu — não reverter; só logar falha de auditoria.
    }

    revalidatePath('/admin/produtos')
    revalidatePath('/loja')

    return { success: true, productId }
  } catch (error) {
    logError(logger, error, { action: 'createProduct', user_id: user.id }, 'Erro inesperado ao criar produto')
    try {
      await removeUploadedPaths(getSupabaseAdmin(), uploadedPaths)
    } catch {
      // limpeza best-effort
    }
    return { success: false, error: 'Erro interno' }
  }
}
