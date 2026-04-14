import { PublisherStatus } from '@/defines/publisher.enum'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface PublisherStatusBadgeProps {
  status?: PublisherStatus | string
}

export function PublisherStatusBadge({ status }: PublisherStatusBadgeProps) {
  const { t } = useTranslation('publisher')
  if (!status) return <span>-</span>

  // Custom màu sắc riêng cho từng trạng thái
  const colorMap: Record<string, string> = {
    [PublisherStatus.ACTIVE]:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    [PublisherStatus.INACTIVE]: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    [PublisherStatus.DELETED]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-[12px] font-medium w-fit',
        colorMap[status]
      )}
    >
      {t(`filters.status.${status}`, status)}
    </span>
  )
}
