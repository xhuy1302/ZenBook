import { EditUserForm } from '@/components/admin/data/manage-user/update/EditUserForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { User } from '@/pages/admin/manage-user/columns'
import { useTranslation } from 'react-i18next'

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
  const { t } = useTranslation('user')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle>{t('dialogTitle.update')}</DialogTitle>
        </DialogHeader>

        <div className='max-h-[80vh] overflow-y-auto px-6 pb-6'>
          <EditUserForm user={user} onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
