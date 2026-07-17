export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { HeroBanner } from '@/components/sections/HeroBanner'
import TrustBadges from '@/components/sections/TrustBadges'
import DiferenciaisSection from '@/components/sections/DiferenciaisSection'
import CompreObjetivoSection from '@/components/sections/CompreObjetivoSection'
import FeaturedProducts from '@/components/sections/FeaturedProducts'
import OfertasSection from '@/components/sections/OfertasSection'
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton'
import { Footer } from '@/components/layout/Footer'

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <HeroBanner />
        <TrustBadges />
        <DiferenciaisSection />
        <CompreObjetivoSection />
        <Suspense
          fallback={
            <section className="bg-[#F9F5EF] py-14 lg:py-20">
              <div className="max-w-[1280px] mx-auto px-5 xl:px-0">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                  <ProductCardSkeleton count={4} />
                </div>
              </div>
            </section>
          }
        >
          <FeaturedProducts />
        </Suspense>
        <Suspense fallback={null}>
          <OfertasSection />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
