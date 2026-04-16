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
import { CreateCategoryForm } from './CreateCategoryForm'
import { useTranslation } from 'react-i18next'

export function CreateCategoryDialog() {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation('category')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='gap-2'>
          <Plus className='h-4 w-4' />
          {t('actions.add', 'Thêm danh mục')}
        </Button>
      </DialogTrigger>

      {/* 👉 ĐÃ XÓA: p-0, overflow-hidden để trả lại padding chuẩn và hiện nút X.
          Vẫn giữ width 550px vì form danh mục thường ngắn và ít trường.
      */}
      <DialogContent className='sm:max-w-[550px] w-[95vw] shadow-lg'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold'>
            {t('dialogTitle.create', 'Tạo danh mục mới')}
          </DialogTitle>
          <DialogDescription>
            Điền các thông tin để tạo cấu trúc danh mục cho cửa hàng.
          </DialogDescription>
        </DialogHeader>

        {/* Bọc form với margin-top nhẹ để cách ly khỏi Header */}
        <div className='mt-2'>
          <CreateCategoryForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
