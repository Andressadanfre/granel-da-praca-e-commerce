import { ProductCard } from '@/components/product/ProductCard'
import type { ProductCardProps, ProductState } from '@/components/product/ProductCard'
import { getRelatedProducts } from '@/lib/products/product-detail'
import type { RelatedProduct } from '@/lib/products/product-detail'

const RELATED_LIMIT = 8

export interface RelatedProductsProps {
  categoryId: number
  excludeId: number
}

function resolveState(product: RelatedProduct, hasDiscount: boolean): ProductState {
  if (product.stock_status === 'out_of_stock') return 'out-of-stock'
  if (product.stock_status === 'low_stock') return 'low-stock'
  if (hasDiscount) return 'discount'
  return 'default'
}

function mapRelatedToCardProps(product: RelatedProduct): ProductCardProps {
  const isGranel = product.product_type === 'granel'
  const compareAtCents = product.compare_at_cents
  const hasDiscount = compareAtCents !== null

  const discountPercent = hasDiscount
    ? Math.round((1 - product.price_cents / compareAtCents) * 100)
    : undefined

  const priceInCents = isGranel
    ? Math.round(product.price_cents / 10)
    : product.price_cents

  const pricePerKgInCents = isGranel ? product.price_cents : undefined

  const originalPriceInCents =
    compareAtCents === null
      ? undefined
      : isGranel
        ? Math.round(compareAtCents / 10)
        : compareAtCents

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    categorySlug: product.category.slug,
    category: product.category.name,
    variant: product.product_type,
    priceInCents,
    originalPriceInCents,
    pricePerKgInCents,
    imageUrl: product.imageUrl ?? undefined,
    discountPercent,
    state: resolveState(product, hasDiscount),
  }
}

export async function RelatedProducts({
  categoryId,
  excludeId,
}: RelatedProductsProps) {
  const products = await getRelatedProducts(categoryId, excludeId, RELATED_LIMIT)

  if (products.length === 0) return null

  return (
    <section aria-label="Produtos relacionados">
      <h2 className="text-lg font-semibold text-t9 mb-6">
        Você também pode gostar
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} {...mapRelatedToCardProps(product)} />
        ))}
      </div>
    </section>
  )
}
