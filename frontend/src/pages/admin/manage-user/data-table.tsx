// import { CreateUserDialog } from '@/components/admin/data/manage-user/CreateUserDialog'
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

  const { t } = useTranslation('user')

  return (
    <>
      <div className='flex items-center gap-2 py-4'>
        <Input
          placeholder={t('filters.search')}
          value={(table.getColumn('user')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('user')?.setFilterValue(event.target.value)}
          className='max-w-sm'
        />
        <Select
          value={(table.getColumn('roles')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('roles')?.setFilterValue(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className='w-[150px]'>
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
        <Select
          value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('status')?.setFilterValue(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className='w-[160px]'>
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
          <Button size='default' className='h-8' onClick={handleResetFilters}>
            {t('filters.reset')}
            <X />
          </Button>
        )}

        <DataTableViewOptions table={table} />
        {/* <CreateUserDialog /> */}
        <TrashUserDialog />
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
                <TableCell colSpan={columns.length} className='text-center'>
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
