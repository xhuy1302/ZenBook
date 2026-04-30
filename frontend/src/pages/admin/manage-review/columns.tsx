'use client'

import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import i18n from '@/i18n/i18n'
import { type ColumnDef } from '@tanstack/react-table'
import type { ReviewSummaryResponse } from '@/services/review/review.type'
import { ReviewStatusBadge } from '@/components/admin/data/manage-review/ReviewStatusBadge'
import { ReviewActionsCell } from '@/components/admin/action/ReviewAction'
import { Star, ImageIcon, MessageCircleReply } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function createColumns(
  viewedReviews: Set<string>,
  onViewDetail: (reviewId: string) => void
): ColumnDef<ReviewSummaryResponse>[] {
  return [
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
      accessorKey: 'contentSnippet',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('review:table.columns.review')} />
      ),
      cell: ({ row }) => {
        const review = row.original
        const isNotViewed = !viewedReviews.has(review.id)

        return (
          <div className='flex flex-col gap-1.5 py-1 min-w-[250px] max-w-[300px] overflow-hidden'>
            <div className='flex items-center gap-1'>
              {/* Dấu chấm xanh nếu chưa xem */}
              {isNotViewed && (
                <span className='inline-block h-2 w-2 rounded-full bg-green-500 mr-1' />
              )}
              <div className='flex items-center gap-1 text-yellow-500'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            <span className='text-sm font-medium text-foreground line-clamp-2 break-words'>
              {review.contentSnippet}
            </span>
            <div className='flex items-center gap-2 mt-1'>
              {review.hasImages && (
                <Badge variant='secondary' className='h-5 text-[10px]'>
                  <ImageIcon className='h-3 w-3 mr-1' /> Ảnh
                </Badge>
              )}
              {review.isReplied && (
                <Badge variant='secondary' className='h-5 text-[10px] bg-blue-50 text-blue-600'>
                  <MessageCircleReply className='h-3 w-3 mr-1' /> Đã trả lời
                </Badge>
              )}
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'bookTitle',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('review:table.columns.book')} />
      ),
      cell: ({ row }) => {
        const review = row.original
        return (
          <div className='flex items-center gap-3 py-1 max-w-[250px]'>
            <img
              src={review.bookThumbnail || 'https://placehold.co/100x150'}
              alt='book'
              className='h-12 w-9 rounded object-cover border shadow-sm'
            />
            <span className='text-xs font-semibold leading-tight line-clamp-2 text-foreground'>
              {review.bookTitle}
            </span>
          </div>
        )
      }
    },
    {
      accessorKey: 'userFullName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('review:table.columns.user')} />
      ),
      cell: ({ row }) => {
        const review = row.original
        return (
          <div className='flex items-center gap-2 py-1'>
            <img
              src={review.userAvatar || 'https://ui.shadcn.com/avatars/02.png'}
              alt='avatar'
              className='h-8 w-8 rounded-full object-cover border'
            />
            <span className='text-sm font-medium text-foreground whitespace-nowrap'>
              {review.userFullName}
            </span>
          </div>
        )
      }
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('review:table.columns.status')} />
      ),
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true
        return row.getValue(columnId) === filterValue
      },
      cell: ({ row }) => (
        <div className='w-[100px]'>
          <ReviewStatusBadge status={row.getValue('status')} />
        </div>
      )
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('review:table.columns.createdAt')} />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'))
        return (
          <div className='text-xs text-muted-foreground'>{date.toLocaleDateString('vi-VN')}</div>
        )
      }
    },
    {
      id: 'actions',
      header: () => <div className='text-center'>{i18n.t('review:table.columns.actions')}</div>,
      cell: ({ row }) => <ReviewActionsCell review={row.original} onViewDetail={onViewDetail} />,
      enableSorting: false,
      enableHiding: false
    }
  ]
}

// Export columns mặc định (chỉ dùng tạm nếu cần, không khuyến khích vì không có callback)
export const columns = createColumns(new Set(), () => {})
