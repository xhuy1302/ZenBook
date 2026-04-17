// pages/admin/manage-order/columns.tsx
'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { OrderStatusBadge } from '@/components/admin/data/manage-order/OrderStatusBadge'
import { PaymentStatusBadge } from '@/components/admin/data/manage-order/PaymentStatusBadge'
import { OrderActionsCell } from '@/components/admin/action/OrderAction'
import { format, isValid } from 'date-fns'
import { vi } from 'date-fns/locale'
import i18n from '@/i18n/i18n'
import type { Order } from '@/services/order/order.type'

export type OrderRow = Order

// Hàm format ngày an toàn chống crash
const safeFormatDate = (dateString?: string | null) => {
  if (!dateString) return '---'
  // Nếu đã format dd-MM-yyyy từ backend
  if (dateString.includes('-') && !dateString.includes('T')) return dateString

  const date = new Date(dateString)
  if (!isValid(date)) return '---'
  return format(date, 'dd/MM/yyyy HH:mm', { locale: vi })
}

export const columns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: 'orderCode',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('order:table.columns.orderCode')}
        className='justify-center'
      />
    ),
    cell: ({ row }) => (
      <div className='text-center'>
        <span className='font-bold text-sm text-red-600 whitespace-nowrap uppercase'>
          {row.getValue('orderCode')}
        </span>
      </div>
    )
  },
  {
    id: 'customer',
    accessorKey: 'customerName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('order:table.columns.customer')} />
    ),
    cell: ({ row }) => {
      const order = row.original
      return (
        <div className='flex flex-col'>
          <span className='font-medium text-sm'>{order.customerName}</span>
          <span className='text-xs text-muted-foreground'>{order.customerPhone}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'finalTotal',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('order:table.columns.total')}
        className='justify-center' // Căn giữa Header
      />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('finalTotal'))
      const formatted = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount)
      return (
        <div className='text-center font-bold text-red-600'>
          {' '}
          {/* Căn giữa dữ liệu và màu đỏ */}
          {formatted}
        </div>
      )
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('order:table.columns.status')}
        className='justify-center'
      />
    ),
    filterFn: (row, columnId, filterValue) => {
      const status = row.getValue(columnId) as string
      if (!filterValue) return true
      return status === filterValue
    },
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <OrderStatusBadge status={row.getValue('status')} />
      </div>
    )
  },
  {
    accessorKey: 'paymentStatus',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('order:table.columns.payment')}
        className='justify-center'
      />
    ),
    filterFn: (row, columnId, filterValue) => {
      const status = row.getValue(columnId) as string
      if (!filterValue) return true
      return status === filterValue
    },
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <PaymentStatusBadge status={row.getValue('paymentStatus')} />
      </div>
    )
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('order:table.columns.createdAt')}
        className='justify-center'
      />
    ),
    cell: ({ row }) => (
      <div className='text-center text-sm text-muted-foreground'>
        {safeFormatDate(row.getValue('createdAt'))}
      </div>
    )
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>{i18n.t('order:table.columns.actions')}</div>,
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <OrderActionsCell order={row.original} />
      </div>
    ),
    enableSorting: false,
    enableHiding: false
  }
]
