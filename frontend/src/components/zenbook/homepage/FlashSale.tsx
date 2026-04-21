'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Zap, ChevronRight, ChevronLeft, ShoppingCart, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

import { getActiveFlashSaleApi } from '@/services/promotion/promotion.api'
import type { BookResponse } from '@/services/book/book.type'

function useCountdown(endDateString?: string) {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!endDateString) return
    const targetDate = new Date(endDateString).getTime()
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const distance = Math.floor((targetDate - now) / 1000)
      setTimeLeft(distance > 0 ? distance : 0)
    }
    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [endDateString])

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0')
  const seconds = String(timeLeft % 60).padStart(2, '0')
  return { hours, minutes, seconds, isEnded: timeLeft <= 0 }
}

const ITEMS_PER_PAGE = 5

export default function FlashSale() {
  const { t } = useTranslation('common')
  const [page, setPage] = useState(0)

  const { data: promotion, isLoading } = useQuery({
    queryKey: ['promotion', 'active-flash-sale'],
    queryFn: getActiveFlashSaleApi,
    staleTime: 5 * 60 * 1000
  })

  const { hours, minutes, seconds, isEnded } = useCountdown(promotion?.endDate)

  const books: BookResponse[] = promotion?.books ?? []
  const totalPages = Math.ceil(books.length / ITEMS_PER_PAGE)
  const visibleBooks = books.slice(page * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE + ITEMS_PER_PAGE)

  const canPrev = page > 0
  const canNext = page < totalPages - 1

  if (isLoading) {
    return (
      <section className='max-w-7xl mx-auto px-4 py-4'>
        <div className='rounded-xl bg-brand-red-light border border-brand-red/20 h-[350px] flex items-center justify-center'>
          <Loader2 className='w-8 h-8 animate-spin text-brand-red' />
        </div>
      </section>
    )
  }

  if (!promotion || books.length === 0 || isEnded) return null

  return (
    <section className='max-w-7xl mx-auto px-4 py-4'>
      <div className='rounded-xl bg-[#FDE2E4] border border-brand-red/20 overflow-hidden'>
        {/* Header */}
        <div className='bg-white m-3 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center text-brand-red font-black text-xl italic tracking-tight uppercase'>
              FLASH <Zap className='w-6 h-6 text-yellow-400 fill-yellow-400 mx-1' /> SALE
            </div>

            {/* Countdown */}
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium text-neutral-700 hidden sm:block'>
                {t('flashSale.endsIn')}
              </span>
              <div className='flex items-center gap-1.5'>
                <div className='bg-black text-white font-mono font-bold text-base px-2.5 py-1 rounded'>
                  {hours}
                </div>
                <span className='font-bold text-black text-lg'>:</span>
                <div className='bg-black text-white font-mono font-bold text-base px-2.5 py-1 rounded'>
                  {minutes}
                </div>
                <span className='font-bold text-black text-lg'>:</span>
                <div className='bg-black text-white font-mono font-bold text-base px-2.5 py-1 rounded'>
                  {seconds}
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Đổi text-blue-600 → text-brand-red cho đồng nhất giao diện */}

          <Button
            variant='ghost'
            size='sm'
            className='text-brand-green hover:text-brand-green-dark hover:bg-brand-green-light text-sm gap-1'
          >
            <Link to='/flash-sale'> {t('bookGrid.viewAll')}</Link>
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>

        {/* Book Grid + Nav Buttons */}
        <div className='relative px-4 pb-4'>
          {canPrev && (
            <button
              onClick={() => setPage((p) => p - 1)}
              className='absolute left-0 top-1/2 -translate-y-1/2 z-10
                         w-10 h-10 rounded-full bg-white shadow-md border border-border
                         flex items-center justify-center hover:bg-neutral-50 transition-colors'
            >
              <ChevronLeft className='w-5 h-5 text-neutral-600' />
            </button>
          )}

          {canNext && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className='absolute right-0 top-1/2 -translate-y-1/2 z-10
                         w-10 h-10 rounded-full bg-white shadow-md border border-border
                         flex items-center justify-center hover:bg-neutral-50 transition-colors'
            >
              <ChevronRight className='w-5 h-5 text-neutral-600' />
            </button>
          )}

          {/* 5 Books */}
          <div className='grid grid-cols-5 gap-4 mx-4'>
            {visibleBooks.map((book) => {
              const salePrice = book.salePrice || 0
              const currentStock = book.stockQuantity || 0
              const soldQuantity = Math.max(50 - currentStock, 0)
              const stockPercent = Math.max(Math.min(Math.round((soldQuantity / 50) * 100), 100), 5)

              const discountPercent =
                book.originalPrice && book.originalPrice > salePrice
                  ? Math.round(((book.originalPrice - salePrice) / book.originalPrice) * 100)
                  : null

              return (
                <div
                  key={book.id}
                  className='bg-white rounded-lg border border-transparent hover:border-brand-red overflow-hidden
               hover:shadow-md transition-all duration-200 group flex flex-col p-3 relative'
                >
                  {/* Image Container */}
                  <div className='relative w-full aspect-[3/4] mb-2 flex justify-center'>
                    {/* THẺ LINK BỌC ẢNH SÁCH */}
                    <Link to={`/product/${book.slug || book.id}`}>
                      <img
                        src={book.thumbnail || '/images/placeholder-book.jpg'}
                        alt={book.title}
                        className='absolute inset-0 w-full h-full object-contain'
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = '/images/placeholder-book.jpg'
                        }}
                      />

                      {discountPercent && (
                        <Badge className='absolute top-0 left-0 bg-brand-red text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm border-0'>
                          -{discountPercent}%
                        </Badge>
                      )}
                    </Link>

                    {/* NÚT THÊM GIỎ HÀNG (Sửa lại pointer-events)
        Lớp nền đen mờ này KHÔNG ĐƯỢC cản trở click (pointer-events-none), 
        nhưng riêng nút Button bên trong thì VẪN PHẢI click được (pointer-events-auto).
      */}
                    <div className='absolute inset-0 bg-black/5 flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'>
                      <Button
                        size='sm'
                        className='h-8 px-3 text-xs bg-brand-green hover:bg-brand-green-dark text-primary-foreground gap-1.5 shadow-lg rounded-md pointer-events-auto'
                      >
                        <ShoppingCart className='w-3.5 h-3.5' />
                        {t('bookCard.quickAdd', 'Thêm giỏ')}
                      </Button>
                    </div>
                  </div>

                  {/* Info Container */}
                  <div className='flex flex-col flex-1'>
                    {/* THẺ LINK BỌC TÊN SÁCH (Đã thêm) */}
                    <Link to={`/product/${book.slug || book.id}`} className='mb-1'>
                      <h3
                        className='text-sm font-semibold text-neutral-800 line-clamp-2 leading-snug hover:text-brand-red transition-colors cursor-pointer'
                        title={book.title}
                      >
                        {book.title}
                      </h3>
                    </Link>

                    <div className='mt-auto flex flex-col gap-1'>
                      {/* Original Price */}
                      <div className='h-4'>
                        {book.originalPrice && book.originalPrice > salePrice && (
                          <span className='text-xs text-neutral-400 line-through'>
                            {new Intl.NumberFormat('vi-VN').format(book.originalPrice)} ₫
                          </span>
                        )}
                      </div>

                      {/* Sale Price */}
                      <span className='text-lg font-bold text-brand-red leading-none mb-1.5'>
                        {new Intl.NumberFormat('vi-VN').format(salePrice)} ₫
                      </span>

                      {/* Progress bar */}
                      <div className='relative w-full h-5 bg-neutral-200 rounded-full overflow-hidden flex items-center justify-center'>
                        <div
                          className='absolute left-0 top-0 bottom-0 bg-gradient-to-r from-green-500 to-brand-green rounded-full transition-all duration-500'
                          style={{ width: `${stockPercent}%` }}
                        />
                        <span className='relative z-10 text-[10px] text-white font-bold tracking-wide uppercase drop-shadow-md'>
                          {stockPercent >= 90
                            ? 'Sắp cháy hàng'
                            : `Đã bán ${soldQuantity > 0 ? soldQuantity : 1}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Placeholder */}
            {visibleBooks.length < ITEMS_PER_PAGE &&
              Array.from({ length: ITEMS_PER_PAGE - visibleBooks.length }).map((_, i) => (
                <div key={`empty-${i}`} className='bg-transparent' />
              ))}
          </div>

          {/* Dot indicators */}
          {totalPages > 1 && (
            <div className='flex justify-center gap-2 mt-4'>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`h-2 rounded-full transition-all ${i === page ? 'w-6 bg-brand-red' : 'w-2 bg-neutral-300'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
