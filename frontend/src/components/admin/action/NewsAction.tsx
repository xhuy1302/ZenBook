'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Trash2 } from 'lucide-react'
import type { NewsResponse } from '@/services/news/news.type'

// Import sẵn các Dialog (Lát nữa chúng ta tạo file thì nó sẽ tự động hết lỗi)
import { EditNewsDialog } from '@/components/admin/data/manage-news/update/EditNewsDialog'
import { ViewNewsDialog } from '@/components/admin/data/manage-news/read/ViewNewsDialog'
import { DeleteNewsDialog } from '@/components/admin/data/manage-news/delete/SoftDeleteNewsDialog'

interface NewsActionsCellProps {
  news: NewsResponse
}

export function NewsActionsCell({ news }: NewsActionsCellProps) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openView, setOpenView] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <>
      <div className='flex items-center justify-center gap-2'>
        <Button
          variant='ghost'
          size='default'
          className='h-8 px-2.5 hover:bg-yellow-100 hover:text-orange-700 dark:hover:bg-yellow-100/20'
          onClick={() => setOpenEdit(true)}
          title='Chỉnh sửa bài viết'
        >
          <Edit className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          size='default'
          className='h-8 px-2.5 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20 '
          onClick={() => setOpenView(true)}
          title='Xem chi tiết'
        >
          <Eye className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          size='default'
          className='h-8 px-2.5 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20'
          onClick={() => setOpenDelete(true)}
          title='Xóa vào thùng rác'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      {/* Render ngầm các Dialog, khi nào state = true mới bật lên */}
      <ViewNewsDialog open={openView} onOpenChange={setOpenView} news={news} />
      <EditNewsDialog open={openEdit} onOpenChange={setOpenEdit} news={news} />
      <DeleteNewsDialog open={openDelete} onOpenChange={setOpenDelete} news={news} />
    </>
  )
}
