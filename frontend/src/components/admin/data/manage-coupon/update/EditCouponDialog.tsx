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
      <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-y-auto custom-scrollbar'>
        <DialogHeader>
          <DialogTitle>{t('dialog.editTitle', 'Cập nhật mã giảm giá')}</DialogTitle>
        </DialogHeader>
        <EditCouponForm coupon={coupon} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
