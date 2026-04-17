'use client'

import { Badge } from '@/components/ui/badge'
import { ReceiptStatus } from '@/defines/receipt.enum'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'

interface ReceiptStatusBadgeProps {
  status: ReceiptStatus
}

export function ReceiptStatusBadge({ status }: ReceiptStatusBadgeProps) {
  const { t } = useTranslation('receipt')

  // Cấu hình màu sắc và icon cho từng trạng thái
  const statusConfig = {
    [ReceiptStatus.COMPLETED]: {
      label: t('receipt.status.COMPLETED', 'Đã chốt'),
      className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200',
      icon: CheckCircle2
    },
    [ReceiptStatus.DRAFT]: {
      label: t('receipt.status.DRAFT', 'Bản nháp'),
      className: 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200',
      icon: Clock
    },
    [ReceiptStatus.CANCELLED]: {
      label: t('receipt.status.CANCELLED', 'Đã hủy'),
      className: 'bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200',
      icon: XCircle
    }
  }

  // Fallback về DRAFT nếu status không hợp lệ
  const config = statusConfig[status] || statusConfig[ReceiptStatus.DRAFT]
  const Icon = config.icon

  return (
    <Badge
      variant='outline'
      className={`flex w-fit items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium transition-colors ${config.className}`}
    >
      <Icon className='w-3.5 h-3.5' />
      {config.label}
    </Badge>
  )
}
