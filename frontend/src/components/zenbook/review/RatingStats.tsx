// ============================================================
// RatingStatsBar.tsx – Rating breakdown bars + average display
// ============================================================
import { Star } from 'lucide-react'

import type { RatingStatsResponse } from '@/services/review/review.type'

interface RatingStatsProps {
  stats: RatingStatsResponse
  activeFilter: number | null
  onFilter: (rating: number | null) => void
}

export function RatingStatsBar({ stats, activeFilter, onFilter }: RatingStatsProps) {
  const counts = [1, 2, 3, 4, 5].map((star) => stats.breakdown[star] ?? 0)
  const maxCount = Math.max(...counts, 1)

  return (
    <div className='bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center'>
      {/* Average */}
      <div className='flex flex-col items-center gap-1 sm:pr-4 sm:border-r border-slate-100 min-w-[90px]'>
        <span className='text-[38px] font-black text-slate-900 leading-none'>
          {stats.average.toFixed(1)}
        </span>

        <div className='flex gap-0.5'>
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-3.5 h-3.5 ${
                s <= Math.round(stats.average)
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-200 text-slate-200'
              }`}
            />
          ))}
        </div>

        <span className='text-[11px] text-slate-500 font-medium'>{stats.count} đánh giá</span>
      </div>

      {/* Breakdown */}
      <div className='flex flex-col gap-1.5 flex-1 w-full'>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.breakdown[star] ?? 0
          const pct = Math.round((count / maxCount) * 100)
          const isActive = activeFilter === star

          return (
            <button
              key={star}
              type='button'
              onClick={() => onFilter(isActive ? null : star)}
              className={`flex items-center gap-2 rounded-lg px-2 py-1 transition-colors group ${
                isActive ? 'bg-amber-50' : 'hover:bg-slate-50'
              }`}
            >
              <span className='w-3 text-[11px] font-bold text-slate-600'>{star}</span>

              <Star
                className={`w-3 h-3 shrink-0 transition-colors ${
                  isActive
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-300 text-slate-300 group-hover:fill-amber-300 group-hover:text-amber-300'
                }`}
              />

              <div className='flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden'>
                <div
                  style={{ width: `${pct}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    isActive ? 'bg-amber-400' : 'bg-amber-300 group-hover:bg-amber-400'
                  }`}
                />
              </div>

              <span className='w-6 text-right text-[11px] font-medium text-slate-400'>{count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
