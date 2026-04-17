'use client'

import type { DiscountType } from '@/defines/coupon.enum'
import { cn } from '@/lib/utils'
import { Percent, Banknote } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface DiscountTypeBadgeProps {
  type?: DiscountType
}

export function DiscountTypeBadge({ type }: DiscountTypeBadgeProps) {
  const { t } = useTranslation('coupon')

  if (!type) return <span>-</span>

  const isPercentage = type === 'PERCENTAGE'

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[13px] font-medium border w-fit transition-colors',
        isPercentage
          ? 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400'
          : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400'
      )}
    >
      {isPercentage ? (
        <Percent className='w-3.5 h-3.5 stroke-[2.5px]' />
      ) : (
        <Banknote className='w-3.5 h-3.5 stroke-[2.5px]' />
      )}
      {t(`fields.discountType.options.${type}`, isPercentage ? 'Giảm %' : 'Giảm tiền')}
    </div>
  )
}
