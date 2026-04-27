import { useEffect, useCallback, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { BookOpen, ChevronRight, ChevronLeft, Sparkles, TrendingUp } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { heroBanners } from '@/lib/data'
import { getCategoryTreeApi } from '@/services/category/category.api'
import type { CategoryResponse } from '@/services/category/category.type'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMenu } from '@/context/MenuContext'

const RecursiveSubMenu = ({ items, depth = 0 }: { items: CategoryResponse[]; depth?: number }) => {
  if (!items || items.length === 0) return null

  return (
    <ul className={`flex flex-col gap-2 ${depth === 0 ? 'mt-0' : 'mt-1.5'}`}>
      {items.map((item) => (
        <li key={item.id} className={depth > 0 ? 'ml-3 border-l border-slate-200 pl-3' : ''}>
          <Link
            to={`/products?categoryIds=${item.id}`}
            className='text-[12.5px] text-slate-500 hover:text-brand-green transition-all inline-block hover:translate-x-1 font-medium'
          >
            {item.categoryName}
          </Link>
          <RecursiveSubMenu items={item.children || []} depth={depth + 1} />
        </li>
      ))}
    </ul>
  )
}

export default function HeroArea() {
  const { t } = useTranslation('common')
  const safeTranslate = t as unknown as (key: string, options?: Record<string, unknown>) => string
  const { isHeroMenuOpen, setIsHeroMenuOpen } = useMenu()

  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [hoveredCategory, setHoveredCategory] = useState<CategoryResponse | null>(null)

  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    getCategoryTreeApi()
      .then(setCategories)
      .finally(() => setLoadingCategories(false))
  }, [])

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

  const handleMouseEnter = (cat: CategoryResponse) => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current)
    setHoveredCategory(cat)
  }

  const handleMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null)
    }, 150)
  }

  return (
    <section className='max-w-7xl mx-auto px-4 py-4'>
      {isHeroMenuOpen && (
        <div
          className='fixed inset-0 bg-black/60 backdrop-blur-[3px] z-40 animate-in fade-in duration-300'
          onClick={() => setIsHeroMenuOpen(false)}
        />
      )}

      <div className='flex gap-4 relative'>
        {/* Menu Cha */}
        <aside
          className={`hidden lg:flex flex-col w-[260px] xl:w-[280px] shrink-0 bg-white border border-slate-200 rounded-xl overflow-hidden relative shadow-md transition-all duration-300
            ${isHeroMenuOpen ? 'z-50 ring-2 ring-brand-green/30 shadow-2xl scale-[1.01]' : 'z-20'}
          `}
          onMouseLeave={handleMouseLeave}
        >
          <ScrollArea className='h-[500px] bg-white'>
            {loadingCategories ? (
              <ul className='animate-pulse py-2'>
                {Array.from({ length: 8 }).map((_, i) => (
                  <li key={i} className='flex items-center gap-3 px-4 py-3'>
                    <div className='w-8 h-8 rounded-lg bg-slate-100' />
                    <div className='h-4 w-2/3 rounded bg-slate-100' />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className='py-2'>
                {categories.map((cat) => {
                  const hasChildren = cat.children && cat.children.length > 0
                  const isHovered = hoveredCategory?.id === cat.id

                  return (
                    <li key={cat.id} onMouseEnter={() => handleMouseEnter(cat)}>
                      <Link
                        to={`/products?categoryIds=${cat.id}`}
                        className={`flex items-center justify-between px-4 py-3 transition-all border-l-[3px]
                          ${
                            isHovered
                              ? 'bg-brand-green/10 text-brand-green border-brand-green'
                              : 'border-transparent text-slate-800 hover:bg-slate-50 hover:text-brand-green'
                          }`}
                      >
                        <div className='flex items-center gap-3 flex-1'>
                          <div
                            className={`w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-slate-50 border border-slate-100 transition-transform duration-300 shrink-0 ${isHovered ? 'scale-110 shadow-sm border-brand-green/20' : ''}`}
                          >
                            {cat.thumbnailUrl ? (
                              <img
                                src={cat.thumbnailUrl}
                                alt={cat.categoryName}
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <BookOpen
                                className={`w-4.5 h-4.5 ${isHovered ? 'text-brand-green' : 'text-slate-400'}`}
                              />
                            )}
                          </div>
                          {/* Đã chỉnh sửa kích thước chữ danh mục cha lên 15px tại đây */}
                          <span
                            className={`text-[15px] font-bold leading-snug transition-colors ${isHovered ? 'text-brand-green' : 'text-slate-800'}`}
                          >
                            {cat.categoryName}
                          </span>
                        </div>
                        {hasChildren && (
                          <ChevronRight
                            className={`w-4.5 h-4.5 shrink-0 transition-all ${isHovered ? 'translate-x-0.5 text-brand-green' : 'text-slate-300'}`}
                          />
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </ScrollArea>
        </aside>

        {/* Menu Con */}
        {hoveredCategory && hoveredCategory.children && hoveredCategory.children.length > 0 && (
          <div
            className={`hidden lg:block absolute left-[275px] xl:left-[295px] right-0 top-0 min-h-[500px] bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl p-8 overflow-y-auto animate-in slide-in-from-left-2 fade-in duration-300 ${isHeroMenuOpen ? 'z-50' : 'z-30'}`}
            onMouseEnter={() => {
              if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current)
            }}
            onMouseLeave={handleMouseLeave}
          >
            <div className='flex items-center justify-between mb-6 pb-4 border-b border-slate-100'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center'>
                  <Sparkles className='w-5 h-5 text-brand-green' />
                </div>
                <div>
                  <h3 className='font-bold text-lg text-slate-900 tracking-tight leading-none mb-1'>
                    {hoveredCategory.categoryName}
                  </h3>
                  <p className='text-slate-500 text-[11px] font-medium'>
                    Khám phá những tựa sách hay nhất
                  </p>
                </div>
              </div>
              <Link
                to={`/products?categoryIds=${hoveredCategory.id}`}
                className='group flex items-center gap-1.5 text-[12.5px] font-bold text-brand-green bg-brand-green/5 hover:bg-brand-green hover:text-white px-4 py-2 rounded-lg transition-all'
              >
                Xem tất cả{' '}
                <ChevronRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
              </Link>
            </div>

            <div className='flex gap-8'>
              {/* Cột trái: Chứa danh sách category */}
              <div className='flex-1 grid grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-8'>
                {hoveredCategory.children.map((child) => (
                  <div key={child.id} className='flex flex-col group/item'>
                    <Link
                      to={`/products?categoryIds=${child.id}`}
                      className='text-[13px] font-bold text-slate-800 hover:text-brand-green transition-colors pb-2 border-b-2 border-slate-50 group-hover/item:border-brand-green/30 mb-2 inline-block uppercase tracking-wide'
                    >
                      {child.categoryName}
                    </Link>
                    <RecursiveSubMenu items={child.children || []} />
                  </div>
                ))}
              </div>

              {/* Cột phải: Khu vực thêm nội dung quảng cáo/sách nổi bật */}
              <div className='w-[240px] shrink-0 hidden xl:flex flex-col gap-4 border-l border-slate-100 pl-8'>
                <h4 className='flex items-center gap-1.5 text-[12.5px] font-bold text-slate-800 uppercase tracking-wide mb-1'>
                  <TrendingUp className='w-4 h-4 text-brand-amber' /> Nổi bật
                </h4>

                <Link
                  to='/flash-sale'
                  className='relative w-full h-[160px] rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-shadow block'
                >
                  <img
                    src='/images/banner-side-1.jpg'
                    alt='Promo'
                    className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-transparent' />
                  <div className='absolute bottom-0 left-0 right-0 p-4'>
                    <Badge className='bg-rose-500 text-white mb-1.5 text-[10px] px-2 py-0 border-0'>
                      -30%
                    </Badge>
                    <p className='text-white text-[13px] font-bold leading-tight'>
                      Sách Bán Chạy Tuần
                    </p>
                  </div>
                </Link>

                <div className='mt-2'>
                  <p className='text-[11px] font-semibold text-slate-500 mb-2'>Từ khóa tìm kiếm:</p>
                  <div className='flex flex-wrap gap-2'>
                    {['Sách giảm giá', 'Mới xuất bản', 'Combo tiết kiệm'].map((tag) => (
                      <span
                        key={tag}
                        className='px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 text-[11px] rounded-md hover:bg-brand-green/10 hover:text-brand-green hover:border-brand-green/20 transition-colors cursor-pointer'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Banners Chính */}
        <div className='flex-1 min-w-0 z-10'>
          <div className='relative overflow-hidden rounded-2xl h-[500px] shadow-lg' ref={emblaRef}>
            <div className='flex h-full'>
              {heroBanners.map((banner) => {
                const bKey = String(banner.id)
                return (
                  <div key={banner.id} className='relative flex-[0_0_100%] min-w-0 h-full'>
                    <div className='relative w-full h-full'>
                      <img
                        src={banner.image}
                        alt={safeTranslate(`heroBanners.${bKey}.title`)}
                        className='absolute inset-0 w-full h-full object-cover'
                      />
                      <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent' />
                      <div className='absolute inset-0 flex flex-col justify-center px-16 lg:px-20'>
                        <Badge className='w-fit mb-5 bg-brand-amber text-neutral-900 text-xs font-black border-0 px-4 py-1.5 shadow-xl uppercase tracking-widest'>
                          {safeTranslate(`heroBanners.${bKey}.badge`)}
                        </Badge>
                        <h2 className='font-serif text-5xl lg:text-6xl font-bold text-white text-balance leading-[1.1] mb-5 whitespace-pre-line drop-shadow-md'>
                          {safeTranslate(`heroBanners.${bKey}.title`)}
                        </h2>
                        <p className='text-white/90 text-[15px] mb-10 max-w-lg leading-relaxed font-medium'>
                          {safeTranslate(`heroBanners.${bKey}.subtitle`)}
                        </p>
                        <Button className='w-fit bg-brand-green hover:bg-brand-green-dark text-white font-bold text-[13px] h-12 px-8 rounded-xl shadow-[0_10px_25px_-5px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-1 active:scale-95'>
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
              className='absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white flex items-center justify-center shadow-2xl transition-all group active:scale-90'
            >
              <ChevronLeft className='w-5 h-5 text-white group-hover:text-slate-800 transition-colors' />
            </button>
            <button
              onClick={scrollNext}
              className='absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white flex items-center justify-center shadow-2xl transition-all group active:scale-90'
            >
              <ChevronRight className='w-5 h-5 text-white group-hover:text-slate-800 transition-colors' />
            </button>

            <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20'>
              {heroBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === selectedIndex ? 'w-6 bg-brand-green' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={safeTranslate('hero.goToSlide', { index: i + 1 })}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Banners Phụ Bên Phải */}
        <div className='hidden xl:flex flex-col gap-4 w-[260px] shrink-0 z-10'>
          <Link
            to='#'
            className='relative w-full flex-1 rounded-2xl overflow-hidden block group shadow-md hover:shadow-xl transition-all'
          >
            <img
              src='/images/banner-side-1.jpg'
              alt={safeTranslate('hero.bookOfMonth')}
              className='absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent group-hover:from-brand-green/80 transition-colors duration-500' />
            <div className='absolute bottom-0 left-0 right-0 p-5'>
              <Badge className='bg-brand-amber text-neutral-900 mb-2 text-[10px] px-2.5 py-0.5 border-0 font-bold'>
                HOT DEAL
              </Badge>
              <p className='text-white text-[15px] font-bold leading-tight group-hover:text-white transition-colors'>
                {safeTranslate('hero.bookOfMonth')}
              </p>
            </div>
          </Link>
          <Link
            to='#'
            className='relative w-full flex-1 rounded-2xl overflow-hidden block group shadow-md hover:shadow-xl transition-all'
          >
            <img
              src='/images/banner-side-2.jpg'
              alt={safeTranslate('hero.newArrivals')}
              className='absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent group-hover:from-brand-green/80 transition-colors duration-500' />
            <div className='absolute bottom-0 left-0 right-0 p-5'>
              <Badge className='bg-blue-500 text-white mb-2 text-[10px] px-2.5 py-0.5 border-0 font-bold'>
                MỚI VỀ
              </Badge>
              <p className='text-white text-[15px] font-bold leading-tight group-hover:text-white transition-colors'>
                {safeTranslate('hero.newArrivals')}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
