import { type ColumnDef } from '@tanstack/react-table'
import { BookStatusBadge } from '@/components/admin/data/manage-book/BookStatusBadge'
// 👉 THÊM MỚI: Import thêm component badge cho Format
import { BookFormatBadge } from '@/components/admin/data/manage-book/BookFormatBadge'
import { BookActionsCell } from '@/components/admin/action/BookAction'
import type { BookResponse } from '@/services/book/book.type'
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import type { TFunction } from 'i18next'

export const getColumns = (t: TFunction<'product'>): ColumnDef<BookResponse>[] => [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('book.table.bookInfo')} />
    ),
    cell: ({ row }) => {
      const book = row.original
      return (
        <div className='flex items-center gap-3 py-1'>
          <img
            src={
              book.thumbnail ||
              'https://zenbook-s3.s3.ap-southeast-2.amazonaws.com/books/Book-default.png'
            }
            alt={book.title}
            className='h-12 w-9 rounded object-cover border shadow-sm'
          />
          <div className='flex flex-col'>
            <span className='font-semibold leading-none text-foreground'>{book.title}</span>
            <span className='text-[11px] text-muted-foreground mt-1.5'>
              ISBN: {book.isbn || t('common.na')}
            </span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'salePrice',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('book.table.salePrice')} />
    ),
    cell: ({ row }) => {
      const { salePrice, originalPrice } = row.original
      return (
        <div className='flex flex-col justify-center'>
          {originalPrice > salePrice && (
            <span className='text-xs text-muted-foreground line-through'>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                originalPrice
              )}
            </span>
          )}
          <span className='font-medium text-orange-600'>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
              salePrice
            )}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'stockQuantity',
    header: () => <div className='text-center'>{t('book.table.stock')}</div>,
    cell: ({ row }) => <div className='text-center font-medium'>{row.original.stockQuantity}</div>
  },

  {
    accessorKey: 'format',
    header: () => <div className='text-center'>{t('book.form.format', 'Định dạng')}</div>,
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <BookFormatBadge format={row.original.format} />
      </div>
    )
  },

  {
    accessorKey: 'status',
    header: () => <div className='text-center'>{t('book.table.status')}</div>,
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <BookStatusBadge status={row.original.status} />
      </div>
    )
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>{t('book.table.action')}</div>,
    cell: ({ row }) => <BookActionsCell book={row.original} />
  }
]
