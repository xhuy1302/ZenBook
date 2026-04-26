'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Star,
  MessageCircle,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Store
} from 'lucide-react'

import {
  getCustomerReviewsApi,
  getReviewStatsApi,
  toggleHelpfulVoteApi
} from '@/services/review/review.api'
import type { PageResponse, ReviewResponse } from '@/services/review/review.type'

interface ProductReviewsProps {
  bookId: string
  currentUserId?: string
}

type SortMode = 'newest' | 'helpful'

interface LightboxData {
  images: { id: string; imageUrl: string }[]
  currentIndex: number
}

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'

  return (
    <div className='flex gap-0.5'>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${cls} ${
            i < Math.floor(rating)
              ? 'text-yellow-500 fill-yellow-500'
              : 'text-gray-200 fill-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export default function ProductReviews({ bookId, currentUserId }: ProductReviewsProps) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  const [page, setPage] = useState(0)
  const [sort, setSort] = useState<SortMode>('newest')
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [hasImage, setHasImage] = useState(false)
  const [lightbox, setLightbox] = useState<LightboxData | null>(null)

  const limit = 5

  const filterParams = useMemo(
    () => ({
      sortBy: sort,
      rating: ratingFilter ?? undefined,
      hasImage: hasImage || undefined,
      page,
      size: limit
    }),
    [sort, ratingFilter, hasImage, page]
  )

  // Stats
  const { data: stats } = useQuery({
    queryKey: ['review-stats', bookId],
    queryFn: () => getReviewStatsApi(bookId),
    enabled: !!bookId
  })

  // Reviews
  const { data: reviewPage, isLoading } = useQuery({
    queryKey: ['reviews', bookId, filterParams],
    queryFn: () => getCustomerReviewsApi(bookId, filterParams),
    enabled: !!bookId
  })

  // Helpful vote (Tích hợp Optimistic Update để đổi màu NGAY LẬP TỨC)

  const { mutate: toggleHelpful, isPending: helpfulLoading } = useMutation({
    mutationFn: toggleHelpfulVoteApi,

    onMutate: async (reviewId: string) => {
      const queryKey = ['reviews', bookId, filterParams]

      await queryClient.cancelQueries({
        queryKey
      })

      const previous = queryClient.getQueryData<PageResponse<ReviewResponse>>(queryKey)

      queryClient.setQueryData<PageResponse<ReviewResponse>>(queryKey, (old) => {
        if (!old) return old

        return {
          ...old,
          content: old.content.map((review) => {
            if (review.id !== reviewId) return review

            const liked = !review.isHelpfulByMe

            return {
              ...review,
              isHelpfulByMe: liked,
              helpfulVotes: liked ? review.helpfulVotes + 1 : Math.max(0, review.helpfulVotes - 1)
            }
          })
        }
      })

      return { previous, queryKey }
    },

    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous)
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['reviews', bookId]
      })

      queryClient.invalidateQueries({
        queryKey: ['review-stats', bookId]
      })
    }
  })

  const handleFilterRating = (star: number) => {
    setRatingFilter((prev) => (prev === star ? null : star))
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

  const averageRating = stats?.average ?? 0
  const totalReviews = stats?.count ?? 0

  return (
    <div id='reviews' className='flex flex-col gap-6 scroll-mt-20'>
      <h2 className='text-base font-bold text-gray-900 uppercase tracking-wide'>
        Đánh giá sản phẩm
      </h2>

      {/* STATS */}
      <div className='flex flex-col md:flex-row gap-6 items-start md:items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100'>
        <div className='flex flex-col items-center shrink-0 md:w-32 md:border-r border-gray-200 md:pr-6'>
          <span className='text-5xl font-black text-[#c92127]'>
            {averageRating > 0 ? averageRating.toFixed(1) : '0'}
            <span className='text-2xl text-gray-400'>/5</span>
          </span>

          <div className='mt-1 mb-2'>
            {/* Sử dụng component Star nội bộ (nếu cần đổi sang sao vàng thì sửa ở hàm StarRow) */}
            <div className='flex gap-0.5 text-amber-400'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(averageRating) ? 'fill-current' : 'text-gray-200 fill-gray-200'}`}
                />
              ))}
            </div>
          </div>

          <span className='text-xs font-medium text-gray-500'>{totalReviews} đánh giá</span>
        </div>

        {/* Breakdown */}
        <div className='flex flex-col gap-1.5 flex-1 w-full min-w-0'>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats?.breakdown?.[star] ?? 0
            const total = totalReviews || 1
            const pct = Math.round((count / total) * 100)
            const isActive = ratingFilter === star

            return (
              <button
                key={star}
                onClick={() => handleFilterRating(star)}
                className={`flex items-center gap-2 text-xs transition-colors p-1 rounded-lg ${
                  isActive ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <span className='w-10 text-right shrink-0 font-medium'>{star} sao</span>

                <div className='flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden'>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isActive ? 'bg-[#c92127]' : 'bg-amber-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <span className='w-8 text-right font-medium text-gray-400'>{count}</span>
              </button>
            )
          })}
        </div>

        {!currentUserId && (
          <div className='text-[13px] text-gray-500 md:max-w-[200px] shrink-0 bg-white p-3 rounded-xl border border-gray-100 shadow-sm'>
            Chỉ có thành viên mới có thể viết và tương tác với nhận xét. Vui lòng{' '}
            <Link to='/login' className='text-[#c92127] font-bold hover:underline'>
              đăng nhập
            </Link>{' '}
            hoặc{' '}
            <Link to='/register' className='text-[#c92127] font-bold hover:underline'>
              đăng ký
            </Link>
            .
          </div>
        )}
      </div>

      {/* FILTER */}
      {totalReviews > 0 && (
        <div className='flex flex-wrap items-center gap-3 border-b border-gray-200 pb-2'>
          <span className='text-sm text-gray-500 mr-2'>Lọc theo:</span>

          <button
            onClick={() => {
              setSort('newest')
              setPage(0)
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              sort === 'newest'
                ? 'bg-[#c92127] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Mới nhất
          </button>

          <button
            onClick={() => {
              setSort('helpful')
              setPage(0)
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              sort === 'helpful'
                ? 'bg-[#c92127] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Hữu ích nhất
          </button>

          <button
            onClick={() => {
              setHasImage(!hasImage)
              setPage(0)
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-colors border ${
              hasImage
                ? 'border-[#c92127] bg-red-50 text-[#c92127]'
                : 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ImageIcon className='w-3.5 h-3.5' /> Có hình ảnh
          </button>
        </div>
      )}

      {/* REVIEW LIST */}
      {isLoading ? (
        <div className='flex flex-col gap-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-40 bg-gray-100 animate-pulse rounded-2xl' />
          ))}
        </div>
      ) : !reviewPage?.content?.length ? (
        <div className='py-12 text-center flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200'>
          <MessageCircle className='w-10 h-10 text-gray-300 mb-2' />
          <p className='text-sm text-gray-500 font-medium'>
            Không tìm thấy đánh giá nào phù hợp với bộ lọc.
          </p>
        </div>
      ) : (
        <>
          <div className='flex flex-col gap-4'>
            {reviewPage.content.map((review) => (
              // BỐ CỤC MỚI: Card bo góc 16px, viền nhạt
              <div
                key={review.id}
                className='p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3'
              >
                {/* 1. Header: User Info & Stars */}
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full overflow-hidden bg-sky-500 flex items-center justify-center text-white font-bold shrink-0'>
                      {review.userAvatar ? (
                        <img
                          src={review.userAvatar}
                          alt={review.userName}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        review.userName.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className='text-sm font-bold text-slate-900'>{review.userName}</p>
                      <p className='text-[11px] text-slate-500'>{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <StarRow rating={review.rating} />
                </div>

                {/* 2. Content */}
                {review.content && (
                  <p className='text-[14px] text-slate-800 leading-relaxed whitespace-pre-wrap mt-1'>
                    {review.content}
                  </p>
                )}

                {/* 3. Images */}
                {review.images && review.images.length > 0 && (
                  <div className='flex flex-wrap gap-2 mt-1'>
                    {review.images.map((img, idx) => {
                      const isVideo = img.imageUrl.match(/\.(mp4|webm|mov|ogg)$/i)
                      return (
                        <div
                          key={img.id}
                          className='relative group w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer hover:border-slate-400 transition-all'
                          onClick={() => setLightbox({ images: review.images, currentIndex: idx })}
                        >
                          {isVideo ? (
                            <>
                              <video
                                src={img.imageUrl}
                                className='w-full h-full object-cover'
                                preload='metadata'
                              />
                              <div className='absolute inset-0 bg-black/20 flex items-center justify-center'>
                                <div className='w-6 h-6 rounded-full bg-white/80 flex items-center justify-center pl-0.5'>
                                  <div className='w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-transparent border-l-slate-800'></div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <img
                              src={img.imageUrl}
                              alt='Review attachment'
                              className='w-full h-full object-cover hover:scale-110 transition-transform duration-300'
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* 4. Shop Reply (Giao diện chuẩn theo ảnh) */}
                {review.reply && (
                  <div className='mt-2 bg-[#edf3ff] border border-[#d1e0ff] rounded-xl p-4'>
                    <div className='flex items-center gap-2 mb-1.5'>
                      <Store className='w-4 h-4 text-[#3b71e1]' />
                      <p className='text-[13px] font-bold text-[#3b71e1]'>Phản hồi từ cửa hàng</p>
                    </div>
                    <p className='text-[13px] text-[#2c52a0] leading-relaxed'>
                      {review.reply.content}
                    </p>
                  </div>
                )}

                <hr className='border-slate-100 my-1' />

                {/* 5. Footer Actions (Giống ảnh thiết kế) */}
                <div className='flex items-center justify-between'>
                  {/* Cột trái: Nút hữu ích */}
                  <button
                    disabled={helpfulLoading}
                    onClick={() => {
                      if (!currentUserId) {
                        alert('Vui lòng đăng nhập để đánh giá hữu ích!')
                        return
                      }

                      if (helpfulLoading) return

                      toggleHelpful(review.id)
                    }}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                      review.isHelpfulByMe
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    👍 Hữu ích ({review.helpfulVotes})
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Phân trang */}
          {reviewPage.totalPages > 1 && (
            <div className='flex items-center justify-center gap-2 pt-4 border-t border-gray-100 mt-2'>
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>

              {Array.from({ length: reviewPage.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 rounded-full text-sm font-bold ${
                    page === i ? 'bg-[#c92127] text-white' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={page >= reviewPage.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          )}
        </>
      )}

      {/* LIGHTBOX OVERLAY */}
      {lightbox && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm'
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
                className='absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all'
                onClick={handlePrevMedia}
              >
                <ChevronLeft className='w-8 h-8' />
              </button>

              <button
                className='absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all'
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
                  alt='Review full preview'
                  className='max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none'
                />
              )
            })()}
          </div>

          <div className='absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium tracking-widest'>
            {lightbox.currentIndex + 1} / {lightbox.images.length}
          </div>
        </div>
      )}
    </div>
  )
}
