import { EditAuthorForm } from '@/components/admin/data/manage-author/update/EditAuthorForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { AuthorResponse } from '@/services/author/author.type'
import { useTranslation } from 'react-i18next'

interface EditAuthorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  author: AuthorResponse
}

export function EditAuthorDialog({ open, onOpenChange, author }: EditAuthorDialogProps) {
  const { t } = useTranslation('author')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] p-0'>
        <DialogHeader className='px-6 pt-6'>
          {/* Mình thêm text dự phòng lỡ file json chưa có key này */}
          <DialogTitle>{t('dialogTitle.update', 'Cập nhật tác giả')}</DialogTitle>
        </DialogHeader>

        <div className='max-h-[80vh] overflow-y-auto px-6 pb-6'>
          <EditAuthorForm author={author} onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
