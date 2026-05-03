import { TrashUserDialog } from '@/components/admin/data/manage-user/trash/TrashUserDialog'
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
import { UserRole, UserStatus } from '@/defines/user.enum'
import { MemberTier } from '@/defines/enum.membership'
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
import { X, Filter } from 'lucide-react'
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
    state: { sorting, columnFilters, rowSelection }
  })

  const isFiltered = table.getState().columnFilters.length > 0
  const { t } = useTranslation('user')

  return (
    <>
      <div className='flex flex-wrap items-center gap-2 py-4'>
        <Input
          placeholder={t('filters.search')}
          value={(table.getColumn('user')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('user')?.setFilterValue(event.target.value)}
          className='max-w-xs'
        />

        {/* Lọc Hạng */}
        <Select
          value={(table.getColumn('tier')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) => table.getColumn('tier')?.setFilterValue(value)}
        >
          <SelectTrigger className='w-[140px]'>
            <Filter className='mr-2 h-4 w-4 text-muted-foreground' />
            <SelectValue placeholder='Hạng' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả hạng</SelectItem>
            {Object.values(MemberTier).map((tier) => (
              <SelectItem key={tier} value={tier}>
                {tier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Lọc Role */}
        <Select
          value={(table.getColumn('roles')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('roles')?.setFilterValue(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className='w-[140px]'>
            <SelectValue placeholder={t('filters.role.label')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('filters.role.all')}</SelectItem>
            {Object.values(UserRole).map((role) => (
              <SelectItem key={role} value={role}>
                {t(`filters.role.${role}` as const)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Lọc Status */}
        <Select
          value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('status')?.setFilterValue(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className='w-[140px]'>
            <SelectValue placeholder={t('filters.status.label')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('filters.status.all')}</SelectItem>
            {Object.values(UserStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {t(`filters.status.${status}` as const)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button
            variant='ghost'
            className='h-8 px-2 lg:px-3'
            onClick={() => table.resetColumnFilters()}
          >
            {t('filters.reset')}
            <X className='ml-2 h-4 w-4' />
          </Button>
        )}

        <div className='ml-auto flex items-center gap-2'>
          <DataTableViewOptions table={table} />
          <TrashUserDialog />
        </div>
      </div>

      <div className='overflow-hidden rounded-md border mb-5'>
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
                <TableCell colSpan={columns.length} className='h-24 text-center'>
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
