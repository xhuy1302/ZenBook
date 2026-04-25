'use client'

import { useState } from 'react'
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
  useReactTable
} from '@tanstack/react-table'
import { X, Search } from 'lucide-react'

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

interface DataTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
}

export function DataTable<TData, TValue>({ data, columns }: DataTableProps<TData, TValue>) {
  const { t } = useTranslation('news')
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

  return (
    <>
      <div className='flex flex-wrap items-center gap-3 py-4'>
        {/* Ô tìm kiếm tiêu đề */}
        <div className='relative max-w-sm w-full'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder={t('table.searchPlaceholder', 'Tìm kiếm tiêu đề bài viết...')}
            value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('title')?.setFilterValue(event.target.value)}
            className='pl-9'
          />
        </div>

        {/* Lọc trạng thái */}
        <Select
          value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('status')?.setFilterValue(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder={t('table.allStatus', 'Tất cả trạng thái')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('table.allStatus', 'Tất cả trạng thái')}</SelectItem>
            {Object.values(NewsStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {t(`fields.status.options.${status}`, status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button variant='ghost' className='h-9 px-3' onClick={() => table.resetColumnFilters()}>
            {t('common.reset', 'Làm mới')}
            <X className='ml-2 h-4 w-4' />
          </Button>
        )}

        <div className='flex items-center gap-2 ml-auto'>
          <DataTableViewOptions table={table} />
          <TrashNewsDialog />
          {/* CreateNewsDialog đã được chuyển ra NewsPage.tsx nên ở đây không cần nữa */}
        </div>
      </div>

      <div className='rounded-md border bg-white shadow-sm overflow-hidden mb-5'>
        <Table>
          <TableHeader className='bg-slate-50/50'>
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
                  className='text-center h-32 text-muted-foreground italic'
                >
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
