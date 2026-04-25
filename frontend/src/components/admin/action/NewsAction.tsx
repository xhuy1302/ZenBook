'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Trash2 } from 'lucide-react'
import type { NewsResponse } from '@/services/news/news.type'

// 👉 ĐÃ XÓA import EditNewsDialog
import { ViewNewsDialog } from '@/components/admin/data/manage-news/read/ViewNewsDialog'
import { DeleteNewsDialog } from '@/components/admin/data/manage-news/delete/SoftDeleteNewsDialog'

// 👉 THÊM onEdit VÀO PROPS ĐỂ TRUYỀN LỆNH LÊN FILE CHA
interface NewsActionsCellProps {
  news: NewsResponse
  onEdit: () => void
}

export function NewsActionsCell({ news, onEdit }: NewsActionsCellProps) {
  const [openView, setOpenView] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  // 👉 ĐÃ XÓA state openEdit

  return (
    <>
      <div className='flex items-center justify-center gap-2'>
        {/* NÚT SỬA: Bấm vào là gọi onEdit truyền từ Table xuống */}
        <Button
          variant='ghost'
          size='default'
          className='h-8 px-2.5 hover:bg-yellow-100 hover:text-orange-700 dark:hover:bg-yellow-100/20'
          onClick={onEdit}
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

      {/* Render ngầm các Dialog View và Delete (Edit đã bị loại bỏ) */}
      <ViewNewsDialog open={openView} onOpenChange={setOpenView} news={news} />
      <DeleteNewsDialog open={openDelete} onOpenChange={setOpenDelete} news={news} />
    </>
  )
}
