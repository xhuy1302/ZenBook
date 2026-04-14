'use client'

import { useState } from 'react'
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
import { CreatePromotionForm } from './CreatePromotionForm'

export function CreatePromotionDialog() {
  const { t } = useTranslation('promotion')
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='gap-2'>
          <Plus className='w-4 h-4' />
          {t('createBtn', 'Tạo chương trình mới')}
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-[700px] p-0'>
        <DialogHeader className='px-6 pt-6 pb-2 border-b'>
          <DialogTitle className='text-xl font-bold'>
            {t('dialogTitle.create', 'Thêm chương trình khuyến mãi')}
          </DialogTitle>
        </DialogHeader>

        <div className='max-h-[80vh] overflow-y-auto px-6 py-4'>
          <CreatePromotionForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
