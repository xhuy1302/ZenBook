'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CreateCouponForm } from './CreateCouponForm'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

interface CreateCouponDialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
}

export function CreateCouponDialog({ open, onOpenChange }: CreateCouponDialogProps) {
  const { t } = useTranslation('coupon')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[1000px] p-0 overflow-hidden flex flex-col h-[90vh] '>
        {/* 👉 ĐÃ THÊM: flex-row, justify-between, items-center và custom X button */}
        <DialogHeader className='px-6 py-4 shrink-0         border-b z-10 flex flex-row items-center justify-between'>
          <DialogTitle className='text-xl font-bold tracking-tight text-slate-800 m-0'>
            {t('dialog.createTitle', 'Thêm mới Mã giảm giá')}
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className='p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors focus:outline-none'
          >
            <X className='w-5 h-5' />
          </button>
        </DialogHeader>

        <CreateCouponForm
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
