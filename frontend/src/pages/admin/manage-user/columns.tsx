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
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
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
        <div className='flex items-center gap-3'>
          <img
            src={user.avatar || 'https://ui.shadcn.com/avatars/02.png'}
            alt={user.username}
            className='h-9 w-9 rounded-full object-cover border'
          />

          <div className='flex flex-col'>
            <span className='font-medium leading-none'>{user.username}</span>
            <span className='text-sm text-muted-foreground'>{user.email}</span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('user:table.columns.fullName')} />
    )
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('user:table.columns.phone')} />
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
    cell: ({ row }) => <UserRoleBadges roles={row.getValue('roles')} />
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
    cell: ({ row }) => <UserStatusBadge status={row.getValue('status')} />
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>{i18n.t('user:table.columns.actions')}</div>,
    cell: ({ row }) => <UserActionsCell user={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
