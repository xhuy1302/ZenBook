import { UserActionsCell } from '@/components/admin/action/UserAction'
import { UserRoleBadges } from '@/components/admin/data/manage-user/UserRoleBadges'
import { UserStatusBadge } from '@/components/admin/data/manage-user/UserStatusBadges'
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import type { UserStatus } from '@/defines/user.enum'
import { MemberTier } from '@/defines/enum.membership'
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
  membership?: {
    tier: MemberTier
    availablePoints: number
    totalSpending: number
  } | null
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
            className='h-10 w-10 rounded-full object-cover border shadow-sm shrink-0'
            onError={(e) => {
              e.currentTarget.src = 'https://ui.shadcn.com/avatars/02.png'
            }}
          />
          {/* Cập nhật: Thêm min-w-0 và break-all để email tự xuống dòng */}
          <div className='flex flex-col min-w-0 max-w-[180px]'>
            <span className='font-semibold leading-none text-foreground truncate'>
              {user.username}
            </span>
            <span className='text-[11px] text-muted-foreground mt-1.5 break-all'>{user.email}</span>
          </div>
        </div>
      )
    }
  },
  {
    id: 'tier',
    accessorKey: 'membership.tier',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Hạng' />,
    cell: ({ row }) => {
      const tier = row.original.membership?.tier || MemberTier.MEMBER
      const tierStyles: Record<MemberTier, string> = {
        MEMBER: 'bg-slate-100 text-slate-600 border-slate-200',
        SILVER: 'bg-zinc-100 text-zinc-500 border-zinc-300',
        GOLD: 'bg-amber-50 text-amber-600 border-amber-200',
        PLATINUM: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        DIAMOND: 'bg-sky-50 text-sky-700 border-sky-200'
      }
      return (
        <Badge variant='outline' className={`${tierStyles[tier]} font-bold px-2 py-0.5`}>
          {tier}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value === 'all' || row.getValue(id) === value
  },
  {
    accessorKey: 'membership.availablePoints',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Điểm' />,
    cell: ({ row }) => (
      <div className='text-sm font-bold text-emerald-600'>
        {row.original.membership?.availablePoints?.toLocaleString() || 0}
      </div>
    )
  },
  {
    accessorKey: 'membership.totalSpending',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Tổng chi' />,
    cell: ({ row }) => {
      const amount = row.original.membership?.totalSpending || 0
      return (
        <div className='text-sm font-medium text-nowrap'>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
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
      <div className='text-sm font-medium'>{row.getValue('fullName') || '---'}</div>
    )
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('user:table.columns.phone')} />
    ),
    cell: ({ row }) => <div className='text-sm font-medium'>{row.getValue('phone') || '---'}</div>
  },
  {
    accessorKey: 'roles',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('user:table.columns.role')} />
    ),
    cell: ({ row }) => (
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
    cell: ({ row }) => (
      <div className='w-[100px]'>
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
