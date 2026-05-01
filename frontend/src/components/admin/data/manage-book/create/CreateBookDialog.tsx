'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CreateBookForm } from './CreateBookForm'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react' // 👉 Import thêm icon X

interface CreateBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateBookDialog({ open, onOpenChange }: CreateBookDialogProps) {
  const { t } = useTranslation('product')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* - [&>button.absolute]:hidden -> Ẩn nút X mặc định của Shadcn UI để dùng nút custom bên dưới
       */}
      <DialogContent className='sm:max-w-[1100px] p-0 flex flex-col h-[90vh] overflow-hidden gap-0 [&>button.absolute]:hidden'>
        {/* HEADER: Thêm flex-row, justify-between và space-y-0 để căn ngang Title và nút X */}
        <DialogHeader className='px-5 py-3.5 border-b border-slate-200 shrink-0 z-10 flex flex-row items-center justify-between space-y-0'>
          <DialogTitle className='text-lg font-bold tracking-tight text-primary'>
            {t('book.dialog.createTitle', 'Thêm Mới Sách')}
          </DialogTitle>

          {/* 👉 Nút đóng cửa sổ (X) */}
          <button
            onClick={() => onOpenChange(false)}
            className='p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors focus:outline-none'
          >
            <X className='h-5 w-5' />
          </button>
        </DialogHeader>

        {/* FORM: Tự động chiếm toàn bộ không gian còn lại */}
        <div className='flex-1 overflow-hidden'>
          <CreateBookForm
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
