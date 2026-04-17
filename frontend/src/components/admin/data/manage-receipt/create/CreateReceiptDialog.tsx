'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CreateReceiptForm } from './CreateReceiptForm'
import { useTranslation } from 'react-i18next'

export function CreateReceiptDialog({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation('receipt')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[800px] w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background'>
        {/* Thu nhỏ padding (py-3) và chỉnh tiêu đề gọn lại */}
        <DialogHeader className='px-5 py-3 border-b bg-background shrink-0'>
          <DialogTitle className='text-lg'>
            {t('receipt.dialog.createTitle', 'Tạo phiếu nhập kho')}
          </DialogTitle>
        </DialogHeader>

        {/* Phần thân chứa Form cuộn */}
        <div className='flex-1 overflow-y-auto p-5'>
          <CreateReceiptForm onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
