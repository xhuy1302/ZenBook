import { EditTagForm } from '@/components/admin/data/manage-tag/update/EditTagForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { TagResponse } from '@/services/tag/tag.type'
import { useTranslation } from 'react-i18next'

interface EditTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tag: TagResponse
}

export function EditTagDialog({ open, onOpenChange, tag }: EditTagDialogProps) {
  const { t } = useTranslation('tag')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px] p-0'>
        <DialogHeader className='px-6 pt-6 pb-2 border-b border-border/50'>
          <DialogTitle>{t('dialogTitle.update', 'Cập nhật Nhãn')}</DialogTitle>
        </DialogHeader>

        {/* Bỏ max-h vì form tag khá ngắn, không cần thanh cuộn dài như user */}
        <div className='px-6 py-4'>
          <EditTagForm tag={tag} onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
