'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Trash2 } from 'lucide-react'
import type { PublisherResponse } from '@/services/publisher/publisher.type'

// Đã cập nhật lại đường dẫn và tên component Dialog
import { EditPublisherDialog } from '@/components/admin/data/manage-publisher/update/EditPublisherDialog'
import { ViewPublisherDialog } from '@/components/admin/data/manage-publisher/read/ViewPublisherDialog'
import { DeletePublisherDialog } from '@/components/admin/data/manage-publisher/delete/SoftDeletePublisherDialog'

interface PublisherActionsCellProps {
  publisher: PublisherResponse // Đã đổi tên props
}

export function PublisherActionsCell({ publisher }: PublisherActionsCellProps) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openView, setOpenView] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <>
      <div className='flex items-center justify-center gap-2'>
        <Button
          variant='ghost'
          size='default'
          className='h-8 px-2.5 hover:bg-yellow-100 hover:text-orange-700'
          onClick={() => setOpenEdit(true)}
        >
          <Edit className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='default'
          className='h-8 px-2.5 hover:bg-blue-50 hover:text-blue-500'
          onClick={() => setOpenView(true)}
        >
          <Eye className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='default'
          className='h-8 px-2.5 hover:bg-red-50 hover:text-red-700'
          onClick={() => setOpenDelete(true)}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      {/* Truyền prop publisher thay vì supplier */}
      <ViewPublisherDialog open={openView} onOpenChange={setOpenView} publisher={publisher} />
      <EditPublisherDialog open={openEdit} onOpenChange={setOpenEdit} publisher={publisher} />
      <DeletePublisherDialog open={openDelete} onOpenChange={setOpenDelete} publisher={publisher} />
    </>
  )
}
