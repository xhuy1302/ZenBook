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

import { CreateSupplierDialog } from '@/components/admin/data/manage-supplier/create/CreateSupplierDialog'
import { TrashSupplierDialog } from '@/components/admin/data/manage-supplier/trash/TrashSupplierDialog'
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
import { SupplierStatus } from '@/defines/supplier.enum'
import { X, Plus, Search } from 'lucide-react'

interface DataTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
}

export function DataTable<TData, TValue>({ data, columns }: DataTableProps<TData, TValue>) {
  const { t } = useTranslation('supplier')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [openCreateDialog, setOpenCreateDialog] = useState(false)

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
    state: { sorting, columnFilters, rowSelection }
  })

  // 👉 ĐÃ SỬA: Chỉ tìm cột 'name' (vì đã đổi ID ở file columns)
  const searchColumn = table.getColumn('name')

  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <>
      <div className='flex flex-wrap items-center gap-3 py-4'>
        <div className='relative max-w-sm w-full'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder={t('filters.search', 'Tìm tên nhà cung cấp...')}
            // 👉 Cập nhật lại logic searchColumn
            value={(searchColumn?.getFilterValue() as string) ?? ''}
            onChange={(event) => searchColumn?.setFilterValue(event.target.value)}
            className='pl-9'
          />
        </div>

        <Select
          value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('status')?.setFilterValue(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder={t('filters.status.label', 'Trạng thái')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('filters.status.all', 'Tất cả trạng thái')}</SelectItem>
            {Object.values(SupplierStatus)
              .filter((s) => s !== 'DELETED')
              .map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`filters.status.${status}`, status)}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button variant='ghost' className='h-9 px-3' onClick={() => table.resetColumnFilters()}>
            {t('filters.reset', 'Đặt lại')} <X className='ml-2 h-4 w-4' />
          </Button>
        )}

        <div className='flex items-center gap-2 ml-auto'>
          <DataTableViewOptions table={table} />
          <TrashSupplierDialog />
          <Button onClick={() => setOpenCreateDialog(true)}>
            <Plus className='w-4 h-4 mr-2' />
            Thêm mới
          </Button>
        </div>
      </div>

      <div className='rounded-md border bg-white shadow-sm overflow-hidden'>
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
            {table.getRowModel().rows?.length ? (
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
                  className='h-32 text-center text-muted-foreground italic'
                >
                  {t('table.noResults', 'Không tìm thấy kết quả phù hợp.')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='py-4'>
        <DataTablePagination table={table} />
      </div>

      <CreateSupplierDialog open={openCreateDialog} onOpenChange={setOpenCreateDialog} />
    </>
  )
}
