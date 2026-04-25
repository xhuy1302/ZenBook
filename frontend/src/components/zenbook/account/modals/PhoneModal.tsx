import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'

import { updateCustomerPhoneApi } from '@/services/customer/customer.api'

// ─── Schema validation ─────────────────────────────────────────────────────────
const phoneSchema = z.object({
  phone: z.string().regex(/^(0|\+84)[0-9]{8,9}$/, 'validation.phoneInvalid') // Thêm {8,9} cho chuẩn regex số ĐT Việt Nam
})

type PhoneFormValues = z.infer<typeof phoneSchema>

// ─── Component ─────────────────────────────────────────────────────────────────
interface PhoneModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPhone?: string
  onUpdated?: (newPhone: string) => void // 👉 1. Thêm prop onUpdated
}

export default function PhoneModal({
  open,
  onOpenChange,
  currentPhone,
  onUpdated
}: PhoneModalProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation('account')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: currentPhone ?? '' }
  })

  // Cập nhật giá trị khi currentPhone thay đổi (mở modal)
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      reset({ phone: currentPhone ?? '' }) // Fix tránh lỗi truyền null vào react-hook-form
    }
    onOpenChange(isOpen)
  }

  const mutation = useMutation({
    mutationFn: updateCustomerPhoneApi,
    // 👉 2. Lấy biến "variables" (chứa data submit) từ onSuccess của React Query
    onSuccess: (_, variables) => {
      toast.success(t('security.phoneUpdateSuccess', 'Cập nhật số điện thoại thành công'))
      queryClient.invalidateQueries({ queryKey: ['profile'] })

      // 👉 3. Gọi hàm onUpdated truyền số điện thoại mới ra cho Component cha
      if (onUpdated) {
        onUpdated(variables.phone)
      }

      onOpenChange(false)
    },
    onError: () => {
      toast.error(t('security.phoneUpdateError', 'Cập nhật thất bại, vui lòng thử lại'))
    }
  })

  const onSubmit = (data: PhoneFormValues) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>{t('security.updatePhoneTitle', 'Cập nhật số điện thoại')}</DialogTitle>
          <DialogDescription>
            {t('security.updatePhoneDesc', 'Nhập số điện thoại mới của bạn')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-1'>
          <div className='space-y-1.5'>
            <Label htmlFor='phone'>{t('security.phoneNumber', 'Số điện thoại')}</Label>
            <Input
              id='phone'
              placeholder={t('security.phonePlaceholder', 'Ví dụ: 0912345678')}
              className='focus-visible:ring-brand-green/40'
              {...register('phone')}
            />
            {errors.phone && (
              <p className='text-xs text-destructive'>
                {t(errors.phone.message as string, 'Số điện thoại không hợp lệ')}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel', 'Hủy')}
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='bg-brand-green hover:bg-brand-green-dark text-primary-foreground'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-3.5 h-3.5 mr-1.5 animate-spin' />
                  {t('common.saving', 'Đang lưu...')}
                </>
              ) : (
                t('common.confirm', 'Xác nhận')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
