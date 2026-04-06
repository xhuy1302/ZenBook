'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Trash2 } from 'lucide-react'
import type { BookResponse } from '@/services/book/book.type'

// MỞ COMMENT CÁC DIALOG NÀY
import { EditBookDialog } from '../data/manage-book/update/EditBookDialog'
import { ViewBookDialog } from '../data/manage-book/read/ViewBookDialog'
import { SoftDeleteBookDialog } from '../data/manage-book/delete/SoftDeleteBookDialog'

export function BookActionsCell({ book }: { book: BookResponse }) {
  // MỞ COMMENT CÁC STATE NÀY
  const [openEdit, setOpenEdit] = useState(false)
  const [openView, setOpenView] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <>
      <div className='flex items-center justify-center gap-2'>
        <Button
          variant='ghost'
          className='h-8 px-2 hover:bg-yellow-100 hover:text-yellow-700'
          onClick={() => setOpenEdit(true)} // Mở khóa sự kiện
        >
          <Edit className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          className='h-8 px-2 hover:bg-blue-50 hover:text-blue-600'
          onClick={() => setOpenView(true)} // Mở khóa sự kiện
        >
          <Eye className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          className='h-8 px-2 hover:bg-red-50 hover:text-red-600'
          onClick={() => setOpenDelete(true)} // Mở khóa sự kiện
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      {/* MỞ COMMENT KHI ĐÃ TẠO FILE XONG */}
      <EditBookDialog open={openEdit} onOpenChange={setOpenEdit} book={book} />
      <ViewBookDialog open={openView} onOpenChange={setOpenView} book={book} />
      <SoftDeleteBookDialog open={openDelete} onOpenChange={setOpenDelete} book={book} />
    </>
  )
}
