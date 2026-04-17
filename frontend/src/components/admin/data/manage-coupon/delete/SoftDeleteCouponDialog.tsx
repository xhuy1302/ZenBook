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
import { softDeleteCouponApi } from '@/services/coupon/coupon.api'
import type { CouponResponse } from '@/services/coupon/coupon.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface SoftDeleteCouponDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coupon: CouponResponse | null
}

export function SoftDeleteCouponDialog({
  open,
  onOpenChange,
  coupon
}: SoftDeleteCouponDialogProps) {
  const { t } = useTranslation('coupon')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: string) => softDeleteCouponApi(id),
    onSuccess: () => {
      toast.success(t('messages.softDeleteSuccess', 'Đã chuyển mã vào thùng rác!'))
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      queryClient.invalidateQueries({ queryKey: ['coupons-trash'] })
      onOpenChange(false)
    },
    onError: () => {
      toast.error(t('messages.error', 'Có lỗi xảy ra!'))
    }
  })

  if (!coupon) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='border-red-100 dark:border-red-900/50 shadow-lg shadow-red-500/10'>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2 text-red-600 dark:text-red-500'>
            <Trash2 className='w-5 h-5' />
            {t('dialog.deleteTitle', 'Xóa tạm mã giảm giá')}
          </AlertDialogTitle>
          <AlertDialogDescription className='space-y-2 mt-2'>
            <span>
              Bạn có chắc chắn muốn chuyển mã{' '}
              <strong className='text-foreground'>{coupon.code}</strong> vào thùng rác không?
            </span>
            <span className='block mt-2 p-3 bg-red-50 dark:bg-red-500/10 rounded-md text-red-800 dark:text-red-200 text-sm'>
              💡 <strong>Lưu ý:</strong> Khách hàng sẽ không thể sử dụng mã này nữa. Bạn có thể khôi
              phục lại từ thùng rác bất cứ lúc nào.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='mt-4'>
          <AlertDialogCancel disabled={mutation.isPending}>
            {t('common.cancel', 'Hủy')}
          </AlertDialogCancel>
          <Button
            variant='destructive'
            onClick={() => mutation.mutate(coupon.id)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            ) : (
              <Trash2 className='w-4 h-4 mr-2' />
            )}
            {t('common.delete', 'Xóa ngay')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
