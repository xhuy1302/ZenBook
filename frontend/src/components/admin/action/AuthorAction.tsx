'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Trash2 } from 'lucide-react'
import type { AuthorResponse } from '@/services/author/author.type'
import { EditAuthorDialog } from '@/components/admin/data/manage-author/update/EditAuthorDialog'
import { ViewAuthorDialog } from '@/components/admin/data/manage-author/read/ViewAuthorDialog'
import { SoftDeleteAuthorDialog } from '@/components/admin/data/manage-author/delete/SoftDeleteAuthorDialog'

interface AuthorActionsCellProps {
  author: AuthorResponse
}

export function AuthorActionsCell({ author }: AuthorActionsCellProps) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openView, setOpenView] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <>
      <div className='flex items-center justify-center gap-2'>
        {/* Nút Chỉnh sửa */}
        <Button
          variant='ghost'
          size='default'
          className='h-8 px-2.5 hover:bg-yellow-100 hover:text-orange-700 dark:hover:bg-yellow-100/20'
          onClick={() => setOpenEdit(true)}
        >
          <Edit className='h-4 w-4' />
        </Button>

        {/* Nút Xem chi tiết */}
        <Button
          variant='ghost'
          size='default'
          className='h-8 px-2.5 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20'
          onClick={() => setOpenView(true)}
        >
          <Eye className='h-4 w-4' />
        </Button>

        {/* Nút Xóa tạm thời (Soft Delete) */}
        <Button
          variant='ghost'
          size='default'
          className='h-8 px-2.5 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20'
          onClick={() => setOpenDelete(true)}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      {/* Các Dialog tương ứng cho Author */}
      <ViewAuthorDialog open={openView} onOpenChange={setOpenView} author={author} />
      <EditAuthorDialog open={openEdit} onOpenChange={setOpenEdit} author={author} />
      <SoftDeleteAuthorDialog open={openDelete} onOpenChange={setOpenDelete} author={author} />
    </>
  )
}
