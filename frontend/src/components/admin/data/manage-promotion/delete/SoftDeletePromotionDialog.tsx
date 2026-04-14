'use client'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { softDeletePromotionApi } from '@/services/promotion/promotion.api'
import type { PromotionResponse } from '@/services/promotion/promotion.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface SoftDeletePromotionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotion: PromotionResponse | null
}

export function SoftDeletePromotionDialog({
  open,
  onOpenChange,
  promotion
}: SoftDeletePromotionDialogProps) {
  const { t } = useTranslation('promotion')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: string) => softDeletePromotionApi(id),
    onSuccess: () => {
      toast.success(t('message.success.delete', 'Đã chuyển chương trình vào thùng rác!'))
      // Cập nhật lại cả bảng danh sách và bảng thùng rác
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
      queryClient.invalidateQueries({ queryKey: ['promotions-trash'] })
      onOpenChange(false)
    },
    onError: () => {
      toast.error(t('message.error.delete', 'Có lỗi xảy ra khi xóa!'))
    }
  })

  if (!promotion) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2 text-destructive'>
            <Trash2 className='w-5 h-5' />
            {t('dialogTitle.delete', 'Xác nhận xóa khuyến mãi')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa chương trình{' '}
            <strong className='text-foreground'>{promotion.name}</strong>?
            <br />
            Chương trình này sẽ được tạm dừng và chuyển vào <strong>Thùng rác</strong>. Bạn vẫn có
            thể khôi phục lại sau này.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            {t('actions.cancel', 'Hủy')}
          </AlertDialogCancel>
          <Button
            variant='destructive'
            onClick={() => mutation.mutate(promotion.id)}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
            {t('actions.delete', 'Chuyển vào thùng rác')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
