'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Trash2 } from 'lucide-react'
import type { CouponResponse } from '@/services/coupon/coupon.type'

import { EditCouponDialog } from '../data/manage-coupon/update/EditCouponDialog'
import { ViewCouponDialog } from '../data/manage-coupon/read/ViewCouponDialog'
import { SoftDeleteCouponDialog } from '../data/manage-coupon/delete/SoftDeleteCouponDialog'

export function CouponActionsCell({ coupon }: { coupon: CouponResponse }) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openView, setOpenView] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <>
      <div className='flex items-center justify-center gap-2'>
        <Button
          variant='ghost'
          className='h-8 px-2 hover:bg-yellow-100 hover:text-yellow-700'
          onClick={() => setOpenEdit(true)}
        >
          <Edit className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          className='h-8 px-2 hover:bg-blue-50 hover:text-blue-600'
          onClick={() => setOpenView(true)}
        >
          <Eye className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          className='h-8 px-2 hover:bg-red-50 hover:text-red-600'
          onClick={() => setOpenDelete(true)}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      <EditCouponDialog open={openEdit} onOpenChange={setOpenEdit} coupon={coupon} />
      <ViewCouponDialog open={openView} onOpenChange={setOpenView} coupon={coupon} />
      <SoftDeleteCouponDialog open={openDelete} onOpenChange={setOpenDelete} coupon={coupon} />
    </>
  )
}
