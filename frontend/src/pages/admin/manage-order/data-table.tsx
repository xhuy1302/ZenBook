// pages/admin/manage-order/data-table.tsx
'use client'

import { useState } from 'react'
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
import { DataTablePagination } from '@/components/admin/datatable/DataTablePagination'
import { DataTableViewOptions } from '@/components/admin/datatable/DataTableViewOptions'
import { OrderStatus, PaymentStatus } from '@/defines/order.enum'
import { RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CreateOrderDialog } from '@/components/admin/data/manage-order/form/OrderFormDialog'
// 👉 IMPORT DateRangePicker (điều chỉnh đường dẫn nếu cần)
import { DateRangePicker } from '../manage-receipt/DateRangePicker'
import type { DateRange } from 'react-day-picker'

interface DataTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  // 👉 THÊM PROPS CHO DATE RANGE
  dateRange: DateRange | undefined
  setDateRange: (date: DateRange | undefined) => void
}

export function DataTable<TData, TValue>({
  data,
  columns,
  dateRange,
  setDateRange
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
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

  // Kiểm tra xem có đang lọc cái gì không (bao gồm cả lọc ngày)
  const isFiltered = table.getState().columnFilters.length > 0 || !!dateRange?.from

  const handleResetFilters = () => {
    table.resetColumnFilters()
    table.resetSorting()
    setDateRange(undefined) // 👉 Reset cả ngày tháng
  }

  return (
    <>
      <div className='flex flex-wrap items-center gap-2 py-4'>
        {/* Tìm kiếm mã đơn */}
        <Input
          placeholder={t('filters.search')}
          value={(table.getColumn('orderCode')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('orderCode')?.setFilterValue(event.target.value)}
          className='h-9 w-[200px] lg:w-[250px]'
        />

        {/* Lọc trạng thái đơn hàng */}
        <Select
          value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('status')?.setFilterValue(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className='h-9 w-[150px]'>
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

        {/* Lọc trạng thái thanh toán */}
        <Select
          value={(table.getColumn('paymentStatus')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('paymentStatus')?.setFilterValue(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className='h-9 w-[180px]'>
            <SelectValue placeholder={t('filters.payment.label')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('filters.payment.all')}</SelectItem>
            {Object.values(PaymentStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {t(`paymentStatus.${status}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 👉 THÊM DATE RANGE PICKER VÀO ĐÂY */}
        <DateRangePicker date={dateRange} setDate={setDateRange} />

        {/* Nút làm mới */}
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={handleResetFilters}
            className='h-9 px-2 lg:px-3 text-muted-foreground hover:text-destructive'
          >
            <RotateCcw className='mr-2 h-4 w-4' />
            {t('filters.reset')}
          </Button>
        )}

        <div className='ml-auto flex items-center gap-2'>
          <DataTableViewOptions table={table} />
          <CreateOrderDialog />
        </div>
      </div>

      <div className='overflow-hidden rounded-md border mb-5'>
        <Table>
          <TableHeader className='bg-muted/50'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className='font-bold'>
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='py-3'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center text-muted-foreground'
                >
                  {t('table.noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </>
  )
}
