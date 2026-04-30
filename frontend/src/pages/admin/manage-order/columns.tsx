// pages/admin/manage-order/columns.tsx
'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { OrderStatusBadge } from '@/components/admin/data/manage-order/OrderStatusBadge'
import { PaymentStatusBadge } from '@/components/admin/data/manage-order/PaymentStatusBadge'
import { OrderActionsCell } from '@/components/admin/action/OrderAction'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock3, Sparkles, User2 } from 'lucide-react'
import { format, formatDistanceToNow, isValid, differenceInHours } from 'date-fns'
import { vi } from 'date-fns/locale'
import i18n from '@/i18n/i18n'
import type { Order } from '@/services/order/order.type'
import { cn } from '@/lib/utils'

import { PaymentStatus } from '@/defines/order.enum'

export type OrderRow = Order

const safeFormatDate = (dateString?: string | null) => {
  if (!dateString) return '---'

  if (dateString.includes('-') && !dateString.includes('T')) {
    return dateString
  }

  const date = new Date(dateString)

  if (!isValid(date)) return '---'

  return format(date, 'dd/MM/yyyy HH:mm', {
    locale: vi
  })
}

const safeRelativeTime = (dateString?: string | null) => {
  if (!dateString) return '---'

  const date = new Date(dateString)

  if (!isValid(date)) return '---'

  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: vi
  })
}

const isNewOrder = (dateString?: string | null) => {
  if (!dateString) return false

  const date = new Date(dateString)

  if (!isValid(date)) return false

  return differenceInHours(new Date(), date) <= 24
}

export const columns: ColumnDef<OrderRow>[] = [
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
    accessorKey: 'orderCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('order:table.columns.orderCode')} />
    ),
    cell: ({ row }) => {
      const order = row.original
      const isNew = isNewOrder(order.createdAt)

      return (
        <div className='flex flex-col gap-1 min-w-[180px]'>
          <div className='flex items-center gap-2'>
            <span className='font-bold text-sm text-red-600 uppercase tracking-wide'>
              {order.orderCode}
            </span>

            {isNew && (
              <Badge className='h-5 px-2 bg-emerald-500 hover:bg-emerald-500 text-white text-[10px] gap-1'>
                <Sparkles className='w-3 h-3' />
                NEW
              </Badge>
            )}
          </div>

          <div className='flex items-center gap-1 text-[11px] text-muted-foreground'>
            <Clock3 className='w-3 h-3' />
            {safeFormatDate(order.createdAt)}
          </div>
        </div>
      )
    }
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
        <div className='flex items-start gap-3 min-w-[220px]'>
          <div className='w-9 h-9 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0'>
            <User2 className='w-4 h-4 text-brand-green' />
          </div>

          <div className='flex flex-col'>
            <span className='font-semibold text-sm'>{order.customerName || 'Khách lẻ'}</span>

            <span className='text-xs text-muted-foreground'>{order.customerPhone || '---'}</span>
          </div>
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
        className='justify-center'
      />
    ),
    cell: ({ row }) => {
      const amount = Number(row.original.finalTotal || 0)

      const formatted = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount)

      const isBigOrder = amount >= 500000

      return (
        <div className='flex justify-center'>
          <div
            className={cn(
              'px-3 py-1 rounded-xl font-bold text-sm',
              isBigOrder ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-700'
            )}
          >
            {formatted}
          </div>
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
    cell: ({ row }) => {
      const paymentStatus = row.getValue('paymentStatus') as PaymentStatus

      return (
        <div className='flex justify-center items-center gap-2'>
          <PaymentStatusBadge status={paymentStatus} />

          {paymentStatus === PaymentStatus.FAILED && (
            <AlertTriangle className='w-4 h-4 text-red-500' />
          )}
        </div>
      )
    }
  },

  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cập nhật' className='justify-center' />
    ),
    cell: ({ row }) => {
      const updatedAt = row.original.updatedAt

      return (
        <div className='text-center min-w-[140px]'>
          <div className='text-sm font-medium'>{safeRelativeTime(updatedAt)}</div>

          <div className='text-[11px] text-muted-foreground'>{safeFormatDate(updatedAt)}</div>
        </div>
      )
    }
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
      <div className='text-center text-sm text-muted-foreground whitespace-nowrap'>
        {safeFormatDate(row.original.createdAt)}
      </div>
    )
  },

  {
    id: 'actions',
    header: () => (
      <div className='text-center font-semibold'>{i18n.t('order:table.columns.actions')}</div>
    ),
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <OrderActionsCell order={row.original} />
      </div>
    ),
    enableSorting: false,
    enableHiding: false
  }
]
