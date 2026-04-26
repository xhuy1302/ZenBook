// ============================================================
// ReviewCard.tsx
// ============================================================
import { useState } from 'react'
import { ThumbsUp, ChevronDown, ChevronUp, Pencil, Trash2, Store } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { StarRating } from './StarRating'

import { useToggleHelpful, useDeleteReview } from '@/services/review/Usereview'

import type { ReviewResponse } from '@/services/review/review.type'

interface ReviewCardProps {
  bookId: string
  review: ReviewResponse
  currentUserId?: string
  onEdit?: (review: ReviewResponse) => void
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function ReviewCard({ bookId, review, currentUserId, onEdit }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const { mutate: toggleHelpful, isPending: votingHelpful } = useToggleHelpful(bookId)

  const { mutate: deleteReview, isPending: deleting } = useDeleteReview(bookId)

  const isOwner = currentUserId === review.userId

  const content = review.content || ''
  const isLong = content.length > 180

  return (
    <>
      <div className='flex flex-col gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group'>
        {/* Header */}
        <div className='flex items-start justify-between gap-2'>
          <div className='flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-full bg-gradient-to-br from-brand-green/30 to-brand-green/60 flex items-center justify-center shrink-0 text-[13px] font-black text-white shadow-sm overflow-hidden'>
              {review.userAvatar ? (
                <img
                  src={review.userAvatar}
                  alt={review.userName}
                  className='w-full h-full object-cover'
                />
              ) : (
                (review.userName?.[0] || 'U').toUpperCase()
              )}
            </div>

            <div>
              <p className='text-[12.5px] font-bold text-slate-800'>{review.userName}</p>
              <p className='text-[11px] text-slate-400'>{formatDate(review.createdAt)}</p>
            </div>
          </div>

          <StarRating value={review.rating} readonly size='sm' />
        </div>

        {/* Content */}
        {content && (
          <div>
            <p
              className={cn(
                'text-[13px] text-slate-700 leading-relaxed transition-all duration-300',
                !expanded && isLong && 'line-clamp-3'
              )}
            >
              {content}
            </p>

            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className='mt-1 text-[11.5px] font-bold text-brand-green flex items-center gap-1 hover:underline'
              >
                {expanded ? (
                  <>
                    <ChevronUp className='w-3 h-3' />
                    Thu gọn
                  </>
                ) : (
                  <>
                    <ChevronDown className='w-3 h-3' />
                    Xem thêm
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Images */}
        {!!review.images?.length && (
          <div className='flex flex-wrap gap-1.5'>
            {review.images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setLightbox(img.imageUrl)}
                className='w-14 h-14 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 hover:border-brand-green transition-all hover:scale-105'
              >
                <img
                  src={img.imageUrl}
                  alt={`ảnh ${i + 1}`}
                  className='w-full h-full object-cover'
                />
              </button>
            ))}
          </div>
        )}

        {/* Reply */}
        {review.reply && (
          <div className='flex gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100'>
            <Store className='w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5' />

            <div>
              <p className='text-[11.5px] font-bold text-blue-700 mb-0.5'>Phản hồi từ cửa hàng</p>

              <p className='text-[12px] text-blue-600 leading-relaxed'>{review.reply.content}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className='flex items-center justify-between pt-1 border-t border-slate-50 mt-0.5'>
          <button
            onClick={() => toggleHelpful(review.id)}
            disabled={votingHelpful}
            className={cn(
              'flex items-center gap-1.5 text-[11.5px] font-bold px-2.5 py-1 rounded-lg transition-all active:scale-95',
              review.isHelpfulByMe
                ? 'text-brand-green bg-brand-green/10'
                : 'text-slate-400 hover:text-brand-green hover:bg-brand-green/5'
            )}
          >
            <ThumbsUp className={cn('w-3.5 h-3.5', review.isHelpfulByMe && 'fill-brand-green')} />
            Hữu ích ({review.helpfulVotes})
          </button>

          {isOwner && (
            <div className='flex items-center gap-1'>
              <Button
                size='sm'
                variant='ghost'
                className='h-7 px-2 text-[11px]'
                onClick={() => onEdit?.(review)}
              >
                <Pencil className='w-3 h-3 mr-1' />
                Sửa
              </Button>

              <Button
                size='sm'
                variant='ghost'
                className='h-7 px-2 text-[11px] text-rose-500'
                disabled={deleting}
                onClick={() => {
                  if (confirm('Xóa đánh giá này?')) {
                    deleteReview(review.id)
                  }
                }}
              >
                <Trash2 className='w-3 h-3 mr-1' />
                Xóa
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className='fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4'
        >
          <img
            src={lightbox}
            alt='preview'
            className='max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl'
          />
        </div>
      )}
    </>
  )
}
