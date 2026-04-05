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
import { CreateSupplierForm } from './CreateSupplierForm'
import { useTranslation } from 'react-i18next'

export function CreateSupplierDialog() {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation('supplier')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className='gap-2'>
          <Plus className='h-4 w-4' />
          {t('actions.create')}
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-[700px] p-0 overflow-hidden shadow-2xl'>
        <DialogHeader className='px-6 pt-6 space-y-1'>
          <DialogTitle className='text-2xl font-bold tracking-tight'>
            {t('dialogTitle.create', 'Thêm mới Nhà cung cấp')}
          </DialogTitle>
          <DialogDescription>
            Điền các thông tin dưới đây để thêm một nhà cung cấp mới vào hệ thống.
          </DialogDescription>
        </DialogHeader>

        <div className='px-6 pb-6 mt-2'>
          <CreateSupplierForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
