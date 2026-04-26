import { useState } from 'react'
import { MessageSquarePlus, SlidersHorizontal, Image as ImageIcon, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ReviewCard } from './ReviewCard'
import { RatingStatsBar } from './RatingStats'
import { ReviewFormModal } from './ReviewFormModal'

import { useBookReviews, useReviewStats } from '@/services/review/Usereview'

import type { ReviewResponse, ReviewCustomerFilter } from '@/services/review/review.type'

interface ReviewListProps {
  productId: string
  orderDetailId?: string
  canReview?: boolean
  currentUserId?: string
  book?: {
    id: string
    title: string
    image?: string
  }
}

type SortOption = 'newest' | 'helpful'

export function ReviewList({
  productId,
  orderDetailId,
  canReview,
  currentUserId,
  book
}: ReviewListProps) {
  const [page, setPage] = useState(0)
  const [ratingFilter, setRatingFilter] = useState<number>()
  const [hasImageFilter, setHasImageFilter] = useState(false)
  const [sortBy, setSort] = useState<SortOption>('newest')

  const [formOpen, setFormOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<ReviewResponse>()

  const params: ReviewCustomerFilter = {
    rating: ratingFilter,
    hasImage: hasImageFilter || undefined,
    sortBy
  }

  const { data: reviewPage, isLoading, isFetching } = useBookReviews(productId, params)

  const { data: stats } = useReviewStats(productId)

  const handleRatingFilter = (rating?: number) => {
    setRatingFilter(rating)
    setPage(0)
  }

  const handleSort = (value: SortOption) => {
    setSort(value)
    setPage(0)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)

    document.getElementById('review-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  const openEdit = (review: ReviewResponse) => {
    setEditingReview(review)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingReview(undefined)
  }

  return (
    <section id='review-section' className='flex flex-col gap-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-[15px] font-black uppercase tracking-wide text-slate-900'>
          Đánh giá sản phẩm
        </h2>

        {canReview && (
          <Button
            size='sm'
            onClick={() => setFormOpen(true)}
            className='h-9 rounded-xl bg-brand-green px-4 text-[12.5px] font-bold text-white shadow-sm transition-all hover:bg-brand-green-dark active:scale-95'
          >
            <MessageSquarePlus className='mr-1.5 h-3.5 w-3.5' />
            Viết đánh giá
          </Button>
        )}
      </div>

      {/* Stats */}
      {isLoading ? (
        <Skeleton className='h-28 w-full rounded-2xl' />
      ) : stats ? (
        <RatingStatsBar
          stats={stats}
          activeFilter={ratingFilter ?? null}
          onFilter={(v) => handleRatingFilter(v ?? undefined)}
        />
      ) : null}

      {/* Filter */}
      <div className='flex flex-wrap items-center gap-2'>
        <button
          onClick={() => handleSort('newest')}
          className={`rounded-xl px-3 py-1.5 text-[11.5px] font-bold transition ${
            sortBy === 'newest'
              ? 'bg-brand-green text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Mới nhất
        </button>

        <button
          onClick={() => handleSort('helpful')}
          className={`rounded-xl px-3 py-1.5 text-[11.5px] font-bold transition ${
            sortBy === 'helpful'
              ? 'bg-brand-green text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Hữu ích nhất
        </button>

        <button
          onClick={() => {
            setHasImageFilter((prev) => !prev)
            setPage(0)
          }}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11.5px] font-bold transition ${
            hasImageFilter
              ? 'border-brand-green bg-brand-green/10 text-brand-green'
              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <ImageIcon className='h-3.5 w-3.5' />
          Có ảnh
        </button>

        {(ratingFilter || hasImageFilter) && (
          <button
            onClick={() => {
              setRatingFilter(undefined)
              setHasImageFilter(false)
              setPage(0)
            }}
            className='px-2 text-[11.5px] font-bold text-rose-500 hover:underline'
          >
            Xoá bộ lọc
          </button>
        )}

        {isFetching && !isLoading && (
          <Loader2 className='ml-auto h-4 w-4 animate-spin text-slate-400' />
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className='space-y-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className='h-32 rounded-2xl' />
          ))}
        </div>
      ) : !reviewPage?.content?.length ? (
        <div className='flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center'>
          <SlidersHorizontal className='h-7 w-7 text-slate-300' />
          <p className='text-[13px] font-bold text-slate-600'>Chưa có đánh giá nào</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {reviewPage.content.map((review) => (
            <ReviewCard
              key={review.id}
              bookId={productId}
              review={review}
              currentUserId={currentUserId}
              onEdit={openEdit}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {reviewPage && reviewPage.totalPages > 1 && (
        <div className='flex justify-center gap-1'>
          {Array.from({
            length: reviewPage.totalPages
          }).map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`h-8 w-8 rounded-xl text-[12px] font-bold transition ${
                page === i
                  ? 'bg-brand-green text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <ReviewFormModal
        open={formOpen}
        onClose={closeForm}
        productId={productId}
        orderDetailId={orderDetailId!}
        existing={editingReview}
        book={book}
      />
    </section>
  )
}
