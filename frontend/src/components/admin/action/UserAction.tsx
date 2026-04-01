'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Trash2 } from 'lucide-react'
import type { User } from '@/pages/admin/manage-user/columns'
import { EditUserDialog } from '@/components/admin/data/manage-user/update/EditUserDialog'
import { ViewUserDialog } from '@/components/admin/data/manage-user/read/ViewUserDialog'
import { DeleteUserDialog } from '@/components/admin/data/manage-user/delete/SoftDeleteUserDialog'

interface UserActionsCellProps {
  user: User
}

export function UserActionsCell({ user }: UserActionsCellProps) {
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
        >
          <Edit className='h-4 w-4' />
        </Button>

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

      <ViewUserDialog open={openView} onOpenChange={setOpenView} user={user} />
      <EditUserDialog open={openEdit} onOpenChange={setOpenEdit} user={user} />
      <DeleteUserDialog open={openDelete} onOpenChange={setOpenDelete} user={user} />
    </>
  )
}
