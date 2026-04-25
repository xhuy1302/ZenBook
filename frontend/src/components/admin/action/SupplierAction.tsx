'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Trash2 } from 'lucide-react'
import type { SupplierResponse } from '@/services/supplier/supplier.type'

import { EditSupplierDialog } from '@/components/admin/data/manage-supplier/update/EditSupplierDialog'
import { ViewSupplierDialog } from '@/components/admin/data/manage-supplier/read/ViewSupplierDialog'
import { DeleteSupplierDialog } from '@/components/admin/data/manage-supplier/delete/SoftDeleteSupplierDialog'

interface SupplierActionsCellProps {
  supplier: SupplierResponse
}

export function SupplierActionsCell({ supplier }: SupplierActionsCellProps) {
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

      <ViewSupplierDialog open={openView} onOpenChange={setOpenView} supplier={supplier} />
      <EditSupplierDialog open={openEdit} onOpenChange={setOpenEdit} supplier={supplier} />
      <DeleteSupplierDialog open={openDelete} onOpenChange={setOpenDelete} supplier={supplier} />
    </>
  )
}
