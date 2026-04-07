import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import type { TFunction } from 'i18next'
import type { ReceiptResponse } from '@/services/receipt/receipt.type'
import { ReceiptStatusBadge } from '@/components/admin/data/manage-receipt/ReceiptStatusBadge'
import { ReceiptActionsCell } from '@/components/admin/action/ReceiptAction'
import { format } from 'date-fns'

export const getColumns = (t: TFunction<'receipt'>): ColumnDef<ReceiptResponse>[] => [
  {
    accessorKey: 'receiptCode',
    header: ({ column }) => (
      // Căn giữa header
      <DataTableColumnHeader
        column={column}
        title={t('table.code', 'Mã phiếu')}
        className='justify-center'
      />
    ),
    cell: ({ row }) => (
      // Căn giữa dữ liệu
      <div className='text-center font-semibold text-primary whitespace-nowrap'>
        {row.original.receiptCode}
      </div>
    )
  },
  {
    accessorKey: 'supplierName',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('table.supplier', 'Nhà cung cấp')}
        className='justify-center'
      />
    ),
    cell: ({ row }) => (
      // Thêm mx-auto để phần truncate nếu có cũng nằm giữa
      <div
        className='text-center mx-auto max-w-[200px] lg:max-w-[250px] truncate font-medium'
        title={row.original.supplierName}
      >
        {row.original.supplierName}
      </div>
    )
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('table.date', 'Ngày tạo')}
        className='justify-center'
      />
    ),
    cell: ({ row }) => (
      <div className='text-center text-muted-foreground whitespace-nowrap'>
        {format(new Date(row.original.createdAt), 'dd/MM/yyyy HH:mm')}
      </div>
    )
  },
  {
    accessorKey: 'creatorName',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('receipt.table.creator', 'Người nhập')}
        className='justify-center'
      />
    ),
    cell: ({ row }) => (
      <div className='text-center mx-auto max-w-[150px] truncate text-sm text-muted-foreground'>
        {row.original.creatorName || row.original.creatorId || t('common.na', 'N/A')}
      </div>
    )
  },
  {
    accessorKey: 'totalAmount',
    // Cột tiền giữ nguyên căn phải (justify-end / text-right)
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('table.totalAmount', 'Tổng tiền')}
        className='justify-end'
      />
    ),
    cell: ({ row }) => (
      <div className='text-right font-medium text-orange-600 whitespace-nowrap'>
        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
          row.original.totalAmount
        )}
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('table.status', 'Trạng thái')}
        className='justify-center'
      />
    ),
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <ReceiptStatusBadge status={row.original.status} />
      </div>
    )
  },
  {
    id: 'actions',
    header: () => (
      <div className='text-center text-sm font-medium text-muted-foreground'>
        {t('table.action', 'Thao tác')}
      </div>
    ),
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <ReceiptActionsCell receipt={row.original} />
      </div>
    )
  }
]
