'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Ticket, Settings2, CalendarDays, Percent, Truck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import { getCouponSchema, type CouponFormValues } from '../schema/coupon.schema'
import { createCouponApi } from '@/services/coupon/coupon.api'
import { CouponStatus, DiscountType, CouponType } from '@/defines/coupon.enum'
import type { CouponRequest } from '@/services/coupon/coupon.type'
import { getAllCategoriesApi } from '@/services/category/category.api'

interface CreateCouponFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function CreateCouponForm({ onSuccess, onCancel }: CreateCouponFormProps) {
  const { t } = useTranslation('coupon')
  const queryClient = useQueryClient()

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategoriesApi
  })

  const today = new Date()
  const nextMonth = new Date()
  nextMonth.setMonth(today.getMonth() + 1)

  const form = useForm<CouponFormValues>({
    // 👉 CÁCH FIX TS: Ép kiểu Resolver chuẩn xác để bỏ qua xung đột unknown do z.preprocess gây ra
    resolver: zodResolver(
      getCouponSchema(t as unknown as (key: string, fallback?: string) => string)
    ) as import('react-hook-form').Resolver<CouponFormValues>,
    defaultValues: {
      code: '',
      couponType: CouponType.ORDER,
      discountType: DiscountType.PERCENTAGE,
      discountValue: 0, // Đổi thành 0 thay vì undefined để form ổn định
      maxDiscountAmount: null,
      minOrderValue: 0,
      usageLimit: null,
      maxUsagePerUser: 1,
      status: CouponStatus.ACTIVE,
      categoryId: null,
      startDate: format(today, "yyyy-MM-dd'T'HH:mm"),
      endDate: format(nextMonth, "yyyy-MM-dd'T'HH:mm")
    }
  })

  const { errors, isSubmitting } = form.formState
  const watchDiscountType = form.watch('discountType')

  const mutation = useMutation({
    mutationFn: (values: CouponFormValues) => createCouponApi(values as unknown as CouponRequest),
    onSuccess: () => {
      toast.success(t('messages.createSuccess', 'Tạo mã giảm giá thành công!'))
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      onSuccess()
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg = error.response?.data?.message || t('messages.createError', 'Có lỗi xảy ra!')
      toast.error(msg)
    }
  })

  return (
    <form
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
      className='flex flex-col h-full overflow-hidden'
    >
      <div className='flex-1 overflow-y-auto px-6 py-6 custom-scrollbar         /50'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8'>
          <div className='space-y-6'>
            <section className='  p-5 rounded-xl border border-slate-200 shadow-sm space-y-4'>
              <Label className='text-base font-bold text-slate-800'>
                Bạn muốn tạo loại mã nào?
              </Label>
              <Controller
                control={form.control}
                name='couponType'
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className='grid grid-cols-2 gap-4'
                  >
                    <div>
                      <RadioGroupItem
                        value={CouponType.ORDER}
                        id='type-order'
                        className='peer sr-only'
                      />
                      <Label
                        htmlFor='type-order'
                        className='flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:         peer-data-[state=checked]:border-brand-green peer-data-[state=checked]:bg-brand-green/5 cursor-pointer transition-all'
                      >
                        <Percent className='mb-2 h-7 w-7 text-orange-500' />
                        <span className='font-semibold text-sm'>Giảm Sách</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value={CouponType.SHIPPING}
                        id='type-shipping'
                        className='peer sr-only'
                      />
                      <Label
                        htmlFor='type-shipping'
                        className='flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:         peer-data-[state=checked]:border-brand-green peer-data-[state=checked]:bg-brand-green/5 cursor-pointer transition-all'
                      >
                        <Truck className='mb-2 h-7 w-7 text-blue-500' />
                        <span className='font-semibold text-sm'>Freeship</span>
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </section>

            <section className='  p-5 rounded-xl border border-slate-200 shadow-sm space-y-5'>
              <div className='flex items-center gap-2 text-brand-green font-bold text-base border-b pb-3'>
                <Ticket className='w-5 h-5' />
                <span>Cấu hình giá trị mã</span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <div className='space-y-2 md:col-span-2'>
                  <Label className={errors.code ? 'text-destructive' : ''}>
                    Mã Code <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    {...form.register('code')}
                    placeholder='VD: ZENBOOK2026'
                    className={`uppercase h-11 font-mono font-bold text-lg tracking-wider ${errors.code ? 'border-destructive' : ''}`}
                  />
                  {errors.code && <p className='text-xs text-destructive'>{errors.code.message}</p>}
                </div>

                <div className='space-y-2'>
                  <Label>Hình thức giảm</Label>
                  <Controller
                    control={form.control}
                    name='discountType'
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val)
                          if (val === DiscountType.FIXED_AMOUNT)
                            form.setValue('maxDiscountAmount', null)
                        }}
                      >
                        <SelectTrigger className='h-11 font-medium'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={DiscountType.PERCENTAGE}>Phần trăm (%)</SelectItem>
                          <SelectItem value={DiscountType.FIXED_AMOUNT}>Tiền mặt (đ)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className='space-y-2'>
                  <Label className={errors.discountValue ? 'text-destructive' : ''}>
                    Mức giảm <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    type='number'
                    {...form.register('discountValue', { valueAsNumber: true })}
                    className={`h-11 font-bold ${errors.discountValue ? 'border-destructive' : ''}`}
                  />
                  {errors.discountValue && (
                    <p className='text-xs text-destructive'>{errors.discountValue.message}</p>
                  )}
                </div>

                <div className='space-y-2 md:col-span-2'>
                  <Label>Giảm tối đa (đ)</Label>
                  <Input
                    type='number'
                    disabled={watchDiscountType === DiscountType.FIXED_AMOUNT}
                    {...form.register('maxDiscountAmount', {
                      setValueAs: (v) => (v === '' || v === null ? null : Number(v))
                    })}
                    placeholder={
                      watchDiscountType === DiscountType.FIXED_AMOUNT
                        ? 'Không khả dụng'
                        : 'Để trống = Vô hạn'
                    }
                    className='h-11 disabled:bg-slate-100'
                  />
                </div>
              </div>
            </section>
          </div>

          <div className='space-y-6'>
            <section className='  p-5 rounded-xl border border-slate-200 shadow-sm space-y-5'>
              <div className='flex items-center gap-2 text-brand-green font-bold text-base border-b pb-3'>
                <Settings2 className='w-5 h-5' />
                <span>Điều kiện áp dụng</span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <div className='space-y-2'>
                  <Label>Đơn tối thiểu (đ) *</Label>
                  <Input
                    type='number'
                    {...form.register('minOrderValue', { valueAsNumber: true })}
                    className='h-11'
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Giới hạn / User *</Label>
                  <Input
                    type='number'
                    {...form.register('maxUsagePerUser', { valueAsNumber: true })}
                    className='h-11'
                  />
                </div>

                <div className='space-y-2 md:col-span-2'>
                  <Label>Tổng lượt dùng toàn sàn</Label>
                  <Input
                    type='number'
                    {...form.register('usageLimit', {
                      setValueAs: (v) => (v === '' || v === null ? null : Number(v))
                    })}
                    placeholder='Để trống = Không giới hạn'
                    className='h-11'
                  />
                </div>

                <div className='space-y-2 md:col-span-2'>
                  <Label>Áp dụng cho danh mục</Label>
                  <Controller
                    control={form.control}
                    name='categoryId'
                    render={({ field }) => (
                      <Select
                        value={field.value || 'ALL'}
                        onValueChange={(v) => field.onChange(v === 'ALL' ? null : v)}
                        disabled={isCategoriesLoading}
                      >
                        <SelectTrigger className='h-11'>
                          <SelectValue placeholder='Chọn danh mục...' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='ALL'>-- Tất cả danh mục sách --</SelectItem>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.categoryName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </section>

            <section className='  p-5 rounded-xl border border-slate-200 shadow-sm space-y-5'>
              <div className='flex items-center gap-2 text-brand-green font-bold text-base border-b pb-3'>
                <CalendarDays className='w-5 h-5' />
                <span>Hiệu lực thời gian</span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <div className='space-y-2'>
                  <Label className={errors.startDate ? 'text-destructive' : ''}>Bắt đầu *</Label>
                  <Input
                    type='datetime-local'
                    {...form.register('startDate')}
                    className={`h-11 ${errors.startDate ? 'border-destructive' : ''}`}
                  />
                </div>
                <div className='space-y-2'>
                  <Label className={errors.endDate ? 'text-destructive' : ''}>Kết thúc *</Label>
                  <Input
                    type='datetime-local'
                    {...form.register('endDate')}
                    className={`h-11 ${errors.endDate ? 'border-destructive' : ''}`}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className='p-5 border-t   flex justify-end gap-3 shrink-0 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.02)] z-10'>
        <Button type='button' variant='outline' onClick={onCancel} className='px-6 h-10'>
          {t('common.cancel', 'Hủy')}
        </Button>
        <Button
          type='submit'
          disabled={mutation.isPending || isSubmitting}
          className='px-8 h-10 bg-brand-green hover:bg-brand-green-dark shadow-md'
        >
          {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {t('form.btnCreate', 'Tạo mã giảm giá')}
        </Button>
      </div>
    </form>
  )
}
