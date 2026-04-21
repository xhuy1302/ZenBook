import { useEffect, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { BookOpen, ChevronRight, ChevronLeft } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { heroBanners } from '@/lib/data' // ← Chỉ giữ heroBanners
import { getAllCategoriesApi } from '@/services/category/category.api'
import type { CategoryResponse } from '@/services/category/category.type'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function HeroArea() {
  const { t } = useTranslation('common')
  const safeTranslate = t as unknown as (key: string, options?: Record<string, unknown>) => string

  // ── Categories state ──────────────────────────────────────
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    getAllCategoriesApi()
      .then(setCategories)

      .finally(() => setLoadingCategories(false))
  }, [])

  // ── Embla carousel ────────────────────────────────────────
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4500, stopOnInteraction: false })
  ])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  return (
    <section className='max-w-7xl mx-auto px-4 py-4'>
      <div className='flex gap-3'>
        {/* Category Sidebar */}
        <aside className='hidden lg:block w-56 shrink-0 bg-card border border-border rounded-lg overflow-hidden'>
          <div className='bg-brand-green px-4 py-2.5'>
            <h2 className='text-sm font-semibold text-primary-foreground'>
              {safeTranslate('hero.categories')}
            </h2>
          </div>

          <ScrollArea className='h-72'>
            {loadingCategories ? (
              // Skeleton loader
              <ul className='animate-pulse'>
                {Array.from({ length: 6 }).map((_, i) => (
                  <li key={i} className='flex items-center gap-2.5 px-4 py-2'>
                    <div className='w-3.5 h-3.5 rounded bg-muted' />
                    <div className='h-3 w-28 rounded bg-muted' />
                  </li>
                ))}
              </ul>
            ) : (
              <ul>
                {categories.map((cat) => {
                  // Dùng cat.icon nếu backend trả về, fallback về BookOpen
                  const Icon = BookOpen
                  return (
                    <li key={cat.id}>
                      <Link
                        to='#'
                        className='flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-brand-green-light hover:text-brand-green transition-colors group'
                      >
                        <Icon className='w-3.5 h-3.5 shrink-0 text-muted-foreground group-hover:text-brand-green transition-colors' />
                        <span>{cat.categoryName}</span>
                        <ChevronRight className='w-3 h-3 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity' />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </ScrollArea>
        </aside>

        {/* Main Carousel — không đổi */}
        <div className='flex-1 min-w-0'>
          <div className='relative overflow-hidden rounded-lg' ref={emblaRef}>
            <div className='flex'>
              {heroBanners.map((banner) => {
                const bKey = String(banner.id)
                return (
                  <div key={banner.id} className='relative flex-[0_0_100%] min-w-0'>
                    <div className='relative w-full h-64 lg:h-72'>
                      <img
                        src={banner.image}
                        alt={safeTranslate(`heroBanners.${bKey}.title`)}
                        className='absolute inset-0 w-full h-full object-cover'
                      />
                      <div className='absolute inset-0 bg-gradient-to-r from-neutral-900/70 via-neutral-900/30 to-transparent' />
                      <div className='absolute inset-0 flex flex-col justify-center px-8 lg:px-12'>
                        <Badge className='w-fit mb-3 bg-brand-amber text-neutral-900 text-xs font-semibold border-0'>
                          {safeTranslate(`heroBanners.${bKey}.badge`)}
                        </Badge>
                        <h2 className='font-serif text-2xl lg:text-3xl font-bold text-white text-balance leading-tight mb-2 whitespace-pre-line'>
                          {safeTranslate(`heroBanners.${bKey}.title`)}
                        </h2>
                        <p className='text-white/80 text-sm mb-4'>
                          {safeTranslate(`heroBanners.${bKey}.subtitle`)}
                        </p>
                        <Button className='w-fit bg-brand-green hover:bg-brand-green-dark text-primary-foreground font-medium'>
                          {safeTranslate(`heroBanners.${bKey}.cta`)}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={scrollPrev}
              className='absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/80 hover:bg-card flex items-center justify-center shadow transition-colors'
              aria-label={safeTranslate('hero.prevSlide')}
            >
              <ChevronLeft className='w-4 h-4 text-foreground' />
            </button>
            <button
              onClick={scrollNext}
              className='absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/80 hover:bg-card flex items-center justify-center shadow transition-colors'
              aria-label={safeTranslate('hero.nextSlide')}
            >
              <ChevronRight className='w-4 h-4 text-foreground' />
            </button>

            <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5'>
              {heroBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`h-1.5 rounded-full transition-all ${i === selectedIndex ? 'w-5 bg-primary-foreground' : 'w-1.5 bg-primary-foreground/50'}`}
                  aria-label={safeTranslate('hero.goToSlide', { index: i + 1 })}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Side Banners — không đổi */}
        <div className='hidden xl:flex flex-col gap-3 w-44 shrink-0'>
          <Link
            to='#'
            className='relative w-full h-[calc(50%-6px)] min-h-[130px] rounded-lg overflow-hidden block group'
          >
            <img
              src='/images/banner-side-1.jpg'
              alt={safeTranslate('hero.bookOfMonth')}
              className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
            />
            <div className='absolute inset-0 bg-neutral-900/30 group-hover:bg-neutral-900/20 transition-colors' />
            <div className='absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-neutral-900/80 to-transparent'>
              <p className='text-primary-foreground text-xs font-semibold'>
                {safeTranslate('hero.bookOfMonth')}
              </p>
            </div>
          </Link>
          <Link
            to='#'
            className='relative w-full h-[calc(50%-6px)] min-h-[130px] rounded-lg overflow-hidden block group'
          >
            <img
              src='/images/banner-side-2.jpg'
              alt={safeTranslate('hero.newArrivals')}
              className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
            />
            <div className='absolute inset-0 bg-neutral-900/30 group-hover:bg-neutral-900/20 transition-colors' />
            <div className='absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-neutral-900/80 to-transparent'>
              <p className='text-primary-foreground text-xs font-semibold'>
                {safeTranslate('hero.newArrivals')}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
