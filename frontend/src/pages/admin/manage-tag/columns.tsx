import { TagActionsCell } from '@/components/admin/action/TagAction' // Nhớ tạo Component này
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import type { TagResponse } from '@/services/tag/tag.type'
import i18n from '@/i18n/i18n'
import { type ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<TagResponse>[] = [
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
      <DataTableColumnHeader column={column} title={i18n.t('tag:table.columns.name')} />
    ),
    cell: ({ row }) => {
      const tag = row.original

      return (
        <div className='flex flex-col py-1'>
          <span className='font-semibold leading-none text-nowrap text-foreground'>{tag.name}</span>
          {/* Hiển thị slug nhạt hơn ở dưới, giống như email của user */}
          <span className='text-[11px] text-muted-foreground mt-1.5'>/{tag.slug}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('tag:table.columns.description')} />
    ),
    cell: ({ row }) => (
      <div className='text-sm font-medium text-foreground max-w-[250px] truncate'>
        {row.getValue('description') || <span className='text-muted-foreground'>---</span>}
      </div>
    )
  },
  {
    accessorKey: 'color',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('tag:table.columns.color')} />
    ),
    cell: ({ row }) => {
      const colorHex = row.getValue('color') as string

      return colorHex ? (
        <div className='flex items-center gap-2'>
          {/* Render cục màu tròn hiển thị màu thật */}
          <div
            className='w-5 h-5 rounded-full border shadow-sm'
            style={{ backgroundColor: colorHex }}
          />
          <span className='text-sm font-medium uppercase'>{colorHex}</span>
        </div>
      ) : (
        <span className='text-muted-foreground'>---</span>
      )
    }
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('tag:table.columns.createdAt')} />
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue('createdAt') as string
      if (!dateStr) return <span className='text-muted-foreground'>---</span>

      const formattedDate = new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(new Date(dateStr))

      return <div className='text-sm text-foreground'>{formattedDate}</div>
    }
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>{i18n.t('tag:table.columns.actions')}</div>,
    cell: ({ row }) => <TagActionsCell tag={row.original} />, // Đưa tag vào TagActionsCell để có nút Sửa/Xóa
    enableSorting: false,
    enableHiding: false
  }
]
