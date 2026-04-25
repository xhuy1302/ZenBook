'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { EditNewsForm } from './EditNewsForm'
import type { NewsResponse } from '@/services/news/news.type'

interface EditNewsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  news: NewsResponse
}

export function EditNewsDialog({ open, onOpenChange, news }: EditNewsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // CHÚ Ý CHỖ NÀY: Ép full toàn màn hình, xóa bo góc, padding, border và Nút X
        className='fixed inset-0 z-[100] w-screen h-screen max-w-none m-0 p-0 border-0 rounded-none bg-slate-50 flex flex-col [&>button.absolute]:hidden overflow-y-auto'
        onFocusOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className='sr-only'>Cập nhật bài viết</DialogTitle>

        {open && (
          <div className='flex-1 w-full h-full'>
            <EditNewsForm
              news={news}
              onSuccess={() => onOpenChange(false)}
              onCancel={() => onOpenChange(false)}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
