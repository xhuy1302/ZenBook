import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Star, Minus, Plus, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import type { BookResponse } from '@/services/book/book.type'

interface ProductInfoProps {
  book: BookResponse
  quantity: number
  onQuantityChange: (qty: number) => void
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className='flex items-center gap-0.5'>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

// Vouchers có thể giữ nguyên hoặc tách ra file i18n nếu muốn, ở đây giữ nguyên
const VOUCHERS = [
  { id: '1', icon: '🟡', label: 'Mã giảm 10k - cho đơn hàng từ 150k' },
  { id: '2', icon: '🟢', label: 'Mã freeship 20k - cho đơn hàng từ 300k' },
  { id: '3', icon: '🔵', label: 'Zalopay: giảm 50k cho bạn mới' },
  { id: '4', icon: '🟣', label: 'Quà tặng móc khóa ZenBook' }
]

export default function ProductInfo({ book, quantity, onQuantityChange }: ProductInfoProps) {
  const { t } = useTranslation('common')
  const [showAllVouchers, setShowAllVouchers] = useState(false)

  const isOutOfStock = (book.stockQuantity ?? 0) === 0
  const hasDiscount = (book.discount ?? 0) > 0
  const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

  const handleDecrease = () => onQuantityChange(Math.max(1, quantity - 1))
  const handleIncrease = () => {
    if (quantity < (book.stockQuantity ?? 0)) onQuantityChange(quantity + 1)
  }

  const displayedVouchers = showAllVouchers ? VOUCHERS : VOUCHERS.slice(0, 2)

  return (
    <div className='flex flex-col gap-4'>
      {/* Title */}
      <h1 className='text-xl font-bold text-gray-900 leading-snug'>{book.title}</h1>

      {/* Meta grid */}
      <div className='grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-gray-600'>
        {book.publisher?.name && (
          <p>
            {t('product.specs.publisher')}:{' '}
            <a href='#' className='text-[#c92127] hover:underline font-medium'>
              {book.publisher.name}
            </a>
          </p>
        )}
        {book.authors?.[0]?.name && (
          <p>
            {t('product.author')}:{' '}
            <a href='#' className='text-[#c92127] hover:underline font-medium'>
              {book.authors[0].name}
            </a>
          </p>
        )}
        {book.format && (
          <p>
            {t('product.specs.format')}:{' '}
            <span className='font-medium text-gray-800'>
              {book.format === 'HARDCOVER' ? t('product.hardcover') : t('product.paperback')}
            </span>
          </p>
        )}
      </div>

      {/* Rating + sold */}
      <div className='flex items-center gap-3 text-sm text-gray-500'>
        <StarRow rating={book.rating ?? 0} />
        <a href='#reviews' className='text-[#c92127] hover:underline text-xs'>
          ({book.reviews ?? 0} {t('product.reviews')})
        </a>
        <span className='text-gray-200'>|</span>
        <span className='text-xs'>
          {t('product.sold')}{' '}
          <strong className='text-gray-700'>
            {(book.soldQuantity ?? 0) >= 1000
              ? `${((book.soldQuantity ?? 0) / 1000).toFixed(1)}k`
              : (book.soldQuantity ?? 0)}
          </strong>
        </span>
      </div>

      {/* Price row */}
      <div className='flex flex-wrap items-baseline gap-3'>
        <span className='text-3xl font-bold text-[#c92127]'>{fmt(book.salePrice ?? 0)} đ</span>
        {hasDiscount && book.originalPrice && (
          <>
            <span className='text-sm text-gray-400 line-through'>{fmt(book.originalPrice)} đ</span>
            <span className='bg-[#c92127] text-white text-xs font-bold px-1.5 py-0.5 rounded-sm'>
              -{book.discount}%
            </span>
          </>
        )}
      </div>

      {/* Stock availability */}
      {!isOutOfStock ? (
        <div className='bg-[#e8f4fd] border border-[#b3d7f0] rounded px-4 py-2.5 text-sm font-medium text-[#1565c0]'>
          {book.stockQuantity} {t('product.inStock')}
        </div>
      ) : (
        <div className='bg-red-50 border border-red-200 rounded px-4 py-2.5 text-sm font-medium text-red-600'>
          {t('product.outOfStock')}
        </div>
      )}

      {/* Delivery info */}
      <div className='border border-gray-200 rounded overflow-hidden'>
        <p className='text-sm font-bold text-gray-800 px-4 py-2.5 border-b border-gray-100 bg-gray-50'>
          {t('product.deliveryInfo', 'Thông tin vận chuyển')}
        </p>
        <div className='px-4 py-3 text-xs text-gray-600 flex flex-col gap-2'>
          <div className='flex items-center gap-1.5 flex-wrap'>
            <span>{t('product.deliverTo', 'Giao hàng đến')}</span>
            <span className='font-semibold text-gray-900'>
              {t('product.location', 'Hà Nội, Việt Nam')}
            </span>
            <button className='text-[#c92127] hover:underline ml-1 font-medium'>
              {t('common.change', 'Thay đổi')}
            </button>
          </div>
          <div className='flex items-start gap-2'>
            <div className='w-6 h-6 bg-green-100 rounded flex items-center justify-center shrink-0 mt-0.5'>
              <MapPin className='w-3.5 h-3.5 text-green-600' />
            </div>
            <div>
              <p className='font-semibold text-gray-800 text-sm'>
                {t('product.standardDelivery', 'Giao hàng tiêu chuẩn')}
              </p>
              <p className='text-gray-500 mt-0.5'>
                {t('product.estimatedDelivery', 'Dự kiến giao trong 2-3 ngày làm việc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vouchers */}
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between'>
          <p className='text-sm font-bold text-gray-800'>
            {t('product.relatedOffers', 'Ưu đãi liên quan')}
          </p>
          <button
            onClick={() => setShowAllVouchers(!showAllVouchers)}
            className='text-xs text-[#c92127] hover:underline flex items-center gap-0.5 font-medium'
          >
            {showAllVouchers ? t('product.collapse') : t('product.seeMore')}
            {showAllVouchers ? (
              <ChevronUp className='w-3 h-3' />
            ) : (
              <ChevronDown className='w-3 h-3' />
            )}
          </button>
        </div>
        <div className='flex gap-2 flex-wrap'>
          {displayedVouchers.map((v) => (
            <div
              key={v.id}
              className='flex items-center gap-1.5 border border-dashed border-gray-300 rounded px-2 py-1.5 text-xs text-gray-600 cursor-pointer hover:border-[#c92127] hover:text-[#c92127] transition-colors bg-white'
            >
              <span className='text-base leading-none'>{v.icon}</span>
              <span>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quantity selector */}
      <div className='flex items-center gap-4 pt-4 border-t border-gray-100'>
        <span className='text-sm text-gray-700 font-medium min-w-[70px]'>
          {t('product.quantity')}
        </span>
        <div className='flex items-center border border-gray-300 rounded-sm overflow-hidden bg-white'>
          <button
            onClick={handleDecrease}
            disabled={quantity <= 1 || isOutOfStock}
            className='w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 text-gray-600 border-r border-gray-300 transition-colors'
          >
            <Minus className='w-3.5 h-3.5' />
          </button>
          <span className='w-12 h-8 flex items-center justify-center text-sm font-semibold select-none'>
            {quantity}
          </span>
          <button
            onClick={handleIncrease}
            disabled={quantity >= (book.stockQuantity ?? 0) || isOutOfStock}
            className='w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 text-gray-600 border-l border-gray-300 transition-colors'
          >
            <Plus className='w-3.5 h-3.5' />
          </button>
        </div>
        <span className='text-xs text-gray-400'>
          {isOutOfStock ? t('product.outOfStock') : `${book.stockQuantity} ${t('product.inStock')}`}
        </span>
      </div>
    </div>
  )
}
