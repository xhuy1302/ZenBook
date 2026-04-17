import { PaymentStatus } from '@/defines/order.enum'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

const paymentColorMap: Record<PaymentStatus, string> = {
  UNPAID: 'bg-orange-100 text-orange-700 border-orange-200',
  PAID: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  REFUNDED: 'bg-slate-100 text-slate-700 border-slate-200'
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const { t } = useTranslation('order')
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-sm font-medium border w-fit',
        paymentColorMap[status]
      )}
    >
      {t(`paymentStatus.${status}`)}
    </span>
  )
}
