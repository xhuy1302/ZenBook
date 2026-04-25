import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Star, ThumbsUp, Flag } from 'lucide-react'
import type { ReviewItem } from '@/services/book/book.type'

interface ProductReviewsProps {
  bookId: string
  rating?: number
  reviewsCount?: number
  /** Pass real review items from API; empty array shows CTA to login */
  items?: ReviewItem[]
}

type SortMode = 'newest' | 'liked'

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'
  return (
    <div className='flex gap-0.5'>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${cls} ${
            i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

// Distribution is computed from real items if provided, else fake placeholder
function buildDistribution(reviewsCount: number, items: ReviewItem[]): Record<number, number> {
  if (items.length > 0) {
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    items.forEach((r) => {
      dist[Math.round(r.rating)] = (dist[Math.round(r.rating)] ?? 0) + 1
    })
    return dist
  }
  // Fake distribution for display when no items provided
  return {
    5: Math.round(reviewsCount * 0.6),
    4: Math.round(reviewsCount * 0.25),
    3: Math.round(reviewsCount * 0.1),
    2: Math.round(reviewsCount * 0.03),
    1: Math.round(reviewsCount * 0.02)
  }
}

export default function ProductReviews({
  bookId: _bookId,
  rating = 0,
  reviewsCount = 0,
  items = []
}: ProductReviewsProps) {
  const { t } = useTranslation('common')
  const [sort, setSort] = useState<SortMode>('newest')

  const distribution = buildDistribution(reviewsCount, items)

  const sorted = [...items].sort((a, b) =>
    sort === 'liked' ? b.likes - a.likes : new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div id='reviews' className='flex flex-col gap-4'>
      <h2 className='text-base font-bold text-gray-900'>Đánh giá sản phẩm</h2>

      {/* ── Rating summary ── */}
      <div className='flex flex-col md:flex-row gap-6 items-start md:items-center'>
        {/* Big score */}
        <div className='flex flex-col items-center shrink-0 w-28'>
          <span className='text-5xl font-bold text-gray-900'>
            {rating > 0 ? rating.toFixed(1) : 0}
            <span className='text-2xl text-gray-400'>/5</span>
          </span>
          <StarRow rating={rating} size='lg' />
          <span className='text-xs text-gray-400 mt-1'>({reviewsCount} đánh giá)</span>
        </div>

        {/* Bar chart */}
        <div className='flex flex-col gap-1.5 flex-1 w-full min-w-0'>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] ?? 0
            const pct = reviewsCount > 0 ? Math.round((count / reviewsCount) * 100) : 0
            return (
              <div key={star} className='flex items-center gap-2 text-xs text-gray-500'>
                <span className='w-10 text-right shrink-0'>{star} sao</span>
                <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
                  <div className='h-full bg-amber-400 rounded-full' style={{ width: `${pct}%` }} />
                </div>
                <span className='w-8 text-right text-gray-400'>{pct}%</span>
              </div>
            )
          })}
        </div>

        {/* Login CTA */}
        <div className='text-xs text-gray-500 md:max-w-[200px] shrink-0'>
          Chỉ có thành viên mới có thể viết nhận xét. Vui lòng{' '}
          <a href='/login' className='text-[#c92127] hover:underline'>
            đăng nhập
          </a>{' '}
          hoặc{' '}
          <a href='/register' className='text-[#c92127] hover:underline'>
            đăng ký
          </a>
          .
        </div>
      </div>

      {/* ── Sort tabs ── */}
      {items.length > 0 && (
        <div className='flex border-b border-gray-200'>
          {(
            [
              { key: 'newest', label: 'Mới nhất' },
              { key: 'liked', label: 'Yêu thích nhất' }
            ] as { key: SortMode; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSort(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-[2px] transition-colors ${
                sort === tab.key
                  ? 'border-[#c92127] text-[#c92127]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Review items ── */}
      {sorted.length === 0 ? (
        <p className='text-sm text-gray-400 italic text-center py-6'>{t('product.noReviews')}</p>
      ) : (
        <div className='flex flex-col divide-y divide-gray-100'>
          {sorted.map((review) => (
            <div key={review.id} className='py-4 flex flex-col gap-2'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0 uppercase'>
                  {review.username.charAt(0)}
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-800'>{review.username}</p>
                  <p className='text-xs text-gray-400'>{review.date}</p>
                </div>
              </div>
              <StarRow rating={review.rating} />
              <p className='text-sm text-gray-700 leading-relaxed'>{review.content}</p>
              <div className='flex items-center gap-4 mt-1'>
                <button className='flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors'>
                  <ThumbsUp className='w-3.5 h-3.5' />
                  Thích ({review.likes})
                </button>
                <button className='flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors'>
                  <Flag className='w-3.5 h-3.5' />
                  Báo cáo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
