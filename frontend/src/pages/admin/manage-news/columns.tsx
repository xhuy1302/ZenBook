'use client'

import { NewsActionsCell } from '@/components/admin/action/NewsAction'
import { NewsStatusBadge } from '@/components/admin/data/manage-news/NewsStatusBadge'
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import i18n from '@/i18n/i18n'
import { type ColumnDef } from '@tanstack/react-table'
import type { NewsResponse } from '@/services/news/news.type'
import type { NewsStatus } from '@/defines/news.enum'
import { ImageIcon } from 'lucide-react'

export const columns: ColumnDef<NewsResponse>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className='pl-2'>
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className='pl-2'>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    id: 'title', // Dùng làm key để search trong data-table
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('news:table.columns.title', 'Bài viết')}
      />
    ),
    cell: ({ row }) => {
      const news = row.original

      return (
        <div className='flex items-center gap-3 py-1'>
          {news.thumbnail ? (
            <img
              src={news.thumbnail}
              alt={news.title}
              className='h-12 w-16 rounded object-cover border shadow-sm shrink-0'
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/600x400?text=No+Image'
              }}
            />
          ) : (
            <div className='h-12 w-16 bg-muted rounded flex items-center justify-center border shrink-0 text-muted-foreground'>
              <ImageIcon className='w-5 h-5' />
            </div>
          )}

          <div className='flex flex-col max-w-[300px]'>
            <span
              className='font-semibold leading-tight text-foreground truncate'
              title={news.title}
            >
              {news.title}
            </span>
            <span className='text-[11px] text-muted-foreground mt-1 truncate' title={news.slug}>
              /{news.slug}
            </span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'categoryName',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('news:table.columns.category', 'Danh mục')}
      />
    ),
    cell: ({ row }) => (
      <div className='text-sm text-foreground'>
        {row.getValue('categoryName') || (
          <span className='text-muted-foreground italic'>Chưa phân loại</span>
        )}
      </div>
    )
  },
  {
    accessorKey: 'authorName',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('news:table.columns.author', 'Tác giả')}
      />
    ),
    cell: ({ row }) => (
      <div className='text-sm text-foreground'>
        {row.getValue('authorName') || <span className='text-muted-foreground'>---</span>}
      </div>
    )
  },
  {
    accessorKey: 'viewCount',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('news:table.columns.views', 'Lượt xem')}
      />
    ),
    cell: ({ row }) => (
      <div className='text-sm font-medium text-foreground text-center'>
        {row.getValue('viewCount')}
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('news:table.columns.status', 'Trạng thái')}
      />
    ),
    filterFn: (row, columnId, filterValue) => {
      const status = row.getValue(columnId) as string
      if (!filterValue) return true
      return status === filterValue
    },
    cell: ({ row }) => (
      <div className='w-[100px] flex justify-center'>
        <NewsStatusBadge status={row.getValue('status') as NewsStatus} />
      </div>
    )
  },
  {
    id: 'actions',
    header: () => (
      <div className='text-center'>{i18n.t('news:table.columns.actions', 'Thao tác')}</div>
    ),
    cell: ({ row }) => <NewsActionsCell news={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
