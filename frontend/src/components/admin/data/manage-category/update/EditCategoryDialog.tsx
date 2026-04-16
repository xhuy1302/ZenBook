'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EditCategoryForm } from './EditCategoryForm' // Import component Form chúng ta vừa tạo
import type { CategoryResponse } from '@/services/category/category.type'
import { useTranslation } from 'react-i18next'
import { Edit } from 'lucide-react'

interface EditCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: CategoryResponse
}

export function EditCategoryDialog({ open, onOpenChange, category }: EditCategoryDialogProps) {
  const { t } = useTranslation('category')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[800px] w-[95vw] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 '>
            <Edit className='h-5 w-5' />
            {t('dialogTitle.edit', 'Chỉnh sửa danh mục')}
          </DialogTitle>
        </DialogHeader>

        {/* Gọi component Form và truyền dữ liệu khởi tạo (initialData) vào */}
        <EditCategoryForm
          initialData={category}
          onSuccess={() => onOpenChange(false)} // Khi form chạy API xong thì đóng Dialog
        />
      </DialogContent>
    </Dialog>
  )
}
