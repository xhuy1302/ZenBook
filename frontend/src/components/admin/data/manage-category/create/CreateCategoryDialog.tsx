import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { CreateCategoryForm } from './CreateCategoryForm'
import { useTranslation } from 'react-i18next'

export function CreateCategoryDialog() {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation('category')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className='gap-2'>
          <Plus className='h-4 w-4' />
          {t('actions.add', 'Thêm danh mục')}
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-[550px] p-0 overflow-hidden shadow-2xl'>
        <DialogHeader className='px-6 pt-6 space-y-1'>
          <DialogTitle className='text-2xl font-bold tracking-tight'>
            {t('dialogTitle.create', 'Tạo danh mục mới')}
          </DialogTitle>
          <DialogDescription>
            Điền các thông tin để tạo cấu trúc danh mục cho cửa hàng.
          </DialogDescription>
        </DialogHeader>

        <div className='px-6 pb-6 mt-4'>
          <CreateCategoryForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
