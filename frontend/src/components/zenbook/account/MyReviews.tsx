'use client'

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Star,
  Edit2,
  Trash2,
  PackageSearch,
  ThumbsUp,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Store,
  X
} from 'lucide-react'

// 👉 IMPORT THÊM USEAUTH ĐỂ LẤY TÊN USER
import { useAuth } from '@/context/AuthContext'

import {
  getMyReviewsApi,
  deleteCustomerReviewApi,
  updateCustomerReviewApi
} from '@/services/review/review.api'

interface LightboxData {
  images: { id: string; imageUrl: string }[]
  currentIndex: number
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function StarRating({
  value,
  interactive = false,
  onChange
}: {
  value: number
  interactive?: boolean
  onChange?: (v: number) => void
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  return (
    <div className='flex items-center gap-0.5'>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 transition-colors ${
            s <= (hovered ?? value)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-transparent text-muted-foreground/30'
          } ${interactive ? 'cursor-pointer' : ''}`}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(null)}
          onClick={() => interactive && onChange?.(s)}
        />
      ))}
    </div>
  )
}

function StatusBadge({ status, t }: { status: string; t: any }) {
  const isApproved = status.toUpperCase() === 'APPROVED'
  return isApproved ? (
    <span className='inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100'>
      <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block' />
      {t('reviews.tabs.approved')}
    </span>
  ) : (
    <span className='inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100'>
      <span className='w-1.5 h-1.5 rounded-full bg-amber-400 inline-block' />
      {t('reviews.tabs.pending')}
    </span>
  )
}

// Truyền thêm prop currentUser vào
function ReviewCard({ review, onEdit, onDelete, isDeleting, onOpenLightbox, t, currentUser }: any) {
  const productUrl = `/products/${review.bookSlug || review.bookId}`

  return (
    <div className='rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md group flex flex-col gap-4'>
      {/* 👉 THÊM KHỐI HEADER: TÊN USER & NGÀY ĐÁNH GIÁ GIỐNG GIAO DIỆN MẪU */}
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-full overflow-hidden bg-sky-500 flex items-center justify-center text-white font-bold shrink-0 shadow-sm'>
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className='w-full h-full object-cover'
              />
            ) : (
              (currentUser?.username || 'U').substring(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <p className='text-sm font-bold text-slate-900'>
              {currentUser?.username || 'Khách hàng'}
            </p>
            <p className='text-[11px] text-slate-500 font-medium'>{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <div className='flex flex-col items-end gap-1.5'>
          <StarRating value={review.rating} />
          <StatusBadge status={review.status} t={t} />
        </div>
      </div>

      <div className='w-full h-[1px] bg-slate-100' />

      {/* Thông tin Sách */}
      <div className='flex gap-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100'>
        <Link to={productUrl} className='relative shrink-0 block'>
          <img
            src={review.bookThumbnail || '/placeholder.jpg'}
            alt={review.bookTitle || 'Product'}
            className='w-14 h-14 rounded-lg object-cover border border-slate-200 bg-white p-1 mix-blend-multiply hover:scale-105 transition-transform'
          />
        </Link>
        <div className='flex-1 min-w-0 flex flex-col justify-center'>
          <Link
            to={productUrl}
            className='text-[13.5px] font-bold text-slate-800 line-clamp-2 leading-snug hover:text-brand-green transition-colors'
          >
            {review.bookTitle || 'Đang tải tên sản phẩm...'}
          </Link>
          <p className='text-[11px] text-slate-500 mt-1 font-medium'>
            {t('reviews.orderCode')}:{' '}
            <span className='text-slate-700'>{review.orderCode || 'N/A'}</span>
          </p>
        </div>
      </div>

      {/* Nội dung Review */}
      {review.content && (
        <p className='text-[13.5px] text-slate-700 leading-relaxed whitespace-pre-wrap pl-1'>
          {review.content}
        </p>
      )}

      {/* Hình ảnh */}
      {review.images && review.images.length > 0 && (
        <div className='flex flex-wrap gap-2 mt-1'>
          {review.images.map((img: any, idx: number) => {
            const isVideo = img.imageUrl.match(/\.(mp4|webm|mov|ogg)$/i)
            return (
              <div
                key={img.id}
                className='w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative group/media cursor-pointer hover:border-brand-green transition-all shadow-sm'
                onClick={() => onOpenLightbox({ images: review.images, currentIndex: idx })}
              >
                {isVideo ? (
                  <>
                    <video src={img.imageUrl} className='w-full h-full object-cover' />
                    <div className='absolute inset-0 bg-black/20 flex items-center justify-center group-hover/media:bg-black/10 transition-colors'>
                      <div className='w-6 h-6 rounded-full bg-white/80 flex items-center justify-center pl-0.5'>
                        <div className='w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-transparent border-l-slate-800' />
                      </div>
                    </div>
                  </>
                ) : (
                  <img
                    src={img.imageUrl}
                    alt='Review media'
                    className='w-full h-full object-cover hover:scale-110 transition-transform duration-500'
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Shop Reply */}
      {review.reply && (
        <div className='mt-1 bg-blue-50/50 border border-blue-100 rounded-xl p-4 ml-2 border-l-4 border-l-blue-500'>
          <div className='flex items-center gap-1.5 mb-1.5'>
            <Store className='w-3.5 h-3.5 text-blue-600' />
            <p className='text-[12px] font-black text-blue-700 uppercase tracking-wide'>
              {t('reviews.shopReply')}
            </p>
          </div>
          <p className='text-[13px] text-slate-700 leading-relaxed italic'>
            "{review.reply.content}"
          </p>
        </div>
      )}

      {/* Footer */}
      <div className='flex items-center justify-between pt-3 border-t border-slate-100 mt-1'>
        <div className='flex items-center gap-1.5 text-[11.5px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200'>
          <ThumbsUp className='w-3.5 h-3.5 text-amber-500' />
          <span>
            {review.helpfulVotes || 0} {t('reviews.helpfulCount')}
          </span>
        </div>
        <div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
          <button
            onClick={() => onEdit(review)}
            className='flex items-center gap-1 text-[12px] font-bold text-brand-green hover:bg-brand-green/10 px-3 py-1.5 rounded-lg transition-colors'
          >
            <Edit2 className='w-3.5 h-3.5' />
            {t('reviews.edit')}
          </button>
          <button
            onClick={() => {
              if (window.confirm(t('reviews.confirmDelete'))) {
                onDelete(review.id)
              }
            }}
            disabled={isDeleting}
            className='flex items-center gap-1 text-[12px] font-bold text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50'
          >
            {isDeleting ? (
              <Loader2 className='w-3.5 h-3.5 animate-spin' />
            ) : (
              <Trash2 className='w-3.5 h-3.5' />
            )}
            {t('reviews.delete')}
          </button>
        </div>
      </div>
    </div>
  )
}

function EditModal({ review, onClose, onSave, isSaving, t }: any) {
  const [rating, setRating] = useState(review.rating)
  const [content, setContent] = useState(review.content || '')

  return (
    <div className='fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4'>
      <div className='bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95'>
        <h3 className='font-semibold text-lg text-foreground mb-1'>{t('reviews.editTitle')}</h3>
        <p className='text-sm text-muted-foreground mb-5 line-clamp-1'>{review.bookTitle}</p>

        <div className='mb-4'>
          <label className='text-[13px] font-bold text-slate-700 block mb-2'>
            {t('reviews.ratingLabel')} <span className='text-rose-500'>*</span>
          </label>
          <div className='flex items-center gap-1'>
            <StarRating value={rating} interactive onChange={setRating} />
            <span className='ml-2 text-[13px] font-bold text-amber-500'>{rating}/5</span>
          </div>
        </div>

        <div className='mb-5'>
          <label className='text-[13px] font-bold text-slate-700 block mb-2'>
            {t('reviews.contentLabel')}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className='w-full rounded-xl border border-slate-200 bg-slate-50 text-[13px] text-slate-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:bg-white resize-none placeholder:text-slate-400 transition-all'
            placeholder={t('reviews.contentPlaceholder')}
          />
        </div>

        <div className='flex gap-3'>
          <button
            onClick={onClose}
            disabled={isSaving}
            className='flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50'
          >
            {t('reviews.cancel')}
          </button>
          <button
            onClick={() => onSave({ reviewId: review.id, payload: { rating, content } })}
            disabled={isSaving || rating === 0}
            className='flex-1 py-2.5 rounded-xl bg-brand-green text-white text-[13px] font-bold hover:bg-brand-green/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm'
          >
            {isSaving && <Loader2 className='w-4 h-4 animate-spin' />}
            {t('reviews.save')}
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ t }: { t: any }) {
  return (
    <div className='flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed'>
      <div className='w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center mb-4'>
        <PackageSearch className='w-7 h-7 text-brand-green/60' />
      </div>
      <h3 className='font-bold text-[15px] text-slate-800 mb-1.5'>{t('reviews.emptyTitle')}</h3>
      <p className='text-[13px] text-slate-500 max-w-xs leading-relaxed'>
        {t('reviews.emptySubtitle')}
      </p>
    </div>
  )
}

export default function MyReviews() {
  const { t } = useTranslation('account')
  const { user: currentUser } = useAuth() // 👉 DÙNG HOOK ĐỂ LẤY USER ĐANG ĐĂNG NHẬP
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(0)
  const [editTarget, setEditTarget] = useState<any>(null)
  const [lightbox, setLightbox] = useState<LightboxData | null>(null)

  const TABS = [
    { key: 'all', label: t('reviews.tabs.all') },
    { key: 'approved', label: t('reviews.tabs.approved') },
    { key: 'pending', label: t('reviews.tabs.pending') }
  ]

  const { data: reviewPage, isLoading } = useQuery({
    queryKey: ['my-reviews', activeTab, page],
    queryFn: () =>
      getMyReviewsApi({
        status: activeTab === 'all' ? undefined : (activeTab.toUpperCase() as any),
        page,
        size: 5
      })
  })

  const { mutate: deleteReview, isPending: isDeleting } = useMutation({
    mutationFn: deleteCustomerReviewApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] })
    }
  })

  const { mutate: updateReview, isPending: isUpdating } = useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: any }) =>
      updateCustomerReviewApi(reviewId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] })
      setEditTarget(null)
    }
  })

  const handleTabChange = (key: string) => {
    setActiveTab(key)
    setPage(0)
  }

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!lightbox) return
    setLightbox({
      ...lightbox,
      currentIndex: (lightbox.currentIndex - 1 + lightbox.images.length) % lightbox.images.length
    })
  }

  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!lightbox) return
    setLightbox({
      ...lightbox,
      currentIndex: (lightbox.currentIndex + 1) % lightbox.images.length
    })
  }

  const reviews = reviewPage?.content || []
  const totalElements = reviewPage?.totalElements || 0
  const totalPages = reviewPage?.totalPages || 0

  return (
    <div className='flex-1 min-w-0'>
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
              {t('reviews.title')}
            </h1>
            <p className='text-[13px] text-slate-500 font-medium mt-1'>{t('reviews.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className='flex items-center gap-1 p-1.5 bg-slate-50 rounded-xl border border-slate-100 mb-6 w-fit'>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-brand-green shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className='flex items-center justify-center py-20'>
          <Loader2 className='w-8 h-8 animate-spin text-brand-green' />
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState t={t} />
      ) : (
        <div className='flex flex-col gap-5'>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={setEditTarget}
              onDelete={deleteReview}
              isDeleting={isDeleting}
              onOpenLightbox={setLightbox}
              t={t}
              currentUser={currentUser} // 👉 Truyền user xuống Card để render Header Avatar
            />
          ))}

          {totalPages > 1 && (
            <div className='flex items-center justify-center gap-2 pt-6'>
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className='w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition-colors border border-slate-200'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
              <span className='text-[13px] font-bold text-slate-600 mx-3'>
                {page + 1} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className='w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition-colors border border-slate-200'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          )}
        </div>
      )}

      {editTarget && (
        <EditModal
          review={editTarget}
          onClose={() => !isUpdating && setEditTarget(null)}
          onSave={updateReview}
          isSaving={isUpdating}
          t={t}
        />
      )}

      {lightbox && (
        <div
          className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm'
          onClick={() => setLightbox(null)}
        >
          <button
            className='absolute top-4 right-4 text-white/70 hover:text-white p-2 transition-colors'
            onClick={() => setLightbox(null)}
          >
            <X className='w-8 h-8' />
          </button>

          {lightbox.images.length > 1 && (
            <>
              <button
                className='absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all z-10'
                onClick={handlePrevMedia}
              >
                <ChevronLeft className='w-8 h-8' />
              </button>

              <button
                className='absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all z-10'
                onClick={handleNextMedia}
              >
                <ChevronRight className='w-8 h-8' />
              </button>
            </>
          )}

          <div
            className='relative max-w-5xl max-h-[85vh] w-full px-16 flex items-center justify-center'
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const currentMedia = lightbox.images[lightbox.currentIndex]
              const isVideo = currentMedia.imageUrl.match(/\.(mp4|webm|mov|ogg)$/i)

              if (isVideo) {
                return (
                  <video
                    src={currentMedia.imageUrl}
                    controls
                    autoPlay
                    className='max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl'
                  />
                )
              }

              return (
                <img
                  src={currentMedia.imageUrl}
                  alt='Review media'
                  className='max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none'
                />
              )
            })()}
          </div>

          <div className='absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium tracking-widest bg-black/50 px-4 py-1 rounded-full'>
            {lightbox.currentIndex + 1} / {lightbox.images.length}
          </div>
        </div>
      )}
    </div>
  )
}
