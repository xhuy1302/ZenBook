'use client'

import { CouponStatus } from '@/defines/coupon.enum'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

const statusColorMap: Record<CouponStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400',
  EXPIRED: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400'
}

export function CouponStatusBadge({ status }: { status: CouponStatus }) {
  const { t } = useTranslation('coupon')

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-[13px] font-medium w-fit border',
        statusColorMap[status]
      )}
    >
      {t(`fields.status.options.${status}`, status === 'ACTIVE' ? 'Đang chạy' : 'Hết hạn')}
    </span>
  )
}
