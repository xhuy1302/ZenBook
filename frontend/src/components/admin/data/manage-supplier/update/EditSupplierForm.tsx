'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Info, MapPin, Mail, Phone, Hash, User, NotebookPen, Activity } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import { editSupplierSchema, type EditSupplierFormValues } from '../schema/supplier.schema'
import { updateSupplierApi } from '@/services/supplier/supplier.api'
import type { SupplierResponse } from '@/services/supplier/supplier.type'
import { SupplierStatus } from '@/defines/supplier.enum'

interface EditSupplierFormProps {
  supplier: SupplierResponse
  onSuccess: () => void
  onCancel: () => void
}

export function EditSupplierForm({ supplier, onSuccess, onCancel }: EditSupplierFormProps) {
  const { t } = useTranslation('supplier')
  const queryClient = useQueryClient()

  const form = useForm<EditSupplierFormValues>({
    resolver: zodResolver(editSupplierSchema),
    defaultValues: {
      name: supplier.name || '',
      contactName: supplier.contactName || '',
      taxCode: supplier.taxCode || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      description: supplier.description || '',
      status: supplier.status || SupplierStatus.ACTIVE
    }
  })

  const { errors, isSubmitting } = form.formState

  const mutation = useMutation({
    mutationFn: (values: EditSupplierFormValues) => updateSupplierApi(supplier.id, values),
    onSuccess: () => {
      toast.success(t('messages.updateSuccess', 'Cập nhật thành công!'))
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      onSuccess()
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
  })

  return (
    <form
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
      className='flex flex-col h-full bg-white'
    >
      {/* VÙNG NỘI DUNG CUỘN */}
      <div className='flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50'>
        {/* NHÓM 1: THÔNG TIN PHÁP LÝ & TRẠNG THÁI */}
        <div className='bg-white border rounded-xl p-5 shadow-sm space-y-4'>
          <div className='flex items-center gap-2 text-amber-600 font-bold border-b pb-3'>
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
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className='text-[11px] text-destructive font-medium'>{errors.name.message}</p>
              )}
            </div>

            <div className='space-y-1.5'>
              <Label className='flex items-center gap-1.5'>
                <Activity className='w-3.5 h-3.5 text-muted-foreground' /> Trạng thái vận hành
              </Label>
              <Controller
                control={form.control}
                name='status'
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='bg-white'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SupplierStatus.ACTIVE}>Đang hoạt động</SelectItem>
                      <SelectItem value={SupplierStatus.INACTIVE}>Tạm dừng</SelectItem>
                      <SelectItem value={SupplierStatus.BLOCKED}>Đã khóa</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='flex items-center gap-1.5'>
                <Hash className='w-3.5 h-3.5 text-muted-foreground' /> Mã số thuế
              </Label>
              <Input {...form.register('taxCode')} />
            </div>

            <div className='md:col-span-2 space-y-1.5'>
              <Label className='flex items-center gap-1.5'>
                <User className='w-3.5 h-3.5 text-muted-foreground' /> Người đại diện / Liên hệ
                chính
              </Label>
              <Input {...form.register('contactName')} placeholder='VD: Nguyễn Văn A' />
            </div>
          </div>
        </div>

        {/* NHÓM 2: LIÊN HỆ */}
        <div className='bg-white border rounded-xl p-5 shadow-sm space-y-4'>
          <div className='flex items-center gap-2 text-amber-600 font-bold border-b pb-3'>
            <Phone className='w-5 h-5' />
            <span>Thông tin liên lạc</span>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Label
                className={`flex items-center gap-1.5 ${errors.email ? 'text-destructive' : ''}`}
              >
                <Mail className='w-3.5 h-3.5 text-muted-foreground' /> Địa chỉ Email
              </Label>
              <Input {...form.register('email')} />
              {errors.email && (
                <p className='text-[11px] text-destructive font-medium'>{errors.email.message}</p>
              )}
            </div>

            <div className='space-y-1.5'>
              <Label className='flex items-center gap-1.5'>
                <Phone className='w-3.5 h-3.5 text-muted-foreground' /> Số điện thoại
              </Label>
              <Input {...form.register('phone')} />
            </div>

            <div className='md:col-span-2 space-y-1.5'>
              <Label className='flex items-center gap-1.5'>
                <MapPin className='w-3.5 h-3.5 text-muted-foreground' /> Địa chỉ trụ sở
              </Label>
              <Input {...form.register('address')} />
            </div>
          </div>
        </div>

        {/* NHÓM 3: GHI CHÚ */}
        <div className='bg-white border rounded-xl p-5 shadow-sm space-y-4'>
          <div className='flex items-center gap-2 text-amber-600 font-bold border-b pb-3'>
            <NotebookPen className='w-5 h-5' />
            <span>Ghi chú hệ thống</span>
          </div>
          <Textarea
            {...form.register('description')}
            rows={3}
            className='resize-none'
            placeholder='Thông tin bổ sung về nhà cung cấp...'
          />
        </div>
      </div>

      {/* CHÂN FORM CỐ ĐỊNH (FOOTER) - KHẮC PHỤC LỖI MẤT NÚT */}
      <div className='px-6 py-4 border-t bg-white flex justify-end items-center gap-3 shrink-0 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]'>
        <Button type='button' variant='outline' onClick={onCancel} className='px-6'>
          Hủy bỏ
        </Button>
        <Button
          type='submit'
          disabled={mutation.isPending || isSubmitting}
          className='px-8 bg-amber-600 hover:bg-amber-700 text-white'
        >
          {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Cập Nhật Nhà Cung Cấp
        </Button>
      </div>
    </form>
  )
}
