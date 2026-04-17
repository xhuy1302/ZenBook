import { AuthorActionsCell } from '@/components/admin/action/AuthorAction'
import { AuthorStatusBadge } from '@/components/admin/data/manage-author/AuthorStatusBadges'
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import type { AuthorResponse } from '@/services/author/author.type'
import i18n from '@/i18n/i18n'
import { type ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<AuthorResponse>[] = [
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
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('author:table.columns.name')} />
    ),
    cell: ({ row }) => {
      const author = row.original

      return (
        <div className='flex items-center gap-3 py-1'>
          <img
            src={author.avatar || 'https://ui.shadcn.com/avatars/02.png'}
            alt={author.name}
            className='h-10 w-10 rounded-full object-cover border shadow-sm'
            onError={(e) => {
              e.currentTarget.src = 'https://ui.shadcn.com/avatars/02.png'
            }}
          />

          <div className='flex flex-col'>
            <span className='font-semibold leading-none text-nowrap text-foreground'>
              {author.name}
            </span>
            <span className='text-[11px] text-muted-foreground line-clamp-1 max-w-[200px] mt-1.5'>
              {author.biography || i18n.t('author:table.columns.noBiography')}
            </span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'nationality',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('author:table.columns.nationality', 'Quốc tịch')}
      />
    ),
    cell: ({ row }) => (
      <div className='text-sm font-medium text-muted-foreground'>
        {row.getValue('nationality') || '---'}
      </div>
    )
  },
  {
    accessorKey: 'dateOfBirth',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('author:table.columns.dateOfBirth', 'Ngày sinh')}
      />
    ),
    cell: ({ row }) => {
      const date = row.getValue('dateOfBirth') as string
      if (!date) return <div className='text-sm text-muted-foreground'>---</div>
      const datePart = date.split(' ')[0]
      return <div className='text-sm font-medium'>{datePart}</div>
    }
  },
  // ✅ CỘT SỐ LƯỢNG SÁCH ĐÃ ĐƯỢC LÀM ĐẸP
  {
    accessorKey: 'bookCount',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('author:table.columns.bookCount', 'Số sách')}
      />
    ),
    cell: ({ row }) => {
      const count = (row.getValue('bookCount') as number) || 0
      return (
        // Ép width cố định và dùng flex để căn giữa tuyệt đối
        <div className='w-[80px] flex justify-center'>
          <span className='inline-flex items-center justify-center bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold shadow-sm min-w-[32px]'>
            {count}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('author:table.columns.status')} />
    ),
    filterFn: (row, columnId, filterValue) => {
      const status = row.getValue(columnId) as string
      if (!filterValue) return true
      return status === filterValue
    },
    cell: ({ row }) => (
      // Căn giữa cột trạng thái cho đồng bộ với bảng Category
      <div className='w-[110px] flex justify-center'>
        <AuthorStatusBadge status={row.getValue('status')} />
      </div>
    )
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>{i18n.t('author:table.columns.actions')}</div>,
    cell: ({ row }) => <AuthorActionsCell author={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
