import { useTranslation } from 'react-i18next'
import { Star, ShoppingCart, Award, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { BookResponse } from '@/services/book/book.type'

interface BookCardProps {
  book: BookResponse
  viewMode?: 'grid' | 'list' // Thêm prop này, mặc định là 'grid'
}

export default function BookCard({ book, viewMode = 'grid' }: BookCardProps) {
  const { t } = useTranslation('common')

  const salePrice = book.salePrice || 0
  const rating = book.rating || 0
  const reviews = book.reviews || 0
  const discountPercent =
    book.originalPrice && book.originalPrice > salePrice
      ? Math.round(((book.originalPrice - salePrice) / book.originalPrice) * 100)
      : null

  // ==========================================
  // GIAO DIỆN DẠNG LIST (Dành cho trang Product List)
  // ==========================================
  if (viewMode === 'list') {
    return (
      <div className='flex gap-4 bg-white rounded-xl border border-gray-100 hover:border-brand-green/40 hover:shadow-md transition-all duration-200 group p-4'>
        {/* Image */}
        <Link
          to={`/product/${book.slug || book.id}`}
          className='relative w-28 h-40 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden'
        >
          <img
            src={book.thumbnail || '/images/placeholder-book.jpg'}
            alt={book.title}
            className='w-full h-full object-contain group-hover:scale-105 transition-transform duration-300'
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = '/images/placeholder-book.jpg'
            }}
          />
          {discountPercent && (
            <Badge className='absolute top-1 left-1 bg-brand-red text-white text-[10px] font-bold px-1.5 py-0.5 border-0'>
              -{discountPercent}%
            </Badge>
          )}
        </Link>

        {/* Details */}
        <div className='flex flex-1 flex-col gap-1.5 min-w-0'>
          <Link to={`/product/${book.slug || book.id}`}>
            <h3 className='font-semibold text-gray-800 line-clamp-2 leading-snug hover:text-brand-green transition-colors'>
              {book.title}
            </h3>
          </Link>

          <p className='text-xs text-gray-400'>
            {t('bookCard.author', 'Tác giả')}:{' '}
            <span className='text-gray-600'>{book.authors?.[0]?.name || 'Đang cập nhật'}</span>
          </p>

          {book.publisher && (
            <p className='text-xs text-gray-400'>
              NXB: <span className='text-gray-600'>{book.publisher.name}</span>
            </p>
          )}

          <div className='flex items-center gap-0.5'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-brand-amber fill-brand-amber' : 'text-gray-200 fill-gray-200'}`}
              />
            ))}
            <span className='text-xs text-gray-400 ml-1'>
              ({reviews} {t('bookCard.reviews', 'đánh giá')})
            </span>
          </div>

          {book.description && (
            <p className='text-xs text-gray-500 line-clamp-2 leading-relaxed mt-0.5'>
              {book.description}
            </p>
          )}

          <div className='mt-auto flex items-center justify-between'>
            <div className='flex items-baseline gap-2'>
              <span className='text-xl font-bold text-brand-red'>
                {new Intl.NumberFormat('vi-VN').format(salePrice)}₫
              </span>
              {book.originalPrice && book.originalPrice > salePrice && (
                <span className='text-sm text-gray-400 line-through'>
                  {new Intl.NumberFormat('vi-VN').format(book.originalPrice)}₫
                </span>
              )}
            </div>

            <div className='flex items-center gap-2'>
              <button className='w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center hover:border-brand-red hover:text-brand-red transition-colors'>
                <Heart className='w-4 h-4' />
              </button>
              <Button
                size='sm'
                disabled={book.stockQuantity === 0}
                className='h-9 px-4 text-sm font-semibold gap-1.5 bg-brand-green hover:bg-brand-green/90 text-white border-0 rounded-lg'
              >
                <ShoppingCart className='w-4 h-4' />
                {t('bookCard.quickAdd', 'Thêm vào giỏ')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================
  // GIAO DIỆN DẠNG GRID (Dành cho Home Page & Grid View của Product List)
  // ==========================================
  return (
    <div className='bg-white rounded-xl border border-gray-100 hover:border-brand-green/40 hover:shadow-md transition-all duration-200 group flex flex-col overflow-hidden h-full'>
      {/* Image area */}
      <div className='relative w-full aspect-[3/4] bg-gray-50 overflow-hidden'>
        <Link to={`/product/${book.slug || book.id}`}>
          <img
            src={book.thumbnail || '/images/placeholder-book.jpg'}
            alt={book.title}
            className='w-full h-full object-contain group-hover:scale-105 transition-transform duration-300'
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = '/images/placeholder-book.jpg'
            }}
          />
        </Link>

        {/* Badges (Kết hợp cả 2 file) */}
        <div className='absolute top-2 left-2 flex flex-col gap-1'>
          {book.award && (
            <Badge className='bg-brand-amber text-neutral-900 text-[9px] font-bold border-0 px-1 py-0 flex items-center w-max gap-0.5 shadow-sm'>
              <Award className='w-2 h-2' />
              {t('bookCard.award', 'Giải thưởng')}
            </Badge>
          )}
          {discountPercent && (
            <Badge className='bg-brand-red text-white text-[10px] font-bold px-1.5 py-0.5 border-0 w-max'>
              -{discountPercent}%
            </Badge>
          )}
          {book.stockQuantity === 0 && (
            <Badge className='bg-gray-500 text-white text-[10px] px-1.5 py-0.5 border-0 w-max'>
              {t('bookCard.outOfStock', 'Hết hàng')}
            </Badge>
          )}
        </div>

        {/* Actions on hover */}
        <div className='absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-200'>
          <button className='w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-brand-red hover:text-white transition-colors'>
            <Heart className='w-3.5 h-3.5' />
          </button>
        </div>

        {/* Add to cart on hover */}
        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200'>
          <Button
            size='sm'
            disabled={book.stockQuantity === 0}
            className='w-full h-8 text-xs font-semibold gap-1.5 bg-brand-green hover:bg-brand-green/90 text-white border-0 rounded-lg'
          >
            <ShoppingCart className='w-3.5 h-3.5' />
            {t('bookCard.quickAdd', 'Thêm vào giỏ')}
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className='p-3 flex flex-col gap-1 flex-1'>
        <Link to={`/product/${book.slug || book.id}`}>
          <h3
            className='text-sm font-semibold text-gray-800 line-clamp-2 leading-snug hover:text-brand-green transition-colors'
            title={book.title}
          >
            {book.title}
          </h3>
        </Link>

        <p className='text-xs text-gray-400 line-clamp-1'>
          {book.authors?.[0]?.name || 'Đang cập nhật'}
        </p>

        {/* Stars */}
        <div className='flex items-center gap-0.5'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-brand-amber fill-brand-amber' : 'text-gray-200 fill-gray-200'}`}
            />
          ))}
          <span className='text-[10px] text-gray-400 ml-1'>({reviews})</span>
        </div>

        {/* Price */}
        <div className='mt-auto pt-1 flex items-baseline gap-1.5'>
          <span className='text-base font-bold text-brand-red'>
            {new Intl.NumberFormat('vi-VN').format(salePrice)}₫
          </span>
          {book.originalPrice && book.originalPrice > salePrice && (
            <span className='text-xs text-gray-400 line-through'>
              {new Intl.NumberFormat('vi-VN').format(book.originalPrice)}₫
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
