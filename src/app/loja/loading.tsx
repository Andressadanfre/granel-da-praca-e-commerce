import { Navigation } from '@/components/layout/Navigation'
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton'

export default function Loading() {
  return (
    <>
      <Navigation />
      <main className="bg-cream min-h-screen">
        <section className="max-w-[1280px] mx-auto px-5 xl:px-0 py-10 lg:py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            <ProductCardSkeleton count={24} />
          </div>
        </section>
      </main>
    </>
  )
}
