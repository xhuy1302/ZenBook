import { PublisherActionsCell } from '@/components/admin/action/PublisherAction' // Cập nhật import
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import i18n from '@/i18n/i18n'
import { type ColumnDef } from '@tanstack/react-table'
import type { PublisherResponse } from '@/services/publisher/publisher.type'
import { PublisherStatusBadge } from '@/components/admin/data/manage-publisher/PublisherStatusBadges' // Cập nhật import

export const columns: ColumnDef<PublisherResponse>[] = [
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
    // Đổi id thành 'publisher' để khớp với logic search ở file data-table
    id: 'publisher',
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('publisher:table.columns.name')} />
    ),
    cell: ({ row }) => {
      const publisher = row.original
      return (
        <div className='flex flex-col py-1'>
          <span className='font-semibold leading-none text-foreground'>{publisher.name}</span>
          {publisher.email && (
            <span className='text-[11px] text-muted-foreground mt-1.5'>{publisher.email}</span>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'contactName',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('publisher:table.columns.contactName')}
      />
    ),
    cell: ({ row }) => (
      <div className='text-sm font-medium text-foreground'>
        {row.getValue('contactName') || <span className='text-muted-foreground'>---</span>}
      </div>
    )
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('publisher:table.columns.phone')} />
    ),
    cell: ({ row }) => (
      <div className='text-sm font-medium text-foreground'>
        {row.getValue('phone') || <span className='text-muted-foreground'>---</span>}
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('publisher:table.columns.status')} />
    ),
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true
      return row.getValue(columnId) === filterValue
    },
    cell: ({ row }) => (
      <div className='w-[110px] flex justify-start'>
        <PublisherStatusBadge status={row.getValue('status')} />
      </div>
    )
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>{i18n.t('publisher:table.columns.actions')}</div>,
    cell: ({ row }) => <PublisherActionsCell publisher={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
