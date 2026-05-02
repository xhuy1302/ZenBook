import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom' // 👉 IMPORT THÊM createPortal
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Images, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BookResponse } from '@/services/book/book.type'

interface InternalImage {
  id: string
  imageUrl: string
}

interface ProductGalleryProps {
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

const MAX_VISIBLE_THUMBS = 3

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

  const formattedImages: InternalImage[] = images.map((img, idx) => {
    if (typeof img === 'string') return { id: `img-${idx}`, imageUrl: img }
    return img as InternalImage
  })

  const allImages: InternalImage[] = [
    ...(thumbnail ? [{ id: 'thumb', imageUrl: thumbnail }] : []),
    ...formattedImages
  ]

  const [activeImage, setActiveImage] = useState<string>(allImages[0]?.imageUrl ?? placeholder)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const visibleThumbs = allImages.slice(0, MAX_VISIBLE_THUMBS)
  const extraCount = allImages.length - MAX_VISIBLE_THUMBS

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setIsLightboxOpen(true)
  }

  const closeLightbox = () => setIsLightboxOpen(false)

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setLightboxIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  // Hỗ trợ phím mũi tên và ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen])

  // Khóa cuộn chuột khi mở Lightbox
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isLightboxOpen])

  // 👉 Tách riêng phần giao diện của Lightbox ra để dùng trong Portal
  const lightboxContent = isLightboxOpen ? (
    <div
      className='fixed inset-0 z-[999999] bg-black/95 flex items-center justify-center p-4 select-none backdrop-blur-sm'
      onClick={closeLightbox}
    >
      <button
        onClick={closeLightbox}
        className='absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-white transition-colors z-50 p-2'
      >
        <X className='w-8 h-8 md:w-10 md:h-10' />
      </button>

      {allImages.length > 1 && (
        <button
          onClick={prevImage}
          className='absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-50 p-2'
        >
          <ChevronLeft className='w-10 h-10 md:w-14 md:h-14' />
        </button>
      )}

      <div
        className='relative max-w-6xl w-full h-full flex items-center justify-center'
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={allImages[lightboxIndex]?.imageUrl}
          alt='Phóng to'
          className='max-w-full max-h-[90vh] object-contain drop-shadow-2xl'
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = placeholder
          }}
        />
        <div className='absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/60 px-4 py-1.5 rounded-full text-sm font-medium tracking-widest'>
          {lightboxIndex + 1} / {allImages.length}
        </div>
      </div>

      {allImages.length > 1 && (
        <button
          onClick={nextImage}
          className='absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-50 p-2'
        >
          <ChevronRight className='w-10 h-10 md:w-14 md:h-14' />
        </button>
      )}
    </div>
  ) : null

  return (
    <>
      <div className='flex flex-col gap-3'>
        {/* ── Main image ── */}
        <div
          className='w-full aspect-[3/4] bg-white rounded border border-gray-200 overflow-hidden flex items-center justify-center p-4 cursor-pointer hover:opacity-95 transition-opacity'
          onClick={() => {
            const currentIndex = allImages.findIndex((img) => img.imageUrl === activeImage)
            openLightbox(Math.max(0, currentIndex))
          }}
        >
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
          <div className='flex gap-5'>
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
              <button
                onClick={() => openLightbox(MAX_VISIBLE_THUMBS)}
                className='w-[60px] h-[72px] flex-shrink-0 rounded border-2 border-gray-300 bg-gray-800 hover:bg-gray-700 flex flex-col items-center justify-center gap-1 text-white transition-colors cursor-pointer'
              >
                <Images className='w-4 h-4' />
                <span className='text-[11px] font-semibold'>+{extraCount}</span>
              </button>
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

      {/* 👉 Dùng Portal Render trực tiếp vào body để giải quyết triệt để lỗi bị Header đè */}
      {isLightboxOpen && typeof document !== 'undefined'
        ? createPortal(lightboxContent, document.body)
        : null}
    </>
  )
}
