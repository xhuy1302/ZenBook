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
import { CouponStatus, DiscountType } from '@/defines/coupon.enum'

// Import Dialog (Sẽ tạo ở bước sau)
import { CreateCouponDialog } from '@/components/admin/data/manage-coupon/create/CreateCouponDialog'
import { TrashCouponDialog } from '@/components/admin/data/manage-coupon/trash/TrashCouponDialog'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const { t } = useTranslation('coupon')
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
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          <Input
            placeholder={t('coupon.table.searchPlaceholder', 'Tìm kiếm mã Code...')}
            value={(table.getColumn('code')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('code')?.setFilterValue(event.target.value)}
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
              <SelectItem value='all'>
                {t('coupon.table.allStatus', 'Tất cả trạng thái')}
              </SelectItem>
              {Object.values(CouponStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`fields.status.options.${status}`, status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Lọc theo Loại giảm giá */}
          <Select
            value={(table.getColumn('discountType')?.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) =>
              table.getColumn('discountType')?.setFilterValue(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className='w-[160px] h-9'>
              <SelectValue placeholder={t('coupon.table.discountType', 'Loại giảm giá')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('coupon.table.allTypes', 'Tất cả loại')}</SelectItem>
              {Object.values(DiscountType).map((type) => (
                <SelectItem key={type} value={type}>
                  {t(
                    `fields.discountType.options.${type}`,
                    type === DiscountType.PERCENTAGE ? 'Giảm %' : 'Giảm tiền'
                  )}
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
          <TrashCouponDialog />
          <Button variant='default' className='gap-2 h-9' onClick={() => setOpenCreate(true)}>
            <Plus className='h-4 w-4' />
            <span className='hidden sm:inline'>{t('coupon.table.btnAdd', 'Thêm mới')}</span>
          </Button>
        </div>
      </div>

      <CreateCouponDialog open={openCreate} onOpenChange={setOpenCreate} />

      <div className='rounded-md border bg-card shadow-sm overflow-hidden'>
        <Table>
          <TableHeader className='bg-muted/50'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className='font-semibold text-center'>
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
                  className='hover:bg-muted/30 transition-colors text-center'
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
                  {t('coupon.table.noResults', 'Không tìm thấy dữ liệu phù hợp.')}
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
