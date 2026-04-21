'use client'

// Lát nữa chúng ta sẽ tạo các file Dialog này
import { CreateNewsDialog } from '@/components/admin/data/manage-news/create/CreateNewsDialog'
import { TrashNewsDialog } from '@/components/admin/data/manage-news/trash/TrashNewsDialog'
import { DataTablePagination } from '@/components/admin/datatable/DataTablePagination'
import { DataTableViewOptions } from '@/components/admin/datatable/DataTableViewOptions'
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
import { NewsStatus } from '@/defines/news.enum'
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
import { X } from 'lucide-react'
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

  const { t } = useTranslation('news')

  return (
    <>
      <div className='flex items-center gap-2 py-4'>
        {/* Lọc theo Tiêu đề bài viết */}
        <Input
          placeholder={t('table.searchPlaceholder', 'Tìm kiếm tiêu đề bài viết...')}
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('title')?.setFilterValue(event.target.value)}
          className='max-w-sm'
        />

        {/* Lọc theo Trạng thái */}
        <Select
          value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('status')?.setFilterValue(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className='w-[160px]'>
            <SelectValue placeholder={t('table.allStatus', 'Tất cả trạng thái')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('table.allStatus', 'Tất cả trạng thái')}</SelectItem>
            {Object.values(NewsStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {t(`fields.status.options.${status}` as const, status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button size='default' className='h-8' onClick={handleResetFilters}>
            {t('common.reset', 'Làm mới')}
            <X className='ml-2 h-4 w-4' />
          </Button>
        )}

        <DataTableViewOptions table={table} />
        <TrashNewsDialog />
        <CreateNewsDialog />
      </div>

      <div className='overflow-hidden rounded-md border mb-5 bg-card'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='text-center h-24'>
                  {t('table.noResults', 'Không tìm thấy kết quả nào.')}
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
