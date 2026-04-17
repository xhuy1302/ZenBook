'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CreateCouponForm } from './CreateCouponForm'
import { useTranslation } from 'react-i18next'

export function CreateCouponDialog({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation('coupon')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-y-auto custom-scrollbar'>
        <DialogHeader>
          <DialogTitle>{t('dialog.createTitle', 'Thêm mới Mã giảm giá')}</DialogTitle>
        </DialogHeader>

        <CreateCouponForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
