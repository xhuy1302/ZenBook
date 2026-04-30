'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import {
  Eye,
  CheckCircle,
  EyeOff,
  XCircle,
  MessageSquare,
  MessageSquarePlus,
  MoreHorizontal
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { ReviewStatus } from '@/defines/review.enum'
import type { ReviewSummaryResponse } from '@/services/review/review.type'

import { ReviewDetailDialog } from '@/components/admin/data/manage-review/dialog/ReviewDetailDialog'
import { ReviewStatusDialog } from '@/components/admin/data/manage-review/dialog/ReviewStatusDialog'
import { ReviewReplyDialog } from '@/components/admin/data/manage-review/dialog/ReviewReplyDialog'

type ActiveDialog = 'detail' | 'status' | 'reply' | null

interface ReviewActionsCellProps {
  review: ReviewSummaryResponse
  onViewDetail?: (id: string) => void
}

export const ReviewActionsCell = ({ review, onViewDetail }: ReviewActionsCellProps) => {
  const { t } = useTranslation('review')
  const queryClient = useQueryClient()
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null)

  const close = () => setActiveDialog(null)

  const handleSuccess = () => {
    // Key 'admin-reviews' khớp với key sử dụng trong page
    queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
    close()
  }

  const canApprove = review.status !== ReviewStatus.APPROVED
  const canHide = review.status !== ReviewStatus.PENDING
  const canReject = review.status !== ReviewStatus.REJECTED

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Mở menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end' className='w-[200px]'>
          <DropdownMenuLabel className='text-xs font-semibold text-slate-500'>
            {t('table.columns.actions')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              onViewDetail?.(review.id) // Đánh dấu đã xem
              setActiveDialog('detail')
            }}
          >
            <Eye className='mr-2 h-4 w-4 text-blue-500' />
            {t('actions.view', 'Xem chi tiết')}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {canApprove && (
            <DropdownMenuItem onClick={() => setActiveDialog('status')}>
              <CheckCircle className='mr-2 h-4 w-4 text-emerald-500' />
              {t('actions.approve', 'Phê duyệt')}
            </DropdownMenuItem>
          )}

          {canHide && (
            <DropdownMenuItem onClick={() => setActiveDialog('status')}>
              <EyeOff className='mr-2 h-4 w-4 text-amber-500' />
              Ẩn đánh giá
            </DropdownMenuItem>
          )}

          {canReject && (
            <DropdownMenuItem onClick={() => setActiveDialog('status')}>
              <XCircle className='mr-2 h-4 w-4 text-red-500' />
              {t('actions.reject', 'Từ chối')}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setActiveDialog('reply')}
            disabled={review.isReplied}
            className={review.isReplied ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {review.isReplied ? (
              <>
                <MessageSquare className='mr-2 h-4 w-4 text-slate-400' />
                <span className='text-slate-400'>Đã phản hồi</span>
              </>
            ) : (
              <>
                <MessageSquarePlus className='mr-2 h-4 w-4 text-purple-500' />
                {t('actions.reply', 'Phản hồi khách hàng')}
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {activeDialog === 'detail' && (
        <ReviewDetailDialog
          reviewId={review.id}
          open={activeDialog === 'detail'}
          onOpenChange={(open) => !open && close()}
          onStatusChange={handleSuccess}
        />
      )}

      {activeDialog === 'status' && (
        <ReviewStatusDialog
          open={activeDialog === 'status'}
          onOpenChange={(open) => !open && close()}
          review={{
            id: review.id,
            currentStatus: review.status,
            userFullName: review.userFullName,
            userAvatar: review.userAvatar,
            title: review.title,
            rating: review.rating
          }}
          onSuccess={handleSuccess}
        />
      )}

      {activeDialog === 'reply' && (
        <ReviewReplyDialog
          open={activeDialog === 'reply'}
          onOpenChange={(open) => !open && close()}
          reviewId={review.id}
          existingReply={null}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
