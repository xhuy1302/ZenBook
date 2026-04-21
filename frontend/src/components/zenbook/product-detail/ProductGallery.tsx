import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Images } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BookResponse } from '@/services/book/book.type'

// 👉 Định nghĩa một kiểu dữ liệu nội bộ chỉ dùng cho file này
interface InternalImage {
  id: string
  imageUrl: string
}

interface ProductGalleryProps {
  // Chấp nhận images là any để không bị xung đột với string[] ở file type
  images?: string[]
  thumbnail?: BookResponse['thumbnail']
  title?: BookResponse['title']
  isOutOfStock?: boolean
  onAddToCart?: () => void
  onBuyNow?: () => void
}

const POLICY_ITEMS = [
  { icon: '🚚', label: 'Thời gian giao hàng', value: 'Giao nhanh và uy tín' },
  { icon: '🔄', label: 'Chính sách đổi trả', value: 'Đổi trả miễn phí toàn quốc' },
  { icon: '🏷️', label: 'Chính sách khách sỉ', value: 'Ưu đãi khi mua số lượng lớn' }
]

const MAX_VISIBLE_THUMBS = 4

export default function ProductGallery({
  images = [],
  thumbnail,
  title,
  isOutOfStock = false,
  onAddToCart,
  onBuyNow
}: ProductGalleryProps) {
  const { t } = useTranslation('common')
  const placeholder = '/images/placeholder-book.jpg'

  // 👉 Chuẩn hóa dữ liệu images: Nếu là string thì chuyển thành object, nếu là object thì giữ nguyên
  const formattedImages: InternalImage[] = images.map((img, idx) => {
    if (typeof img === 'string') return { id: `img-${idx}`, imageUrl: img }
    return img as InternalImage
  })

  // 👉 Tạo mảng tổng hợp với kiểu dữ liệu nội bộ đã định nghĩa
  const allImages: InternalImage[] = [
    ...(thumbnail ? [{ id: 'thumb', imageUrl: thumbnail }] : []),
    ...formattedImages
  ]

  // Khởi tạo state với ảnh đầu tiên hoặc placeholder
  const [activeImage, setActiveImage] = useState<string>(allImages[0]?.imageUrl ?? placeholder)

  const visibleThumbs = allImages.slice(0, MAX_VISIBLE_THUMBS)
  const extraCount = allImages.length - MAX_VISIBLE_THUMBS

  return (
    <div className='flex flex-col gap-3'>
      {/* ── Main image ── */}
      <div className='w-full aspect-[3/4] bg-white rounded border border-gray-200 overflow-hidden flex items-center justify-center p-4'>
        <img
          src={activeImage}
          alt={title ?? 'Ảnh sản phẩm'}
          className='w-full h-full object-contain'
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = placeholder
          }}
        />
      </div>

      {/* ── Thumbnails row ── */}
      {allImages.length > 1 && (
        <div className='flex gap-2'>
          {visibleThumbs.map((img) => (
            <button
              key={img.id}
              onClick={() => setActiveImage(img.imageUrl)}
              className={`w-[60px] h-[72px] flex-shrink-0 rounded border-2 overflow-hidden bg-white p-0.5 transition-all ${
                activeImage === img.imageUrl
                  ? 'border-[#c92127]'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img
                src={img.imageUrl}
                alt={title}
                className='w-full h-full object-contain'
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = placeholder
                }}
              />
            </button>
          ))}

          {extraCount > 0 && (
            <div className='w-[60px] h-[72px] flex-shrink-0 rounded border-2 border-gray-300 bg-gray-800 flex flex-col items-center justify-center gap-1 text-white'>
              <Images className='w-4 h-4' />
              <span className='text-[11px] font-semibold'>+{extraCount}</span>
            </div>
          )}
        </div>
      )}

      {/* ── CTA Buttons ── */}
      <div className='flex gap-2 mt-1'>
        <Button
          variant='outline'
          disabled={isOutOfStock}
          onClick={onAddToCart}
          className='flex-1 h-11 border-2 border-brand-green text-brand-green hover:bg-brand-green hover:text-white font-semibold gap-2 rounded-sm text-sm transition-all duration-200'
        >
          <ShoppingCart className='w-4 h-4' />
          {t('product.addToCart')}
        </Button>
        <Button
          disabled={isOutOfStock}
          onClick={onBuyNow}
          className='flex-1 h-11 bg-brand-red hover:bg-brand-red/90 text-white font-semibold rounded-sm text-sm transition-all duration-300 ease-in-out active:scale-95'
        >
          {t('product.buyNow')}
        </Button>
      </div>

      {/* ── Policy list ── */}
      <div className='border border-gray-200 rounded overflow-hidden'>
        <p className='text-xs font-bold text-gray-800 px-3 py-2.5 border-b border-gray-200 bg-gray-50'>
          Chính sách ưu đãi của ZenBook
        </p>
        {POLICY_ITEMS.map((item) => (
          <div
            key={item.label}
            className='flex items-center justify-between px-3 py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer group transition-colors'
          >
            <div className='flex items-center gap-2.5'>
              <span className='text-sm leading-none'>{item.icon}</span>
              <p className='text-xs text-gray-700'>
                <span className='font-semibold'>{item.label}</span>
                {': '}
                <span className='text-gray-500'>{item.value}</span>
              </p>
            </div>
            <span className='text-gray-300 group-hover:text-gray-500 transition-colors text-base leading-none'>
              ›
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
