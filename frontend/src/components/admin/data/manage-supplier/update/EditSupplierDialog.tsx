import { EditSupplierForm } from '@/components/admin/data/manage-supplier/update/EditSupplierForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { SupplierResponse } from '@/services/supplier/supplier.type'
import { useTranslation } from 'react-i18next'

interface EditSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: SupplierResponse
}

export function EditSupplierDialog({ open, onOpenChange, supplier }: EditSupplierDialogProps) {
  const { t } = useTranslation('supplier')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle>{t('dialogTitle.update', 'Cập nhật nhà cung cấp')}</DialogTitle>
        </DialogHeader>

        <div className='max-h-[80vh] overflow-y-auto px-6 pb-6'>
          <EditSupplierForm supplier={supplier} onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
