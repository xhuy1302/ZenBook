import { colorMap } from '@/defines/colorMap'
import type { CategoryStatus } from '@/defines/category.enum'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface CategoryStatusBadgeProps {
  status?: CategoryStatus
}

export function CategoryStatusBadge({ status }: CategoryStatusBadgeProps) {
  const { t } = useTranslation('category')

  if (!status) return <span>-</span>

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-sm font-medium w-fit',
        colorMap[status]
      )}
    >
      {t(`filters.status.${status}`, status)}
    </span>
  )
}
