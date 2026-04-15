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
  useReactTable,
  type VisibilityState
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
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { X, Plus } from 'lucide-react'

import { DataTablePagination } from '@/components/admin/datatable/DataTablePagination'
import { DataTableViewOptions } from '@/components/admin/datatable/DataTableViewOptions'
// 👉 CẬP NHẬT: Import thêm BookFormat
import { BookStatus, BookFormat } from '@/defines/book.enum'

import { CreateBookDialog } from '@/components/admin/data/manage-book/create/CreateBookDialog'
import { TrashBookDialog } from '@/components/admin/data/manage-book/trash/TrashBookDialog'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const { t } = useTranslation('product')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [openCreate, setOpenCreate] = useState(false)

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  })

  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        {/* 👉 CẬP NHẬT: Thêm flex-wrap để layout không bị vỡ trên màn hình nhỏ */}
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          <Input
            placeholder={t('book.table.searchPlaceholder', 'Tìm kiếm tên sách...')}
            value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('title')?.setFilterValue(event.target.value)}
            className='h-9 w-full sm:w-[250px] lg:w-[300px]'
          />

          {/* Lọc theo Trạng thái */}
          <Select
            value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) =>
              table.getColumn('status')?.setFilterValue(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className='w-[140px] h-9'>
              <SelectValue placeholder={t('common.status', 'Trạng thái')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('book.table.allStatus', 'Tất cả trạng thái')}</SelectItem>
              {Object.values(BookStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`fields.status.options.${status}`, status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 👉 CẬP NHẬT: Thêm bộ lọc theo Định dạng sách */}
          <Select
            value={(table.getColumn('format')?.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) =>
              table.getColumn('format')?.setFilterValue(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className='w-[150px] h-9'>
              <SelectValue placeholder={t('book.form.format', 'Định dạng')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('book.table.allFormat', 'Tất cả định dạng')}</SelectItem>
              {Object.values(BookFormat).map((format) => (
                <SelectItem key={format} value={format}>
                  {t(`fields.format.options.${format}`, format)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isFiltered && (
            <Button
              variant='ghost'
              onClick={() => table.resetColumnFilters()}
              className='h-9 px-2 lg:px-3 text-muted-foreground hover:text-foreground'
            >
              {t('common.reset', 'Bỏ lọc')}
              <X className='ml-2 h-4 w-4' />
            </Button>
          )}
        </div>

        <div className='flex items-center gap-2 self-end sm:self-auto'>
          <DataTableViewOptions table={table} />
          <TrashBookDialog />
          <Button variant='default' className='gap-2 h-9' onClick={() => setOpenCreate(true)}>
            <Plus className='h-4 w-4' />
            <span className='hidden sm:inline'>{t('book.table.btnAdd', 'Thêm mới')}</span>
          </Button>
        </div>
      </div>

      <CreateBookDialog open={openCreate} onOpenChange={setOpenCreate} />

      <div className='rounded-md border bg-card shadow-sm overflow-hidden'>
        <Table>
          <TableHeader className='bg-muted/50'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className='font-semibold'>
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
                  className='hover:bg-muted/30 transition-colors'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-32 text-center text-muted-foreground'
                >
                  {t('book.table.noResults', 'Không tìm thấy dữ liệu phù hợp.')}
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
