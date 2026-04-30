import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { KeyRound, Loader2 } from 'lucide-react'

const pinSchema = z
  .object({
    pin: z.string().regex(/^\d{6}$/, 'Mã PIN phải bao gồm đúng 6 chữ số'),
    confirmPin: z.string()
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: 'Mã PIN xác nhận không khớp',
    path: ['confirmPin']
  })

type PinFormValues = z.infer<typeof pinSchema>

interface PinSetupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PinSetupModal({ open, onOpenChange }: PinSetupModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PinFormValues>({
    resolver: zodResolver(pinSchema)
  })

  const onSubmit = async ({ pin }: PinFormValues) => {
    setIsSubmitting(true)

    try {
      // eslint-disable-next-line no-console
      console.log('PIN:', pin)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success('Thiết lập mã PIN thành công!')
      reset()
      onOpenChange(false)
    } catch {
      toast.error('Có lỗi xảy ra khi thiết lập mã PIN')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        if (!val) reset()
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green'>
              <KeyRound className='w-5 h-5' />
            </div>
            <DialogTitle className='text-xl'>Thiết lập mã PIN</DialogTitle>
          </div>
          <DialogDescription>
            Mã PIN gồm 6 chữ số giúp tăng cường bảo mật khi bạn thanh toán hoặc thay đổi thông tin
            quan trọng.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-2'>
          <div className='space-y-2'>
            <Label>Mã PIN mới (6 số)</Label>
            <Input
              type='password'
              maxLength={6}
              placeholder='••••••'
              className='text-center text-2xl tracking-[0.5em] h-12 focus-visible:ring-brand-green/40'
              {...register('pin')}
            />
            {errors.pin && <p className='text-destructive text-xs'>{errors.pin.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label>Xác nhận mã PIN</Label>
            <Input
              type='password'
              maxLength={6}
              placeholder='••••••'
              className='text-center text-2xl tracking-[0.5em] h-12 focus-visible:ring-brand-green/40'
              {...register('confirmPin')}
            />
            {errors.confirmPin && (
              <p className='text-destructive text-xs'>{errors.confirmPin.message}</p>
            )}
          </div>

          <DialogFooter className='pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type='submit'
              className='bg-brand-green hover:bg-brand-green-dark'
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' /> Đang lưu...
                </>
              ) : (
                'Xác nhận'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
