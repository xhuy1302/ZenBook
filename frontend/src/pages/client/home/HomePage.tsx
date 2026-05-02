import HeroArea from '@/components/zenbook/homepage/HeroArea'
import TrustBanner from '@/components/zenbook/homepage/TrustBanner'
import FlashSale from '@/components/zenbook/homepage/FlashSale'
import BookGrid from '@/components/zenbook/homepage/BookGrid'
import Publishers from '@/components/zenbook/homepage/Publishers'
import Testimonials from '@/components/zenbook/homepage/Testimonials'
import BookRecommendation from '@/components/zenbook/homepage/BookRecommendation'

export default function HomePage() {
  return (
    <main className='min-h-screen bg-background'>
      <HeroArea />
      <TrustBanner />
      <FlashSale />
      <BookGrid />
      <BookRecommendation />
      <Publishers />
      <Testimonials />
    </main>
  )
}
