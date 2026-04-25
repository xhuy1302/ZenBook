'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EditCouponForm } from './EditCouponForm'
import type { CouponResponse } from '@/services/coupon/coupon.type'
import { useTranslation } from 'react-i18next'

interface EditCouponDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coupon: CouponResponse
}

export function EditCouponDialog({ open, onOpenChange, coupon }: EditCouponDialogProps) {
  const { t } = useTranslation('coupon')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 👉 Đã đổi từ 850px lên 1000px ở đây */}
      <DialogContent className='sm:max-w-[1000px] p-0 overflow-hidden flex flex-col h-[90vh]'>
        <DialogHeader className='px-6 pt-6 pb-2 shrink-0'>
          <DialogTitle className='text-xl font-bold tracking-tight'>
            {t('dialog.editTitle', 'Cập nhật Mã giảm giá')}
          </DialogTitle>
        </DialogHeader>

        <EditCouponForm
          coupon={coupon}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
