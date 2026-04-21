'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslation } from 'react-i18next'
import { EditNewsForm } from './EditNewsForm'
import type { NewsResponse } from '@/services/news/news.type'

interface EditNewsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  news: NewsResponse
}

export function EditNewsDialog({ open, onOpenChange, news }: EditNewsDialogProps) {
  const { t } = useTranslation('news')

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent
        className='sm:max-w-[1100px] max-h-[95vh] overflow-y-auto'
        // 1. KHÔNG CHO PHÉP Shadcn cướp lại con trỏ chuột khi ta gõ vào Source Code
        onFocusOutside={(e) => e.preventDefault()}
        // 2. KHÔNG CHO PHÉP Shadcn tự động đóng Dialog khi click ra ngoài bảng TinyMCE
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t('dialogTitle.update')}</DialogTitle>
        </DialogHeader>

        {/* Chỉ render Form khi dialog được mở để dữ liệu cũ luôn được làm mới */}

        {open && <EditNewsForm news={news} onSuccess={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}
