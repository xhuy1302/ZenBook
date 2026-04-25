import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Star, Minus, Plus, MapPin, ChevronDown, ChevronUp, Zap } from 'lucide-react'

import type { BookResponse } from '@/services/book/book.type'
import { getAddressesApi } from '@/services/customer/customer.api'
import { getActiveFlashSaleApi } from '@/services/promotion/promotion.api'
import AddressDialog from '../account/modals/AddressDialog'

export interface FlashSaleInfo {
  endTime: string
  soldQuantity: number
  totalQuantity: number
  percentSold: number
}

interface ProductInfoProps {
  book: BookResponse
  quantity: number
  onQuantityChange: (qty: number) => void
  flashSaleInfo?: FlashSaleInfo
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className='flex items-center gap-0.5'>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < Math.floor(rating)
              ? 'text-amber-400 fill-amber-400'
              : 'text-slate-200 fill-slate-200'
          }`}
        />
      ))}
    </div>
  )
}

function CountdownTimer({ endTime }: { endTime: string }) {
  const calculateTimeLeft = useCallback(() => {
    const targetDateStr =
      endTime.includes('Z') || endTime.includes('+') ? endTime : `${endTime}+07:00`
    const targetDate = new Date(targetDateStr).getTime()
    const now = new Date().getTime()
    const difference = Math.floor((targetDate - now) / 1000)

    if (difference > 0) {
      return {
        hours: Math.floor(difference / 3600),
        minutes: Math.floor((difference % 3600) / 60),
        seconds: Math.floor(difference % 60)
      }
    }
    return { hours: 0, minutes: 0, seconds: 0 }
  }, [endTime])

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft)

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [calculateTimeLeft])

  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <div className='flex items-center gap-1 font-bold'>
      <span className='bg-slate-900 text-white px-1.5 py-1 rounded text-[13px] leading-none min-w-[28px] text-center shadow-sm'>
        {pad(timeLeft.hours)}
      </span>
      <span className='text-white font-black pb-0.5'>:</span>
      <span className='bg-slate-900 text-white px-1.5 py-1 rounded text-[13px] leading-none min-w-[28px] text-center shadow-sm'>
        {pad(timeLeft.minutes)}
      </span>
      <span className='text-white font-black pb-0.5'>:</span>
      <span className='bg-slate-900 text-white px-1.5 py-1 rounded text-[13px] leading-none min-w-[28px] text-center shadow-sm'>
        {pad(timeLeft.seconds)}
      </span>
    </div>
  )
}

const VOUCHERS = [
  { id: '1', icon: '🟡', label: 'Mã giảm 10k - cho đơn hàng từ 150k' },
  { id: '2', icon: '🟢', label: 'Mã freeship 20k - cho đơn hàng từ 300k' },
  { id: '3', icon: '🔵', label: 'Zalopay: giảm 50k cho bạn mới' },
  { id: '4', icon: '🟣', label: 'Quà tặng móc khóa ZenBook' }
]

export default function ProductInfo({
  book,
  quantity,
  onQuantityChange,
  flashSaleInfo
}: ProductInfoProps) {
  const { t } = useTranslation('common')
  const [showAllVouchers, setShowAllVouchers] = useState(false)
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)

  const { data: addresses, isLoading: loadingAddress } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddressesApi,
    staleTime: 5 * 60 * 1000
  })

  const { data: promotionRaw } = useQuery({
    queryKey: ['promotion', 'active-flash-sale'],
    queryFn: getActiveFlashSaleApi,
    staleTime: 5 * 60 * 1000
  })

  const promotion = promotionRaw?.data || promotionRaw
  const flashBook = promotion?.books?.find((b: BookResponse) => String(b.id) === String(book.id))
  const targetEndDate = promotion?.endDate

  let activeFlashSaleInfo: FlashSaleInfo | undefined = flashSaleInfo

  if (!activeFlashSaleInfo && flashBook && targetEndDate) {
    // 👉 ĐÃ SỬA: Lấy đúng số lượng đã bán thực tế, không cộng thêm 5
    const actualSold = book.soldQuantity && book.soldQuantity > 0 ? book.soldQuantity : 0
    const currentStock = flashBook.stockQuantity || 0

    // Ước lượng tổng số lượng Flash Sale ban đầu (đã bán + tồn kho)
    const totalFlashSaleQty = Math.max(actualSold + currentStock, 1)

    // 👉 ĐÃ SỬA: Thanh tiến trình tối thiểu 3% để nhìn không bị lẹm, nhưng tối đa 100%
    let percent = Math.round((actualSold / totalFlashSaleQty) * 100)
    if (percent < 3) percent = 3
    if (percent > 100) percent = 100

    activeFlashSaleInfo = {
      endTime: targetEndDate,
      soldQuantity: actualSold,
      totalQuantity: totalFlashSaleQty,
      percentSold: percent
    }
  }

  const isFlashSale = !!activeFlashSaleInfo

  const defaultAddress = addresses?.find((addr) => addr.isDefault) || addresses?.[0]
  const displayAddress = defaultAddress
    ? `${defaultAddress.ward}, ${defaultAddress.district}, ${defaultAddress.city}`
    : t('product.location', 'Hà Nội, Việt Nam')

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
      <h1 className='text-xl xl:text-2xl font-bold text-slate-900 leading-snug'>{book.title}</h1>

      <div className='grid grid-cols-2 gap-x-6 gap-y-2 text-[13.5px] text-slate-600'>
        {book.publisher?.name && (
          <p>
            {t('product.specs.publisher')}:{' '}
            <a href='#' className='text-[#c92127] hover:underline font-semibold'>
              {book.publisher.name}
            </a>
          </p>
        )}
        {book.authors?.[0]?.name && (
          <p>
            {t('product.author')}:{' '}
            <a href='#' className='text-[#c92127] hover:underline font-semibold'>
              {book.authors[0].name}
            </a>
          </p>
        )}
        {book.format && (
          <p>
            {t('product.specs.format')}:{' '}
            <span className='font-semibold text-slate-800'>
              {book.format === 'HARDCOVER' ? t('product.hardcover') : t('product.paperback')}
            </span>
          </p>
        )}
      </div>

      <div className='flex items-center gap-3 text-[13.5px] text-slate-500'>
        <StarRow rating={book.rating ?? 0} />
        <a href='#reviews' className='text-[#c92127] hover:underline font-medium'>
          ({book.reviews ?? 0} {t('product.reviews')})
        </a>
        <span className='text-slate-300'>|</span>
        <span>
          {t('product.sold')}{' '}
          <strong className='text-slate-800'>
            {(book.soldQuantity ?? 0) >= 1000
              ? `${((book.soldQuantity ?? 0) / 1000).toFixed(1)}k`
              : (book.soldQuantity ?? 0)}
          </strong>
        </span>
      </div>

      <div className='flex flex-col gap-3 mt-1'>
        {isFlashSale && activeFlashSaleInfo && (
          <div className='flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-[#F53D2D] to-[#FF6B00] rounded-xl p-3 shadow-sm gap-3'>
            <div className='flex items-center gap-3 lg:gap-4'>
              <div className='flex items-center text-white italic font-black text-lg tracking-wider'>
                FLASH
                <Zap className='w-5 h-5 mx-0.5 fill-[#FFE818] text-[#FFE818]' />
                SALE
              </div>
              <CountdownTimer endTime={activeFlashSaleInfo.endTime} />
            </div>

            <div className='relative w-full sm:w-[180px] h-5 bg-[#FFBda6] rounded-full overflow-hidden flex items-center justify-center border border-[#F53D2D]/20'>
              <div
                className='absolute top-0 left-0 h-full bg-gradient-to-r from-[#ff7a59] to-[#F53D2D] rounded-full transition-all duration-500'
                style={{ width: `${activeFlashSaleInfo.percentSold}%` }}
              />
              <span className='relative z-10 text-[11px] font-bold text-white uppercase drop-shadow-md tracking-wide'>
                Đã bán {activeFlashSaleInfo.soldQuantity}
              </span>
            </div>
          </div>
        )}

        <div className='flex flex-wrap items-end gap-3'>
          <span className='text-[32px] font-bold text-[#c92127] leading-none'>
            {fmt(book.salePrice ?? 0)} đ
          </span>
          {hasDiscount && book.originalPrice && (
            <div className='flex items-center gap-2 mb-1'>
              <span className='text-[15px] text-slate-400 line-through font-medium'>
                {fmt(book.originalPrice)} đ
              </span>
              <span className='bg-[#c92127] text-white text-[12px] font-bold px-1.5 py-0.5 rounded'>
                -{book.discount}%
              </span>
            </div>
          )}
        </div>
      </div>

      {!isOutOfStock ? (
        <div className='bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-blue-600 mt-1 w-fit'>
          {book.stockQuantity} {t('product.inStock')}
        </div>
      ) : (
        <div className='bg-rose-50 border border-rose-100 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-rose-600 mt-1 w-fit'>
          {t('product.outOfStock')}
        </div>
      )}

      <div className='border border-slate-200 rounded-xl overflow-hidden mt-1'>
        <div className='flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3'>
          <p className='text-[14px] font-bold text-slate-800'>
            {t('product.deliveryInfo', 'Thông tin vận chuyển')}
          </p>
        </div>

        <div className='px-4 py-3.5 text-[13px] text-slate-600 flex flex-col gap-3.5'>
          <div className='flex items-start gap-1.5 flex-wrap'>
            <span className='mt-0.5 font-medium'>{t('product.deliverTo', 'Giao hàng đến')}</span>
            <div className='flex-1 ml-1'>
              {loadingAddress ? (
                <span className='text-slate-400 italic'>Đang tải địa chỉ...</span>
              ) : (
                <span className='font-bold text-slate-900 leading-snug truncate block max-w-[250px] sm:max-w-full'>
                  {displayAddress}
                </span>
              )}
            </div>
            <button
              onClick={() => setAddressDialogOpen(true)}
              className='text-[#c92127] hover:underline font-semibold shrink-0'
            >
              {t('common.change', 'Thay đổi')}
            </button>
          </div>

          <div className='flex items-start gap-3 pt-3 border-t border-slate-100'>
            <div className='w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0'>
              <MapPin className='w-4 h-4 text-emerald-600' />
            </div>
            <div>
              <p className='font-bold text-slate-800 text-[13.5px]'>
                {t('product.standardDelivery', 'Giao hàng tiêu chuẩn')}
              </p>
              <p className='text-slate-500 mt-0.5 font-medium'>
                {t('product.estimatedDelivery', 'Dự kiến giao trong 2-3 ngày làm việc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-2.5 mt-2'>
        <div className='flex items-center justify-between'>
          <p className='text-[14px] font-bold text-slate-800'>
            {t('product.relatedOffers', 'Ưu đãi liên quan')}
          </p>
          <button
            onClick={() => setShowAllVouchers(!showAllVouchers)}
            className='text-[13px] text-[#c92127] hover:underline flex items-center gap-1 font-semibold'
          >
            {showAllVouchers ? t('product.collapse') : t('product.seeMore')}
            {showAllVouchers ? (
              <ChevronUp className='w-3.5 h-3.5' />
            ) : (
              <ChevronDown className='w-3.5 h-3.5' />
            )}
          </button>
        </div>
        <div className='flex gap-2.5 flex-wrap'>
          {displayedVouchers.map((v) => (
            <div
              key={v.id}
              className='flex items-center gap-2 border border-dashed border-brand-green/50 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-slate-700 cursor-pointer hover:border-brand-green hover:text-brand-green transition-colors bg-brand-green/5'
            >
              <span className='text-base leading-none'>{v.icon}</span>
              <span>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className='flex items-center gap-5 pt-5 mt-2 border-t border-slate-100'>
        <span className='text-[14px] text-slate-800 font-bold min-w-[70px]'>
          {t('product.quantity')}
        </span>
        <div className='flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white'>
          <button
            onClick={handleDecrease}
            disabled={quantity <= 1 || isOutOfStock}
            className='w-9 h-9 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 text-slate-600 border-r border-slate-200 transition-colors'
          >
            <Minus className='w-4 h-4' />
          </button>
          <span className='w-12 h-9 flex items-center justify-center text-[14px] font-bold text-slate-800 select-none'>
            {quantity}
          </span>
          <button
            onClick={handleIncrease}
            disabled={quantity >= (book.stockQuantity ?? 0) || isOutOfStock}
            className='w-9 h-9 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 text-slate-600 border-l border-slate-200 transition-colors'
          >
            <Plus className='w-4 h-4' />
          </button>
        </div>
      </div>

      <AddressDialog
        open={addressDialogOpen}
        onOpenChange={setAddressDialogOpen}
        onSave={async () => {
          setAddressDialogOpen(false)
        }}
      />
    </div>
  )
}
