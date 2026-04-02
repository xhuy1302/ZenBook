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
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('author:table.columns.name')} />
    ),
    cell: ({ row }) => {
      const author = row.original

      return (
        <div className='flex items-center gap-3'>
          <img
            src={author.avatar || 'https://ui.shadcn.com/avatars/02.png'}
            alt={author.name}
            className='h-9 w-9 rounded-full object-cover border'
          />

          <div className='flex flex-col'>
            <span className='font-medium leading-none text-nowrap'>{author.name}</span>
            <span className='text-xs text-muted-foreground line-clamp-1 max-w-[180px]'>
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
    cell: ({ row }) => <div className='text-sm'>{row.getValue('nationality') || '---'}</div>
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
      return <div className='text-sm'>{datePart}</div>
    }
  },
  // ✅ CỘT SỐ LƯỢNG SÁCH (THAY CHO NGÀY TẠO)
  {
    accessorKey: 'booksCount', // Đổi tên key này theo đúng API của bạn (ví dụ: totalBooks)
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('author:table.columns.booksCount', 'Số sách')}
      />
    ),
    cell: ({ row }) => {
      const count = (row.getValue('booksCount') as number) || 0
      return (
        <div className='text-center font-medium'>
          <span className='bg-primary/10 text-primary px-2 py-1 rounded-md text-xs'>{count}</span>
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
    cell: ({ row }) => <AuthorStatusBadge status={row.getValue('status')} />
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>{i18n.t('author:table.columns.actions')}</div>,
    cell: ({ row }) => <AuthorActionsCell author={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
