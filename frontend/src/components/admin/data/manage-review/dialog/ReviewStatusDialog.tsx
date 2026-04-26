'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ShieldCheck } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { updateReviewStatusApi } from '@/services/review/review.api'
import type { ReviewStatus } from '@/defines/review.enum'
import type { ReviewStatusFormValues } from '../schema/ReviewStatus.schema'
import { ReviewStatusForm } from '../form/ReviewStatusForm'

interface ReviewStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  review: {
    id: string
    currentStatus: ReviewStatus
    userFullName: string
    userAvatar?: string
    title?: string
    rating: number
  } | null
  onSuccess?: () => void
}

// Sửa object STATUS_LABEL thành:
const STATUS_LABEL: Record<ReviewStatus, string> = {
  PENDING: 'Chờ duyệt / Đã ẩn',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối'
}

export function ReviewStatusDialog({
  open,
  onOpenChange,
  review,
  onSuccess
}: ReviewStatusDialogProps) {
  const queryClient = useQueryClient()

  const statusMutation = useMutation({
    mutationFn: (values: ReviewStatusFormValues) =>
      updateReviewStatusApi(review!.id, { status: values.status }),
    onSuccess: (_, variables) => {
      toast.success('Đã cập nhật trạng thái', {
        description: `Đánh giá đã được chuyển sang "${STATUS_LABEL[variables.status]}".`
      })
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['admin-review-detail', review?.id] })
      onSuccess?.()
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Không thể cập nhật trạng thái', {
        description: 'Đã xảy ra lỗi. Vui lòng thử lại.'
      })
    }
  })

  const handleSubmit = (values: ReviewStatusFormValues) => {
    statusMutation.mutate(values)
  }

  if (!review) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-base font-semibold text-slate-800'>
            <ShieldCheck className='h-4 w-4 text-blue-500' />
            Kiểm duyệt đánh giá
          </DialogTitle>
          <DialogDescription className='text-xs text-slate-500'>
            Chọn trạng thái mới cho đánh giá bên dưới.
          </DialogDescription>
        </DialogHeader>

        {/* Review preview card */}
        <div className='flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100'>
          <Avatar className='h-9 w-9 shrink-0'>
            <AvatarImage src={review.userAvatar} />
            <AvatarFallback className='text-xs font-semibold bg-blue-100 text-blue-600'>
              {review.userFullName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <p className='text-xs font-semibold text-slate-700 truncate'>{review.userFullName}</p>
            {review.title && (
              <p className='text-xs text-slate-500 mt-0.5 truncate'>{review.title}</p>
            )}
            <div className='flex items-center gap-1 mt-1'>
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-xs ${i < review.rating ? 'text-amber-400' : 'text-slate-200'}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        <ReviewStatusForm
          currentStatus={review.currentStatus}
          isLoading={statusMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
