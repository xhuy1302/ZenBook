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
      <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{t('receipt.dialog.createTitle', 'Tạo phiếu nhập kho')}</DialogTitle>
        </DialogHeader>
        {/* Render Form bên trong và truyền hàm đóng Dialog */}
        <CreateReceiptForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
