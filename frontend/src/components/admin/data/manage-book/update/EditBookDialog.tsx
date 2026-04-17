import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EditBookForm } from './EditBookForm'
import type { BookResponse } from '@/services/book/book.type'
import { useTranslation } from 'react-i18next'

interface EditBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  book: BookResponse
}

export function EditBookDialog({ open, onOpenChange, book }: EditBookDialogProps) {
  const { t } = useTranslation('product')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{t('book.dialog.editTitle')}</DialogTitle>
        </DialogHeader>
        <EditBookForm book={book} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
