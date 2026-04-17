'use client'

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
import { CreateAuthorForm } from './CreateAuthorForm'
import { useTranslation } from 'react-i18next'

export function CreateAuthorDialog() {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation('author')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='gap-2'>
          <Plus className='h-4 w-4' />
          {t('actions.add', 'Thêm tác giả')}
        </Button>
      </DialogTrigger>

      {/* 1. sm:max-w-[600px]: Thu nhỏ chiều rộng lại cho vừa vặn.
        2. ĐÃ XÓA p-0: Để Shadcn UI tự động canh lề và hiện nút "X" ở góc trên bên phải cực chuẩn.
      */}
      <DialogContent className='sm:max-w-[600px] w-[95vw] shadow-lg'>
        {/* Đã xóa các class padding thủ công (px-6, pt-6...) vì DialogContent đã lo việc đó */}
        <DialogHeader>
          <DialogTitle className='text-xl font-bold'>
            {t('dialogTitle.create', 'Tạo tác giả mới')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'dialogDescription.create',
              'Điền các thông tin dưới đây để thêm một tác giả mới vào hệ thống.'
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Bọc form với một chút margin top để cách ly khỏi Header */}
        <div className='mt-2'>
          <CreateAuthorForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
