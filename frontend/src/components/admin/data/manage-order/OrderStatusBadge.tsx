import { OrderStatus } from '@/defines/order.enum'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

const statusColorMap: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  PACKING: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  SHIPPING: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-rose-100 text-rose-700 border-rose-200',
  RETURNED: 'bg-slate-100 text-slate-700 border-slate-200'
}

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const { t } = useTranslation('order')
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-sm font-medium border w-fit',
        statusColorMap[status]
      )}
    >
      {t(`status.${status}`)}
    </span>
  )
}
