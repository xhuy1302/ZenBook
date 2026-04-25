'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EditBookForm } from './EditBookForm'
import type { BookResponse } from '@/services/book/book.type'
import { useTranslation } from 'react-i18next'
import { Edit3 } from 'lucide-react'

interface EditBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  book: BookResponse
}

export function EditBookDialog({ open, onOpenChange, book }: EditBookDialogProps) {
  const { t } = useTranslation('product')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[1100px] p-0 overflow-hidden flex flex-col h-[92vh]'>
        <DialogHeader className='px-6 py-5 border-b bg-white shrink-0'>
          <DialogTitle className='text-xl font-bold flex items-center gap-2 text-slate-800'>
            <Edit3 className='w-5 h-5 text-brand-green' />
            {t('book.dialog.editTitle')}
          </DialogTitle>
        </DialogHeader>

        <EditBookForm
          book={book}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
