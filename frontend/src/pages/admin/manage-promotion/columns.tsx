'use client'

import { PromotionActionsCell } from '@/components/admin/action/PromotionAction'
import { DiscountTypeBadge } from '@/components/admin/data/manage-promotion/DiscountTypeBadge'
import { PromotionStatusBadge } from '@/components/admin/data/manage-promotion/PromotionStatusBadge'
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import i18n from '@/i18n/i18n'
import type { PromotionResponse } from '@/services/promotion/promotion.type'
import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'

export const columns: ColumnDef<PromotionResponse>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className='pl-2 flex items-center justify-center'>
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
      <div className='pl-2 flex items-center justify-center'>
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('promotion:table.columns.name', 'Tên chương trình')}
      />
    ),
    cell: ({ row }) => (
      <div className='font-bold text-foreground line-clamp-2 max-w-[250px]'>
        {row.getValue('name')}
      </div>
    )
  },
  {
    accessorKey: 'discountType',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('promotion:table.columns.discountType', 'Loại giảm')}
      />
    ),
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true
      return row.getValue(columnId) === filterValue
    },
    cell: ({ row }) => <DiscountTypeBadge type={row.getValue('discountType')} />
  },
  {
    accessorKey: 'discountValue',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('promotion:table.columns.discount', 'Mức giảm')}
      />
    ),
    cell: ({ row }) => {
      const type = row.original.discountType
      const value = row.original.discountValue

      return (
        <div className='font-bold text-primary text-base'>
          {type === 'PERCENTAGE'
            ? `${value}%`
            : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
        </div>
      )
    }
  },
  {
    id: 'duration',
    accessorKey: 'startDate',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('promotion:table.columns.duration', 'Thời gian')}
      />
    ),
    cell: ({ row }) => (
      <div className='text-xs font-medium text-muted-foreground flex flex-col gap-1.5'>
        <div className='flex items-center gap-1.5'>
          <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0' />
          <span className='text-foreground'>
            {format(new Date(row.original.startDate), 'dd/MM/yyyy HH:mm')}
          </span>
        </div>
        <div className='flex items-center gap-1.5'>
          <span className='w-1.5 h-1.5 rounded-full bg-destructive shrink-0' />
          <span className='text-foreground'>
            {format(new Date(row.original.endDate), 'dd/MM/yyyy HH:mm')}
          </span>
        </div>
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('promotion:table.columns.status', 'Trạng thái')}
      />
    ),
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true
      return row.getValue(columnId) === filterValue
    },
    cell: ({ row }) => (
      <div className='w-[130px] flex justify-start'>
        <PromotionStatusBadge status={row.getValue('status')} />
      </div>
    )
  },
  {
    id: 'actions',
    header: () => (
      <div className='text-center w-full'>
        {i18n.t('promotion:table.columns.actions', 'Thao tác')}
      </div>
    ),
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <PromotionActionsCell promotion={row.original} />
      </div>
    ),
    enableSorting: false,
    enableHiding: false
  }
]
