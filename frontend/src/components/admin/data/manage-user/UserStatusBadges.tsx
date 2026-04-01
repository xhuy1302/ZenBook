import { colorMap } from '@/defines/colorMap'
import type { UserStatus } from '@/defines/user.enum'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface UserStatusBadgeProps {
  status?: UserStatus
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const { t } = useTranslation('user')

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
