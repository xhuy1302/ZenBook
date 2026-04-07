'use client'

import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState
} from '@tanstack/react-table'

import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import { useQueryClient } from '@tanstack/react-query'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Plus, FileSpreadsheet, Search, RotateCcw } from 'lucide-react'

import { DataTablePagination } from '@/components/admin/datatable/DataTablePagination'
import { DataTableViewOptions } from '@/components/admin/datatable/DataTableViewOptions'
import { ReceiptStatus } from '@/defines/receipt.enum'
import { CreateReceiptDialog } from '@/components/admin/data/manage-receipt/create/CreateReceiptDialog'
import { importReceiptExcelApi } from '@/services/receipt/receipt.api'
import { DateRangePicker } from './DateRangePicker'
import type { DateRange } from 'react-day-picker'
import { Separator } from '@/components/ui/separator'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  dateRange: DateRange | undefined
  setDateRange: (date: DateRange | undefined) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  dateRange,
  setDateRange
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation('receipt')
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [openCreate, setOpenCreate] = useState(false)

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  })

  const isFiltered = table.getState().columnFilters.length > 0 || !!dateRange?.from

  const handleReset = () => {
    table.resetColumnFilters()
    setDateRange(undefined)
  }

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      toast.info(t('receipt.message.importing', 'Đang import dữ liệu...'))
      await importReceiptExcelApi(file)
      toast.success(t('receipt.message.importSuccess', 'Import Excel thành công!'))
      queryClient.invalidateQueries({
        predicate: (query) => JSON.stringify(query.queryKey).includes('receipts')
      })
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || t('common.error', 'Lỗi import!'))
      } else {
        toast.error(t('common.error', 'Có lỗi hệ thống!'))
      }
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        {/* NHÓM BỘ LỌC (BÊN TRÁI) */}
        <div className='flex flex-1 flex-wrap items-center gap-3'>
          <div className='relative'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder={t('receipt.table.searchPlaceholder', 'Tìm mã phiếu...')}
              value={(table.getColumn('receiptCode')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('receiptCode')?.setFilterValue(event.target.value)
              }
              className='h-9 w-[200px] lg:w-[280px] pl-9 focus-visible:ring-primary/20'
            />
          </div>

          <Select
            value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) =>
              table.getColumn('status')?.setFilterValue(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className='h-9 w-[160px] bg-background font-medium'>
              <SelectValue placeholder={t('common.status', 'Trạng thái')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>
                {t('receipt.table.allStatus', 'Tất cả trạng thái')}
              </SelectItem>
              {Object.values(ReceiptStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`receipt.status.${status}`, status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Picker nằm giữa các bộ lọc */}
          <DateRangePicker date={dateRange} setDate={setDateRange} />

          {isFiltered && (
            <Button
              variant='ghost'
              onClick={handleReset}
              className='h-9 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5'
            >
              <RotateCcw className='mr-2 h-4 w-4' />
              {t('common.reset', 'Làm mới')}
            </Button>
          )}
        </div>

        {/* NHÓM NÚT HÀNH ĐỘNG (BÊN PHẢI) */}
        <div className='flex items-center gap-3'>
          <DataTableViewOptions table={table} />

          <Separator orientation='vertical' className='h-6 hidden md:block' />

          <input
            type='file'
            accept='.xlsx, .xls'
            className='hidden'
            ref={fileInputRef}
            onChange={handleImportExcel}
          />
          <Button
            variant='outline'
            className='gap-2 bg-green-50/50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200/60 shadow-sm'
            onClick={() => fileInputRef.current?.click()}
          >
            <FileSpreadsheet className='h-4 w-4' />
            <span className='hidden sm:inline font-medium'>Import Excel</span>
          </Button>

          <Button
            variant='default'
            className='gap-2 shadow-md shadow-primary/20 bg-primary hover:bg-primary/90'
            onClick={() => setOpenCreate(true)}
          >
            <Plus className='h-4 w-4 font-bold' />
            <span className='font-medium'>{t('receipt.table.btnAdd', 'Tạo phiếu')}</span>
          </Button>
        </div>
      </div>

      <CreateReceiptDialog open={openCreate} onOpenChange={setOpenCreate} />

      <div className='rounded-xl border bg-card shadow-sm overflow-hidden'>
        <Table>
          <TableHeader className='bg-muted/30'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='hover:bg-transparent'>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className='text-foreground/80 font-bold h-11'>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='hover:bg-muted/20 transition-colors'
                >
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
                  className='h-40 text-center text-muted-foreground'
                >
                  <div className='flex flex-col items-center justify-center gap-2'>
                    <Search className='h-8 w-8 opacity-20' />
                    <p className='text-sm italic'>
                      {t('receipt.table.noResults', 'Không tìm thấy dữ liệu phù hợp.')}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
