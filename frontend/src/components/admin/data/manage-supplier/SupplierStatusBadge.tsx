import { SupplierStatus } from '@/defines/supplier.enum'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface SupplierStatusBadgeProps {
  status?: SupplierStatus | string
}

export function SupplierStatusBadge({ status }: SupplierStatusBadgeProps) {
  const { t } = useTranslation('supplier')
  if (!status) return <span>-</span>

  const colorMap: Record<string, string> = {
    [SupplierStatus.ACTIVE]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    [SupplierStatus.INACTIVE]: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    [SupplierStatus.BLOCKED]:
      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    [SupplierStatus.DELETED]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-[12px] font-medium w-fit',
        colorMap[status] || 'bg-slate-100 text-slate-700'
      )}
    >
      {t(`filters.status.${status}`, status)}
    </span>
  )
}
