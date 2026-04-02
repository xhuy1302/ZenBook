import { colorMap } from '@/defines/colorMap'
import type { AuthorStatus } from '@/defines/author.enum'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface AuthorStatusBadgeProps {
  status?: AuthorStatus
}

export function AuthorStatusBadge({ status }: AuthorStatusBadgeProps) {
  const { t } = useTranslation('author')

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
