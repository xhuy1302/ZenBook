'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Info, MapPin, Mail, Phone, Hash, User, NotebookPen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { createSupplierSchema, type CreateSupplierFormValues } from '../schema/supplier.schema'
import { createSupplierApi } from '@/services/supplier/supplier.api'

interface CreateSupplierFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function CreateSupplierForm({ onSuccess, onCancel }: CreateSupplierFormProps) {
  const { t } = useTranslation('supplier')
  const queryClient = useQueryClient()

  const form = useForm<CreateSupplierFormValues>({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      name: '',
      contactName: '',
      taxCode: '',
      email: '',
      phone: '',
      address: '',
      description: ''
    }
  })

  const { errors, isSubmitting } = form.formState

  const mutation = useMutation({
    mutationFn: createSupplierApi,
    onSuccess: () => {
      toast.success(t('messages.createSuccess', 'Thêm mới nhà cung cấp thành công!'))
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      onSuccess()
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg = error.response?.data?.message || t('messages.createError', 'Có lỗi xảy ra')
      toast.error(msg)
    }
  })

  return (
    <form
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
      className='flex flex-col h-full bg-white' // 👉 Đổi sang bg-white đặc để không nhìn xuyên thấu
    >
      {/* VÙNG NỘI DUNG CUỘN */}
      <div className='flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50'>
        {/* NHÓM 1: THÔNG TIN PHÁP LÝ */}
        <div className='bg-white border rounded-xl p-5 shadow-sm space-y-4'>
          <div className='flex items-center gap-2 text-primary font-bold border-b pb-3'>
            <Info className='w-5 h-5' />
            <span>Thông tin định danh</span>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='md:col-span-2 space-y-1.5'>
              <Label className={errors.name ? 'text-destructive' : ''}>
                Tên nhà cung cấp <span className='text-destructive'>*</span>
              </Label>
              <Input
                {...form.register('name')}
                placeholder='VD: Công ty TNHH ZenBook Việt Nam'
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className='text-[11px] text-destructive font-medium'>{errors.name.message}</p>
              )}
            </div>

            <div className='space-y-1.5'>
              <Label className='flex items-center gap-1.5'>
                <Hash className='w-3.5 h-3.5 text-muted-foreground' /> Mã số thuế
              </Label>
              <Input {...form.register('taxCode')} placeholder='0101234567' />
            </div>

            <div className='space-y-1.5'>
              <Label className='flex items-center gap-1.5'>
                <User className='w-3.5 h-3.5 text-muted-foreground' /> Người đại diện
              </Label>
              <Input {...form.register('contactName')} placeholder='Nguyễn Văn A' />
            </div>
          </div>
        </div>

        {/* NHÓM 2: LIÊN HỆ */}
        <div className='bg-white border rounded-xl p-5 shadow-sm space-y-4'>
          <div className='flex items-center gap-2 text-primary font-bold border-b pb-3'>
            <Phone className='w-5 h-5' />
            <span>Thông tin liên lạc</span>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Label
                className={`flex items-center gap-1.5 ${errors.email ? 'text-destructive' : ''}`}
              >
                <Mail className='w-3.5 h-3.5 text-muted-foreground' /> Email
              </Label>
              <Input {...form.register('email')} placeholder='nhacungcap@gmail.com' />
              {errors.email && (
                <p className='text-[11px] text-destructive font-medium'>{errors.email.message}</p>
              )}
            </div>

            <div className='space-y-1.5'>
              <Label className='flex items-center gap-1.5'>
                <Phone className='w-3.5 h-3.5 text-muted-foreground' /> Số điện thoại
              </Label>
              <Input {...form.register('phone')} placeholder='0987654321' />
            </div>

            <div className='md:col-span-2 space-y-1.5'>
              <Label className='flex items-center gap-1.5'>
                <MapPin className='w-3.5 h-3.5 text-muted-foreground' /> Địa chỉ trụ sở
              </Label>
              <Input
                {...form.register('address')}
                placeholder='Số nhà, Tên đường, Quận/Huyện, Tỉnh/TP...'
              />
            </div>
          </div>
        </div>

        {/* NHÓM 3: GHI CHÚ */}
        <div className='bg-white border rounded-xl p-5 shadow-sm space-y-4'>
          <div className='flex items-center gap-2 text-primary font-bold border-b pb-3'>
            <NotebookPen className='w-5 h-5' />
            <span>Ghi chú hệ thống</span>
          </div>
          <Textarea
            {...form.register('description')}
            rows={3}
            placeholder='Các lưu ý đặc biệt về nhà cung cấp này...'
            className='resize-none'
          />
        </div>
      </div>

      {/* CHÂN DIALOG CỐ ĐỊNH (FOOTER) */}
      <div className='px-6 py-4 border-t bg-white flex justify-end items-center gap-3 shrink-0 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]'>
        <Button type='button' variant='outline' onClick={onCancel} className='px-6'>
          Hủy bỏ
        </Button>
        <Button
          type='submit'
          disabled={mutation.isPending || isSubmitting}
          className='px-8 bg-primary hover:bg-primary/90'
        >
          {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Tạo Nhà Cung Cấp
        </Button>
      </div>
    </form>
  )
}
