import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CreateBookForm } from './CreateBookForm'
import { useTranslation } from 'react-i18next'

export function CreateBookDialog({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation('product')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{t('book.dialog.createTitle')}</DialogTitle>
        </DialogHeader>
        <CreateBookForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
