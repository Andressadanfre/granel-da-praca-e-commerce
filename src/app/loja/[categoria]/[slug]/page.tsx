import { notFound } from 'next/navigation'
import { cache } from 'react'
import { getProductDetail } from '@/lib/products/product-detail'

const getCachedProduct = cache(getProductDetail)

type Props = { params: { categoria: string; slug: string } }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props) {
  const produto = await getCachedProduct(params.categoria, params.slug)
  if (!produto) return {}
  return {
    title: `${produto.name} | Granel da Praça`,
    description:
      produto.description?.slice(0, 155) ??
      `Compre ${produto.name} a granel na Granel da Praça`,
    openGraph: {
      images: produto.image_url ? [produto.image_url] : undefined,
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const produto = await getCachedProduct(params.categoria, params.slug)
  if (!produto) notFound()
  return (
    <main className="bg-cream min-h-screen">
      <div className="max-w-container mx-auto px-s5 xl:px-0 pt-8 pb-16">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">
          <div>
            {/* ProductDetailHero - Passo 3 */}
          </div>
          <aside className="lg:sticky lg:top-[88px]">
            {/* PdpActions - Passo 4 */}
          </aside>
        </div>
        {/* RelatedProducts - Passo 6 */}
      </div>
    </main>
  )
}
