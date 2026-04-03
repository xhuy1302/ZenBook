import { UserActionsCell } from '@/components/admin/action/UserAction'
import { UserRoleBadges } from '@/components/admin/data/manage-user/UserRoleBadges'
import { UserStatusBadge } from '@/components/admin/data/manage-user/UserStatusBadges'
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import type { UserStatus } from '@/defines/user.enum'
import i18n from '@/i18n/i18n'
import { type ColumnDef } from '@tanstack/react-table'

export type User = {
  id: string
  username: string
  email: string
  fullName?: string | null
  phone?: string | null
  avatar?: string | null
  status: UserStatus
  roles: string[]
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className='pl-2'>
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className='pl-2'>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    id: 'user',
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('user:table.columns.user')} />
    ),
    cell: ({ row }) => {
      const user = row.original

      return (
        <div className='flex items-center gap-3 py-1'>
          <img
            src={user.avatar || 'https://ui.shadcn.com/avatars/02.png'}
            alt={user.username}
            className='h-10 w-10 rounded-full object-cover border shadow-sm'
            onError={(e) => {
              e.currentTarget.src = 'https://ui.shadcn.com/avatars/02.png'
            }}
          />

          <div className='flex flex-col'>
            <span className='font-semibold leading-none text-nowrap text-foreground'>
              {user.username}
            </span>
            <span className='text-[11px] text-muted-foreground mt-1.5'>{user.email}</span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('user:table.columns.fullName')} />
    ),
    cell: ({ row }) => (
      <div className='text-sm font-medium text-foreground'>
        {row.getValue('fullName') || <span className='text-muted-foreground'>---</span>}
      </div>
    )
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('user:table.columns.phone')} />
    ),
    cell: ({ row }) => (
      <div className='text-sm font-medium text-foreground'>
        {row.getValue('phone') || <span className='text-muted-foreground'>---</span>}
      </div>
    )
  },
  {
    accessorKey: 'roles',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('user:table.columns.role')} />
    ),
    filterFn: (row, columnId, filterValue) => {
      const roles = row.getValue(columnId) as string[]

      if (!filterValue) return true
      if (!Array.isArray(roles)) return false

      return roles.includes(filterValue)
    },
    cell: ({ row }) => (
      // Bọc thêm thẻ div để nếu user có nhiều role thì nó tự động rớt dòng đẹp mắt
      <div className='flex flex-wrap items-center gap-1.5 max-w-[200px]'>
        <UserRoleBadges roles={row.getValue('roles')} />
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('user:table.columns.status')} />
    ),
    filterFn: (row, columnId, filterValue) => {
      const status = row.getValue(columnId) as string

      if (!filterValue) return true

      return status === filterValue
    },
    cell: ({ row }) => (
      // Căn giữa cột trạng thái, ép khung w-[110px] để các badge đều nhau
      <div className='w-[110px] flex justify-center'>
        <UserStatusBadge status={row.getValue('status')} />
      </div>
    )
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>{i18n.t('user:table.columns.actions')}</div>,
    cell: ({ row }) => <UserActionsCell user={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
