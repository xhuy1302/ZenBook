// ============================================================
// StarRating.tsx – Interactive / display star rating widget
// ============================================================
import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-7 h-7'
}

const labelMap: Record<number, string> = {
  1: 'Rất tệ',
  2: 'Tệ',
  3: 'Bình thường',
  4: 'Tốt',
  5: 'Xuất sắc'
}

export function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  const active = hovered || value

  return (
    <div className='flex flex-col items-start gap-1'>
      <div
        className={cn('flex items-center gap-0.5', !readonly && 'cursor-pointer')}
        onMouseLeave={() => !readonly && setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type='button'
            disabled={readonly}
            onMouseEnter={() => !readonly && setHovered(star)}
            onClick={() => !readonly && onChange?.(star)}
            className={cn(
              'transition-transform duration-150',
              !readonly && 'hover:scale-110 active:scale-95'
            )}
          >
            <Star
              className={cn(
                sizeMap[size],
                'transition-colors duration-150',
                star <= active ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
              )}
            />
          </button>
        ))}
      </div>

      {!readonly && active > 0 && (
        <span
          className={cn(
            'text-[11px] font-bold px-2 py-0.5 rounded-md transition-all duration-200',
            active >= 4
              ? 'text-emerald-700 bg-emerald-50'
              : active === 3
                ? 'text-amber-700 bg-amber-50'
                : 'text-rose-700 bg-rose-50'
          )}
        >
          {labelMap[active]}
        </span>
      )}
    </div>
  )
}
