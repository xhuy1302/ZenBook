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
import { hardDeletePromotionApi } from '@/services/promotion/promotion.api'
import type { PromotionResponse } from '@/services/promotion/promotion.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, AlertOctagon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface HardDeletePromotionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotion: PromotionResponse | null
}

export function HardDeletePromotionDialog({
  open,
  onOpenChange,
  promotion
}: HardDeletePromotionDialogProps) {
  const { t } = useTranslation('promotion')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: string) => hardDeletePromotionApi(id),
    onSuccess: () => {
      toast.success(t('message.success.hardDelete', 'Đã xóa vĩnh viễn chương trình!'))
      // Chỉ cần load lại bảng thùng rác
      queryClient.invalidateQueries({ queryKey: ['promotions-trash'] })
      onOpenChange(false)
    },
    onError: () => {
      toast.error(t('message.error.hardDelete', 'Có lỗi xảy ra khi xóa vĩnh viễn!'))
    }
  })

  if (!promotion) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2 text-destructive'>
            <AlertOctagon className='w-5 h-5' />
            {t('dialogTitle.hardDelete', 'Cảnh báo: Xóa vĩnh viễn')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa <strong>vĩnh viễn</strong> chương trình{' '}
            <strong className='text-foreground'>{promotion.name}</strong>?
            <br className='mb-2' />
            <span className='text-destructive font-semibold'>
              Hành động này không thể hoàn tác và toàn bộ dữ liệu về chương trình này sẽ bị mất!
            </span>
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
            {t('actions.hardDelete', 'Xóa vĩnh viễn')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
