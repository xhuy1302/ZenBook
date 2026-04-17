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
import { restorePromotionApi } from '@/services/promotion/promotion.api'
import type { PromotionResponse } from '@/services/promotion/promotion.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface RestorePromotionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotion: PromotionResponse | null
}

export function RestorePromotionDialog({
  open,
  onOpenChange,
  promotion
}: RestorePromotionDialogProps) {
  const { t } = useTranslation('promotion')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: string) => restorePromotionApi(id),
    onSuccess: () => {
      toast.success(t('message.success.restore', 'Đã khôi phục chương trình thành công!'))
      // Cập nhật lại cả 2 bảng: Bảng danh sách chính và Bảng thùng rác
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
      queryClient.invalidateQueries({ queryKey: ['promotions-trash'] })
      onOpenChange(false)
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        t('message.error.restore', 'Có lỗi xảy ra khi khôi phục!')
      toast.error(msg)
    }
  })

  // Nếu không có dữ liệu promotion truyền vào, không render gì cả
  if (!promotion) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='border-emerald-100 dark:border-emerald-900/50 shadow-lg shadow-emerald-500/10'>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2 text-emerald-600 dark:text-emerald-500'>
            <RefreshCcw className='w-5 h-5' />
            {t('dialogTitle.restore', 'Khôi phục chương trình')}
          </AlertDialogTitle>
          <AlertDialogDescription className='space-y-2 mt-2'>
            <span>
              Bạn có muốn khôi phục chương trình{' '}
              <strong className='text-foreground'>{promotion.name}</strong> về danh sách hoạt động
              không?
            </span>
            <span className='block mt-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-md text-emerald-800 dark:text-emerald-200 text-sm'>
              💡 <strong>Lưu ý:</strong> Nếu thời gian chương trình vẫn còn hiệu lực, hệ thống sẽ tự
              động áp dụng lại mức giá khuyến mãi cho các cuốn sách trong danh sách.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='mt-4'>
          <AlertDialogCancel disabled={mutation.isPending}>
            {t('actions.cancel', 'Hủy')}
          </AlertDialogCancel>
          <Button
            className='bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
            onClick={() => mutation.mutate(promotion.id)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            ) : (
              <RefreshCcw className='w-4 h-4 mr-2' />
            )}
            {t('actions.restore', 'Khôi phục')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
