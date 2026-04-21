import type { NewsStatus } from '@/defines/news.enum'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

// Định nghĩa màu sắc riêng cho từng trạng thái của Blog
const newsStatusColorMap: Record<NewsStatus, string> = {
  DRAFT:
    'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700',
  PUBLISHED:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  HIDDEN:
    'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
}

interface NewsStatusBadgeProps {
  status?: NewsStatus
}

export function NewsStatusBadge({ status }: NewsStatusBadgeProps) {
  const { t } = useTranslation('news')

  if (!status) return <span className='text-muted-foreground'>-</span>

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-2 py-1 rounded-md text-[11px] font-semibold border w-fit uppercase tracking-wider',
        newsStatusColorMap[status]
      )}
    >
      {t(`fields.status.options.${status}`, status)}
    </span>
  )
}
