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
import { restoreCouponApi } from '@/services/coupon/coupon.api'
import type { CouponResponse } from '@/services/coupon/coupon.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface RestoreCouponDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coupon: CouponResponse | null
}

export function RestoreCouponDialog({ open, onOpenChange, coupon }: RestoreCouponDialogProps) {
  const { t } = useTranslation('coupon')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: string) => restoreCouponApi(id),
    onSuccess: () => {
      toast.success(t('messages.restoreSuccess', 'Đã khôi phục mã giảm giá thành công!'))
      // Cập nhật lại cả 2 bảng
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      queryClient.invalidateQueries({ queryKey: ['coupons-trash'] })
      onOpenChange(false)
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        t('messages.error', 'Có lỗi xảy ra khi khôi phục!')
      toast.error(msg)
    }
  })

  if (!coupon) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='border-emerald-100 dark:border-emerald-900/50 shadow-lg shadow-emerald-500/10'>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2 text-emerald-600 dark:text-emerald-500'>
            <RefreshCcw className='w-5 h-5' />
            {t('dialog.restoreTitle', 'Khôi phục mã giảm giá')}
          </AlertDialogTitle>
          <AlertDialogDescription className='space-y-2 mt-2'>
            <span>
              Bạn có muốn khôi phục mã <strong className='text-foreground'>{coupon.code}</strong> về
              danh sách hoạt động không?
            </span>
            <span className='block mt-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-md text-emerald-800 dark:text-emerald-200 text-sm'>
              💡 <strong>Lưu ý:</strong> Khách hàng sẽ có thể áp dụng mã này trở lại nếu thời gian
              và số lượt sử dụng vẫn còn hiệu lực.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='mt-4'>
          <AlertDialogCancel disabled={mutation.isPending}>
            {t('common.cancel', 'Hủy')}
          </AlertDialogCancel>
          <Button
            className='bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
            onClick={() => mutation.mutate(coupon.id)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            ) : (
              <RefreshCcw className='w-4 h-4 mr-2' />
            )}
            {t('common.restore', 'Khôi phục')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
