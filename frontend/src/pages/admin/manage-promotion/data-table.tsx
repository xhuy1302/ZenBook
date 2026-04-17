'use client'

import { CreatePromotionDialog } from '@/components/admin/data/manage-promotion/create/CreatePromotionDialog'
import { DataTablePagination } from '@/components/admin/datatable/DataTablePagination'
import { DataTableViewOptions } from '@/components/admin/datatable/DataTableViewOptions'
import { TrashPromotionDialog } from '@/components/admin/data/manage-promotion/trash/TrashPromotionDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { DiscountType, PromotionStatus } from '@/defines/promotion.enum'
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
import { Search, Tag, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface DataTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
}

export function DataTable<TData, TValue>({ data, columns }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

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

  const isFiltered = table.getState().columnFilters.length > 0

  const handleResetFilters = () => {
    table.resetColumnFilters()
    table.resetSorting()
  }

  const { t } = useTranslation('promotion')

  return (
    <div className='space-y-4'>
      {/* Toolbar & Filters */}
      <div className='flex flex-wrap items-center justify-between gap-4 py-2'>
        <div className='flex flex-wrap items-center gap-2 flex-1'>
          {/* Ô Tìm kiếm có icon */}
          <div className='relative w-full max-w-sm'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder={t('filters.search', 'Tìm tên chương trình...')}
              value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
              onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
              className='pl-9 bg-card'
            />
          </div>

          {/* Lọc theo Loại giảm giá */}
          <Select
            value={(table.getColumn('discountType')?.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) =>
              table.getColumn('discountType')?.setFilterValue(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className='w-[160px] bg-card'>
              <SelectValue placeholder={t('filters.discountType.label', 'Loại giảm giá')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('filters.discountType.all', 'Tất cả loại')}</SelectItem>
              {Object.values(DiscountType).map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`filters.discountType.${type}` as const)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Lọc theo Trạng thái */}
          <Select
            value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) =>
              table.getColumn('status')?.setFilterValue(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className='w-[160px] bg-card'>
              <SelectValue placeholder={t('filters.status.label', 'Trạng thái')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('filters.status.all', 'Tất cả trạng thái')}</SelectItem>
              {Object.values(PromotionStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`filters.status.${status}` as const)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Nút Reset Filter */}
          {isFiltered && (
            <Button
              variant='ghost'
              size='default'
              className='h-9 px-2 lg:px-3 text-muted-foreground hover:text-foreground'
              onClick={handleResetFilters}
            >
              {t('filters.reset', 'Đặt lại')}
              <X className='ml-2 h-4 w-4' />
            </Button>
          )}
        </div>

        {/* Cụm chức năng góc phải */}
        <div className='flex items-center gap-2'>
          <DataTableViewOptions table={table} />
          <TrashPromotionDialog />
          <CreatePromotionDialog />
        </div>
      </div>

      {/* Bảng Dữ Liệu */}
      <div className='overflow-hidden rounded-xl border bg-card shadow-sm'>
        <Table>
          <TableHeader className='bg-muted/30'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='hover:bg-transparent'>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                  className='transition-colors hover:bg-muted/40'
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
                <TableCell colSpan={columns.length} className='h-48 text-center'>
                  <div className='flex flex-col items-center justify-center text-muted-foreground'>
                    <div className='h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3'>
                      <Tag className='h-6 w-6 opacity-40' />
                    </div>
                    <span className='font-medium text-foreground'>
                      {t('table.noResults', 'Không tìm thấy dữ liệu.')}
                    </span>
                    <span className='text-sm mt-1 opacity-70'>
                      Hãy thử điều chỉnh bộ lọc hoặc tạo một chương trình mới.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Phân trang */}
      <div className='pt-2'>
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}
