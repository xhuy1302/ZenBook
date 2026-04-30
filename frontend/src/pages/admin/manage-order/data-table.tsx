// pages/admin/manage-order/data-table.tsx
'use client'

import { useMemo, useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTablePagination } from '@/components/admin/datatable/DataTablePagination'
import { DataTableViewOptions } from '@/components/admin/datatable/DataTableViewOptions'
import { OrderStatus, PaymentStatus } from '@/defines/order.enum'
import { RotateCcw, Search, CalendarDays, Filter, Package2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CreateOrderDialog } from '@/components/admin/data/manage-order/form/OrderFormDialog'
import { DateRangePicker } from '../manage-receipt/DateRangePicker'
import type { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import type { Order } from '@/services/order/order.type'

interface DataTableProps<TValue> {
  data: Order[]
  columns: ColumnDef<Order, TValue>[]
  dateRange: DateRange | undefined
  setDateRange: (date: DateRange | undefined) => void
}

export function DataTable<TValue>({
  data,
  columns,
  dateRange,
  setDateRange
}: DataTableProps<TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'updatedAt',
      desc: true
    }
  ])

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const { t } = useTranslation('order')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection
    }
  })

  const isFiltered = table.getState().columnFilters.length > 0 || !!dateRange?.from

  const handleResetFilters = () => {
    table.resetColumnFilters()
    table.resetSorting()
    setDateRange(undefined)
  }

  const stats = useMemo(() => {
    const rows = table.getFilteredRowModel().rows
    const total = rows.length

    const unpaid = rows.filter((r) => String(r.original.paymentStatus) === 'UNPAID').length

    const failed = rows.filter((r) => String(r.original.paymentStatus) === 'FAILED').length

    return {
      total,
      unpaid,
      failed
    }
  }, [table])

  return (
    <>
      {/* HEADER */}
      <div className='mb-4 rounded-2xl border bg-white p-4 shadow-sm'>
        <div className='flex flex-wrap gap-3'>
          {/* search */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
            <Input
              placeholder={t('filters.search')}
              value={(table.getColumn('orderCode')?.getFilterValue() as string) ?? ''}
              onChange={(event) => table.getColumn('orderCode')?.setFilterValue(event.target.value)}
              className='h-10 w-[240px] pl-10 rounded-xl'
            />
          </div>

          {/* status */}
          <Select
            value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) =>
              table.getColumn('status')?.setFilterValue(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className='h-10 w-[170px] rounded-xl'>
              <SelectValue placeholder={t('filters.status.label')} />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value='all'>{t('filters.status.all')}</SelectItem>

              {Object.values(OrderStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`status.${status}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* payment */}
          <Select
            value={(table.getColumn('paymentStatus')?.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) =>
              table.getColumn('paymentStatus')?.setFilterValue(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className='h-10 w-[190px] rounded-xl'>
              <SelectValue placeholder={t('filters.payment.label')} />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value='all'>{t('filters.payment.all')}</SelectItem>

              {Object.values(PaymentStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`paymentStatus.${status}` as never)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* date */}
          <DateRangePicker date={dateRange} setDate={setDateRange} />

          {/* reset */}
          {isFiltered && (
            <Button
              variant='ghost'
              onClick={handleResetFilters}
              className='h-10 rounded-xl text-muted-foreground hover:text-destructive'
            >
              <RotateCcw className='mr-2 w-4 h-4' />
              {t('filters.reset')}
            </Button>
          )}

          <div className='ml-auto flex gap-2'>
            <DataTableViewOptions table={table} />
            <CreateOrderDialog />
          </div>
        </div>

        {/* STATS */}
        <div className='flex flex-wrap gap-2 mt-4'>
          <Badge variant='secondary' className='rounded-xl px-3 py-1 gap-1'>
            <Package2 className='w-3.5 h-3.5' />
            {stats.total} đơn
          </Badge>

          <Badge className='rounded-xl px-3 py-1 bg-amber-100 text-amber-700 hover:bg-amber-100'>
            {stats.unpaid} chưa thanh toán
          </Badge>

          {stats.failed > 0 && (
            <Badge className='rounded-xl px-3 py-1 bg-red-100 text-red-600 hover:bg-red-100'>
              {stats.failed} thanh toán lỗi
            </Badge>
          )}

          {dateRange?.from && (
            <Badge variant='outline' className='rounded-xl px-3 py-1 gap-1'>
              <CalendarDays className='w-3.5 h-3.5' />
              đang lọc ngày
            </Badge>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className='rounded-2xl border bg-white shadow-sm overflow-hidden'>
        <div className='max-h-[70vh] overflow-auto'>
          <Table>
            <TableHeader className='sticky top-0 z-20 bg-slate-50 border-b'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className='font-bold h-12 whitespace-nowrap'>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn('transition-all hover:bg-slate-50', 'border-b')}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className='py-4'>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-40 text-center'>
                    <div className='flex flex-col items-center gap-3 text-muted-foreground'>
                      <Filter className='w-8 h-8 opacity-40' />
                      <span>{t('table.noResults')}</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className='mt-4'>
        <DataTablePagination table={table} />
      </div>
    </>
  )
}
