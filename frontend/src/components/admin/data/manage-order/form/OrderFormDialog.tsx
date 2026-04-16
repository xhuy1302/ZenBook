'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { OrderForm } from './OrderForm'
import type { Order } from '@/services/order/order.type'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react' // 👉 ĐÃ THÊM: Import icon X

interface OrderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order?: Order
  mode: 'create' | 'edit'
}

export function OrderFormDialog({ open, onOpenChange, order, mode }: OrderFormDialogProps) {
  const { t } = useTranslation('order')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='!w-[95vw] lg:!w-[90vw] !max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-50 dark:bg-zinc-950/50 p-0 border-0 shadow-2xl'>
        {/* 👉 ĐÃ SỬA: Thêm flex, items-center, justify-between và space-y-0 để căn chỉnh header */}
        <DialogHeader className='px-6 py-4 bg-background border-b sticky top-0 z-20 flex flex-row items-center justify-between space-y-0'>
          <DialogTitle className='text-xl'>
            {mode === 'create' ? t('form.createTitle') : t('form.editTitle')}
          </DialogTitle>

          {/* 👉 ĐÃ THÊM: Nút X để đóng cửa sổ */}
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-muted-foreground hover:text-foreground'
            onClick={() => onOpenChange(false)}
          >
            <X className='h-5 w-5' />
          </Button>
        </DialogHeader>

        <div className='p-6'>
          <OrderForm order={order} mode={mode} onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// CreateOrderDialog wrapper
export function CreateOrderDialog() {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation('order')

  return (
    <>
      <Button className='gap-2' onClick={() => setOpen(true)}>
        <Plus className='mr-2 h-4 w-4' />
        {t('actions.create')}
      </Button>
      <OrderFormDialog open={open} onOpenChange={setOpen} mode='create' />
    </>
  )
}
