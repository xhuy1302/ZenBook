import { useState } from 'react'
import { CreateTagForm } from '@/components/admin/data/manage-tag/create/CreateTagForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function CreateTagDialog() {
  const { t } = useTranslation('tag')
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Nút Trigger mở hộp thoại được tích hợp sẵn */}
      <DialogTrigger asChild>
        <Button className='gap-2'>
          <Plus className='w-4 h-4' />
          <span className='hidden sm:inline'>{t('page.add_new', 'Thêm mới')}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-[500px] p-0'>
        <DialogHeader className='px-6 pt-6 pb-2 border-b border-border/50'>
          <DialogTitle>{t('form.create_title', 'Thêm Nhãn Mới')}</DialogTitle>
        </DialogHeader>

        <div className='px-6 py-4'>
          <CreateTagForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
