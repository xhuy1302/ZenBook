'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { MessageSquarePlus, Pencil, Trash2, AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'

import { deleteReplyApi } from '@/services/review/review.api'
import type { ReviewDetailResponse } from '@/services/review/review.type'
import { ReviewReplyDialog } from './ReviewReplyDialog'

type ExistingReply = NonNullable<ReviewDetailResponse['reply']>

interface ReviewReplySectionProps {
  reviewId: string
  existingReply: ExistingReply | null
  onSuccess?: () => void
}

export function ReviewReplySection({
  reviewId,
  existingReply,
  onSuccess
}: ReviewReplySectionProps) {
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => deleteReplyApi(existingReply!.id),
    onSuccess: () => {
      toast.success('Đã xoá phản hồi')
      queryClient.invalidateQueries({ queryKey: ['admin-review-detail', reviewId] })
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      onSuccess?.()
    },
    onError: () => {
      toast.error('Không thể xoá phản hồi', { description: 'Vui lòng thử lại sau.' })
    }
  })

  if (!existingReply) {
    return (
      <>
        <div className='flex flex-col items-center gap-3 py-6 border-2 border-dashed border-slate-200 rounded-xl'>
          <MessageSquarePlus className='h-8 w-8 text-slate-300' />
          <div className='text-center'>
            <p className='text-sm font-medium text-slate-500'>Chưa có phản hồi</p>
            <p className='text-xs text-slate-400 mt-0.5'>
              Phản hồi sẽ hiển thị công khai dưới đánh giá của khách
            </p>
          </div>
          <Button
            size='sm'
            onClick={() => setReplyDialogOpen(true)}
            className='h-8 px-4 text-sm bg-blue-600 hover:bg-blue-700 text-white gap-1.5'
          >
            <MessageSquarePlus className='h-3.5 w-3.5' />
            Viết phản hồi
          </Button>
        </div>

        <ReviewReplyDialog
          open={replyDialogOpen}
          onOpenChange={setReplyDialogOpen}
          reviewId={reviewId}
          existingReply={null} // 👉 THÊM DÒNG NÀY VÀO LÀ XONG
          onSuccess={onSuccess}
        />
      </>
    )
  }

  return (
    <>
      <div className='rounded-xl bg-blue-50 border border-blue-100 p-4 space-y-3'>
        {/* Reply header */}
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-blue-700'>
              {existingReply.repliedBy.fullName}
            </p>
            <p className='text-[11px] text-blue-400 mt-0.5'>
              {format(
                new Date(existingReply.updatedAt || existingReply.createdAt),
                'dd/MM/yyyy HH:mm',
                {
                  locale: vi
                }
              )}
              {existingReply.updatedAt !== existingReply.createdAt && ' (đã chỉnh sửa)'}
            </p>
          </div>
          {/* Actions */}
          <div className='flex items-center gap-1.5'>
            <Button
              size='icon'
              variant='ghost'
              className='h-7 w-7 text-blue-500 hover:text-blue-700 hover:bg-blue-100'
              onClick={() => setReplyDialogOpen(true)}
            >
              <Pencil className='h-3.5 w-3.5' />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size='icon'
                  variant='ghost'
                  className='h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50'
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className='h-3.5 w-3.5' />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className='flex items-center gap-2'>
                    <AlertTriangle className='h-4 w-4 text-red-500' />
                    Xoá phản hồi?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này không thể hoàn tác. Phản hồi sẽ bị xoá vĩnh viễn khỏi hệ thống và
                    khách hàng sẽ không thấy nữa.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Huỷ</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate()}
                    className='bg-red-600 hover:bg-red-700 focus:ring-red-600'
                  >
                    {deleteMutation.isPending ? 'Đang xoá...' : 'Xoá phản hồi'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Reply content */}
        <p className='text-sm text-slate-700 leading-relaxed whitespace-pre-wrap'>
          {existingReply.content}
        </p>
      </div>

      <ReviewReplyDialog
        open={replyDialogOpen}
        onOpenChange={setReplyDialogOpen}
        reviewId={reviewId}
        existingReply={null} // 👉 THÊM DÒNG NÀY VÀO LÀ XONG
        onSuccess={onSuccess}
      />
    </>
  )
}
