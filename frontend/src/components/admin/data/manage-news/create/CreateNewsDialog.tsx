'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CreateNewsForm } from './CreateNewsForm'

export function CreateNewsDialog() {
  const { t } = useTranslation('news')
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        <Button className='gap-2'>
          <Plus className='h-4 w-4' />
          {t('actions.create')}
        </Button>
      </DialogTrigger>

      <DialogContent
        className='sm:max-w-[1200px] max-h-[95vh] overflow-y-auto p-0'
        onFocusOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header dính trên cùng khi scroll */}
        <div className='sticky top-0 bg-background z-10 px-6 pt-6 pb-2 border-b'>
          <DialogHeader>
            <DialogTitle className='text-xl'>{t('dialogTitle.create')}</DialogTitle>
          </DialogHeader>
        </div>

        {/* Nội dung form có padding */}
        <div className='px-6 pb-6'>
          {open && <CreateNewsForm onSuccess={() => setOpen(false)} />}
        </div>
      </DialogContent>
    </Dialog>
  )
}
