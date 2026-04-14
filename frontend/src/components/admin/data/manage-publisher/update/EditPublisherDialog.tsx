import { EditPublisherForm } from '@/components/admin/data/manage-publisher/update/EditPublisherForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PublisherResponse } from '@/services/publisher/publisher.type'
import { useTranslation } from 'react-i18next'

interface EditPublisherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  publisher: PublisherResponse
}

export function EditPublisherDialog({ open, onOpenChange, publisher }: EditPublisherDialogProps) {
  const { t } = useTranslation('publisher')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle>{t('dialogTitle.update', 'Cập nhật nhà xuất bản')}</DialogTitle>
        </DialogHeader>

        <div className='max-h-[80vh] overflow-y-auto px-6 pb-6'>
          <EditPublisherForm publisher={publisher} onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
