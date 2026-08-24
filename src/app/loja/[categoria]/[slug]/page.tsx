import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { getProductDetail, type ProductDetail } from '@/lib/products/product-detail'
import { ProductDetailHero } from '@/components/pdp/ProductDetailHero'
import { PdpActions } from '@/components/pdp/PdpActions'
import { ProductDescription } from '@/components/pdp/ProductDescription'
import { RelatedProducts } from '@/components/pdp/RelatedProducts'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

const getCachedProduct = cache(getProductDetail)

interface ProductJsonLd {
  '@context': 'https://schema.org'
  '@type': 'Product'
  name: string
  description?: string
  image?: string
  offers: {
    '@type': 'Offer'
    priceCurrency: 'BRL'
    price: number
    availability: string
  }
}

function buildProductJsonLd(
  produto: Pick<
    ProductDetail,
    'name' | 'description' | 'imageUrl' | 'product_type' | 'price_cents' | 'stock_status'
  >,
): ProductJsonLd {
  const consumerPriceCents =
    produto.product_type === 'granel'
      ? Math.round(produto.price_cents / 10)
      : produto.price_cents

  const jsonLd: ProductJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: produto.name,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: consumerPriceCents / 100,
      availability:
        produto.stock_status === 'in_stock'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  }

  if (produto.description) jsonLd.description = produto.description
  if (produto.imageUrl) jsonLd.image = produto.imageUrl

  return jsonLd
}

type Props = { params: { categoria: string; slug: string } }

export const revalidate = 1800

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const produto = await getCachedProduct(params.categoria, params.slug)
  if (!produto) return {}
  const canonicalUrl = `https://graneldapraca.com.br/loja/${params.categoria}/${params.slug}`
  const description =
    produto.description?.slice(0, 155) ??
    `Compre ${produto.name} a granel na Granel da Praça`
  return {
    title: `${produto.name} | Granel da Praça`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: produto.name,
      description,
      type: 'website',
      siteName: 'Granel da Praça',
      url: canonicalUrl,
      images: produto.imageUrl ? [produto.imageUrl] : undefined,
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const produto = await getCachedProduct(params.categoria, params.slug)
  if (!produto) notFound()
  const jsonLd = buildProductJsonLd(produto)
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation />
      <main className="bg-cream min-h-screen">
        <div className="max-w-container mx-auto px-s5 xl:px-0 pt-8 pb-16">
          <div className="grid lg:grid-cols-[480px_1fr] gap-8 lg:gap-12 items-start">
            <div className="lg:sticky lg:top-[167px]">
              <ProductDetailHero produto={produto} />
            </div>
            <div>
              <PdpActions
                product={{
                  id: produto.id,
                  name: produto.name,
                  category: produto.category.name,
                  productType: produto.product_type,
                  imageUrl: produto.imageUrl,
                  priceCents:
                    produto.product_type === 'granel'
                      ? Math.round(produto.price_cents / 10)
                      : produto.price_cents,
                  incrementGrams:
                    produto.product_type === 'granel'
                      ? produto.increment_grams
                      : 0,
                }}
                stockStatus={produto.stock_status}
              />
            </div>
          </div>
          <div className="mt-12 max-w-[720px]">
            <ProductDescription description={produto.description} />
          </div>
          <div className="mt-16">
            <RelatedProducts
              categoryId={produto.category.id}
              excludeId={produto.id}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
