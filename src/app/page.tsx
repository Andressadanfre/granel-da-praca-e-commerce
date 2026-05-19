import { Navigation } from '@/components/layout/Navigation'
import { HeroBanner } from '@/components/sections/HeroBanner'
import TrustBadges from '@/components/sections/TrustBadges'
import CategoryGrid from '@/components/sections/CategoryGrid'
import FeaturedProducts from '@/components/sections/FeaturedProducts'
import { Footer } from '@/components/layout/Footer'

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <HeroBanner />
        <TrustBadges />
        <CategoryGrid />
        <FeaturedProducts />
      </main>
      <Footer />
    </>
  )
}
