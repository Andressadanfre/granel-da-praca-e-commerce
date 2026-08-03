import { getActiveCategories } from '@/lib/admin/products'
import { ProductCreateForm } from '@/components/admin/ProductCreateForm'

export const dynamic = 'force-dynamic'

export default async function AdminProdutoNovoPage() {
  const categorias = await getActiveCategories()

  return <ProductCreateForm categorias={categorias} />
}
