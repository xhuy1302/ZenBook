'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Trash2 } from 'lucide-react'
import type { TagResponse } from '@/services/tag/tag.type'

// Lưu ý: Đảm bảo bạn đã tạo (hoặc sẽ tạo) các component Dialog này trong thư mục manage-tag
import { EditTagDialog } from '@/components/admin/data/manage-tag/update/EditTagDialog'
import { ViewTagDialog } from '@/components/admin/data/manage-tag/read/ViewTagDialog'
import { DeleteTagDialog } from '@/components/admin/data/manage-tag/delete/SoftDeleteTagDialog'

interface TagActionsCellProps {
  tag: TagResponse
}

export function TagActionsCell({ tag }: TagActionsCellProps) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openView, setOpenView] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <>
      <div className='flex items-center justify-center gap-2'>
        {/* Nút Sửa */}
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
          className='h-8 px-2.5 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20 '
          onClick={() => {
            setOpenView(true)
          }}
        >
          <Eye className='h-4 w-4' />
        </Button>

        {/* Nút Xóa (Xóa mềm) */}
        <Button
          variant='ghost'
          size='default'
          className='h-8 px-2.5 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20'
          onClick={() => {
            setOpenDelete(true)
          }}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      {/* Các Dialog được gọi lên khi bấm nút */}
      <ViewTagDialog open={openView} onOpenChange={setOpenView} tag={tag} />
      <EditTagDialog open={openEdit} onOpenChange={setOpenEdit} tag={tag} />
      <DeleteTagDialog open={openDelete} onOpenChange={setOpenDelete} tag={tag} />
    </>
  )
}
