'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Trash2 } from 'lucide-react'
import type { CategoryResponse } from '@/services/category/category.type'
import { EditCategoryDialog } from '@/components/admin/data/manage-category/update/EditCategoryDialog'
import { ViewCategoryDialog } from '@/components/admin/data/manage-category/read/ViewCategoryDialog'
import { SoftDeleteCategoryDialog } from '@/components/admin/data/manage-category/delete/SoftDeleteCategoryDialog'

interface CategoryActionsCellProps {
  category: CategoryResponse
}

export function CategoryActionsCell({ category }: CategoryActionsCellProps) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openView, setOpenView] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <>
      <div className='flex items-center justify-center gap-1.5'>
        {/* Nút Xem chi tiết */}

        {/* Nút Sửa */}
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 rounded-md hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-900/30 text-muted-foreground transition-all'
          onClick={() => setOpenEdit(true)}
          title='Chỉnh sửa'
        >
          <Edit className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 rounded-md hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 text-muted-foreground transition-all'
          onClick={() => setOpenView(true)}
          title='Xem chi tiết'
        >
          <Eye className='h-4 w-4' />
        </Button>

        {/* Nút Xóa mềm */}
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 rounded-md hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 text-muted-foreground transition-all'
          onClick={() => setOpenDelete(true)}
          title='Đưa vào thùng rác'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      {/* Các Dialog tương ứng */}
      <ViewCategoryDialog open={openView} onOpenChange={setOpenView} category={category} />

      <EditCategoryDialog open={openEdit} onOpenChange={setOpenEdit} category={category} />

      <SoftDeleteCategoryDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        category={category}
      />
    </>
  )
}
