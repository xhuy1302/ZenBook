'use client'

import type { PromotionStatus } from '@/defines/promotion.enum'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface PromotionStatusBadgeProps {
  status?: PromotionStatus
}

const statusColorMap: Record<PromotionStatus, string> = {
  ACTIVE:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  SCHEDULED:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  PAUSED:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  EXPIRED:
    'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20'
}

export function PromotionStatusBadge({ status }: PromotionStatusBadgeProps) {
  const { t } = useTranslation('promotion')

  if (!status) return <span className='text-muted-foreground'>-</span>

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-2 py-1 rounded-md text-sm font-medium border w-fit transition-colors',
        statusColorMap[status]
      )}
    >
      {t(`filters.status.${status}`, status)}
    </span>
  )
}
