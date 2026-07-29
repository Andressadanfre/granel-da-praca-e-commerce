import { notFound } from 'next/navigation'

import { getAdminProductForEdit, getActiveCategories } from '@/lib/admin/products'
import { ProductEditForm } from '@/components/admin/ProductEditForm'

export const dynamic = 'force-dynamic'

interface AdminProdutoEditarPageProps {
  params: { id: string }
}

export default async function AdminProdutoEditarPage({ params }: AdminProdutoEditarPageProps) {
  const id = Number.parseInt(params.id, 10)
  if (!Number.isFinite(id) || id <= 0) notFound()

  const [product, categorias] = await Promise.all([getAdminProductForEdit(id), getActiveCategories()])

  if (!product) notFound()

  return (
    <ProductEditForm
      key={`${product.id}-${product.updatedAt}`}
      product={product}
      categorias={categorias}
    />
  )
}
