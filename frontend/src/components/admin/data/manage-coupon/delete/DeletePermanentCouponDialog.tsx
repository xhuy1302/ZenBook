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
import { hardDeleteCouponApi } from '@/services/coupon/coupon.api'
import type { CouponResponse } from '@/services/coupon/coupon.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, AlertOctagon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface HardDeleteCouponDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coupon: CouponResponse | null
}

export function HardDeleteCouponDialog({
  open,
  onOpenChange,
  coupon
}: HardDeleteCouponDialogProps) {
  const { t } = useTranslation('coupon')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: string) => hardDeleteCouponApi(id),
    onSuccess: () => {
      toast.success(t('messages.hardDeleteSuccess', 'Đã xóa vĩnh viễn mã giảm giá!'))
      // Chỉ cần load lại bảng thùng rác
      queryClient.invalidateQueries({ queryKey: ['coupons-trash'] })
      onOpenChange(false)
    },
    onError: () => {
      toast.error(t('messages.error', 'Có lỗi xảy ra khi xóa vĩnh viễn!'))
    }
  })

  if (!coupon) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2 text-destructive'>
            <AlertOctagon className='w-5 h-5' />
            {t('dialog.hardDeleteTitle', 'Cảnh báo: Xóa vĩnh viễn')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa <strong>vĩnh viễn</strong> mã{' '}
            <strong className='text-foreground'>{coupon.code}</strong>?
            <br className='mb-2' />
            <span className='text-destructive font-semibold'>
              Hành động này không thể hoàn tác và toàn bộ dữ liệu lịch sử dùng mã này sẽ bị xóa khỏi
              cơ sở dữ liệu!
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            {t('common.cancel', 'Hủy')}
          </AlertDialogCancel>
          <Button
            variant='destructive'
            onClick={() => mutation.mutate(coupon.id)}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
            {t('common.hardDelete', 'Xóa vĩnh viễn')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
