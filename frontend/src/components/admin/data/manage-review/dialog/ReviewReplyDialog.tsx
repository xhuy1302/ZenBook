'use client'

import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MessageSquarePlus, Pencil } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

import { replyToReviewApi, updateReplyApi } from '@/services/review/review.api'
import type { ReviewReplyFormValues } from '../schema/ReviewReply.schema'
import { ReviewReplyForm } from '../form/ReviewReplyForm'

interface ReviewReplyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reviewId: string
  existingReply: { id: string; content: string } | null
  onSuccess?: () => void
}

export function ReviewReplyDialog({
  open,
  onOpenChange,
  reviewId,
  existingReply,
  onSuccess
}: ReviewReplyDialogProps) {
  const { t } = useTranslation('review')
  const queryClient = useQueryClient()

  // Biến cờ kiểm tra xem đang là Tạo mới hay Chỉnh sửa
  const isEditing = !!existingReply

  // Mutation cho Tạo mới phản hồi
  const createMutation = useMutation({
    mutationFn: (values: ReviewReplyFormValues) => replyToReviewApi(reviewId, values),
    onSuccess: () => {
      toast.success('Gửi phản hồi thành công!', {
        description: 'Khách hàng sẽ nhìn thấy phản hồi này trên trang sản phẩm.'
      })
      handleSuccessAction()
    },
    onError: () => {
      toast.error('Có lỗi xảy ra', {
        description: 'Không thể gửi phản hồi. Có thể bài đánh giá này đã được phản hồi rồi.'
      })
    }
  })

  // Mutation cho Cập nhật phản hồi
  const updateMutation = useMutation({
    mutationFn: (values: ReviewReplyFormValues) => updateReplyApi(existingReply!.id, values),
    onSuccess: () => {
      toast.success('Cập nhật phản hồi thành công!')
      handleSuccessAction()
    },
    onError: () => {
      toast.error('Có lỗi xảy ra', {
        description: 'Không thể cập nhật phản hồi lúc này.'
      })
    }
  })

  // Hàm xử lý chung khi API thành công
  const handleSuccessAction = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
    queryClient.invalidateQueries({ queryKey: ['admin-review-detail', reviewId] })
    onSuccess?.()
    onOpenChange(false)
  }

  // Hàm submit Form
  const handleSubmit = (values: ReviewReplyFormValues) => {
    if (isEditing) {
      updateMutation.mutate(values)
    } else {
      createMutation.mutate(values)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-base font-semibold text-slate-800'>
            {isEditing ? (
              <Pencil className='h-4 w-4 text-blue-500' />
            ) : (
              <MessageSquarePlus className='h-4 w-4 text-purple-500' />
            )}
            {isEditing ? 'Chỉnh sửa phản hồi' : t('dialog.reply.title')}
          </DialogTitle>
          <DialogDescription className='text-xs text-slate-500'>
            {isEditing
              ? 'Chỉnh sửa nội dung phản hồi. Thay đổi sẽ được cập nhật công khai.'
              : t('dialog.reply.desc')}
          </DialogDescription>
        </DialogHeader>

        <div className='mt-2'>
          <ReviewReplyForm
            defaultValues={existingReply ? { content: existingReply.content } : undefined}
            isEditing={isEditing}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
