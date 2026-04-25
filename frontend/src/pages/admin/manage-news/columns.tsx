'use client'

import { NewsActionsCell } from '@/components/admin/action/NewsAction'
import { NewsStatusBadge } from '@/components/admin/data/manage-news/NewsStatusBadge'
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import i18n from '@/i18n/i18n'
import { type ColumnDef } from '@tanstack/react-table'
import type { NewsResponse } from '@/services/news/news.type'
import { NewsStatus } from '@/defines/news.enum'
import { ImageIcon } from 'lucide-react'

// 👉 ĐỔI THÀNH HÀM getColumns VÀ NHẬN THÊM PARAM onEdit
export const getColumns = (onEdit: (news: NewsResponse) => void): ColumnDef<NewsResponse>[] => [
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
    id: 'title',
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
          <div className='h-12 w-16 shrink-0 overflow-hidden rounded border bg-slate-50 shadow-sm'>
            {news.thumbnail ? (
              <img
                src={news.thumbnail}
                alt={news.title}
                className='h-full w-full object-cover'
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/600x400?text=No+Image'
                }}
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center text-slate-300'>
                <ImageIcon className='h-5 w-5' />
              </div>
            )}
          </div>
          <div className='flex flex-col max-w-[280px] overflow-hidden'>
            <span className='font-bold text-slate-800 leading-snug truncate' title={news.title}>
              {news.title}
            </span>
            <span className='text-[10px] text-slate-400 mt-1 font-mono truncate'>
              /{news.slug || 'no-slug'}
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
      <div className='text-sm font-medium'>
        {row.getValue('categoryName') || (
          <span className='text-slate-400 italic font-normal text-xs'>Chưa phân loại</span>
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
      <div className='text-sm text-slate-600'>
        {row.getValue('authorName') || <span className='text-slate-300'>---</span>}
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
      <div className='text-sm font-bold text-indigo-600'>
        {Number(row.getValue('viewCount')).toLocaleString() || 0}
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
    cell: ({ row }) => (
      <div className='w-[100px]'>
        <NewsStatusBadge status={row.getValue('status') as NewsStatus} />
      </div>
    )
  },
  {
    id: 'actions',
    header: () => (
      <div className='text-center'>{i18n.t('news:table.columns.actions', 'Thao tác')}</div>
    ),
    cell: ({ row }) => (
      // 👉 TRUYỀN onEdit XUỐNG COMPONENT ACTION
      <NewsActionsCell news={row.original} onEdit={() => onEdit(row.original)} />
    ),
    enableSorting: false,
    enableHiding: false
  }
]
