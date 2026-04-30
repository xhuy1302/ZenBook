// File: src/components/zenbook/review/RatingStats.tsx
'use client'

import { Star } from 'lucide-react'

export interface RatingStatsBarProps {
  stats: {
    star: number
    count: number
  }[]
  totalReviews: number
}

// 👉 Đảm bảo export đúng tên hàm là RatingStatsBar
export function RatingStatsBar({ stats, totalReviews }: RatingStatsBarProps) {
  // Sắp xếp sao từ 5 xuống 1 để hiển thị đẹp mắt
  const sortedStats = [...stats].sort((a, b) => b.star - a.star)

  return (
    <div className='flex flex-col gap-2.5 w-full'>
      {sortedStats.map((item) => {
        const percentage = totalReviews > 0 ? (item.count / totalReviews) * 100 : 0

        return (
          <div key={item.star} className='flex items-center gap-3 w-full'>
            {/* Cột 1: Hiển thị "5 Sao", "4 Sao"... */}
            <div className='flex items-center gap-1 w-10 shrink-0 justify-end'>
              <span className='text-[13px] font-bold text-slate-700'>{item.star}</span>
              <Star className='w-3.5 h-3.5 fill-amber-400 text-amber-400' />
            </div>

            {/* Cột 2: Thanh tiến độ (Progress Bar) */}
            <div className='flex-1 h-2 bg-slate-100 rounded-full overflow-hidden'>
              <div
                className='h-full bg-amber-400 rounded-full transition-all duration-700 ease-out'
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Cột 3: Số lượng đánh giá */}
            <div className='w-8 shrink-0 text-right'>
              <span className='text-[12px] font-medium text-slate-500'>{item.count}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
