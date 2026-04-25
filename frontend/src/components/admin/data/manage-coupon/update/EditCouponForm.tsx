'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Ticket, Settings2, CalendarDays, Percent, Truck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
import { updateCouponApi } from '@/services/coupon/coupon.api'
import { CouponStatus, DiscountType, CouponType } from '@/defines/coupon.enum'
import type { CouponResponse, CouponRequest } from '@/services/coupon/coupon.type'
import { getAllCategoriesApi } from '@/services/category/category.api'

interface EditCouponFormProps {
  coupon: CouponResponse
  onSuccess: () => void
  onCancel: () => void
}

export function EditCouponForm({ coupon, onSuccess, onCancel }: EditCouponFormProps) {
  const { t } = useTranslation('coupon')
  const queryClient = useQueryClient()

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategoriesApi
  })

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return ''
    return dateString.substring(0, 16)
  }

  // 👉 FIX LỖI 1: Ép kiểu t sang Function ẩn danh để vượt qua Strict Type của i18next
  const validator = (key: string, fallback?: string): string => {
    const translate = t as unknown as (k: string, opts: { defaultValue?: string }) => string
    return translate(key, { defaultValue: fallback })
  }

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(
      getCouponSchema(validator)
    ) as unknown as import('react-hook-form').Resolver<CouponFormValues>,
    defaultValues: {
      code: coupon.code || '',
      couponType: coupon.couponType || CouponType.ORDER,
      discountType: coupon.discountType || DiscountType.PERCENTAGE,
      discountValue: coupon.discountValue || 0,
      maxDiscountAmount: coupon.maxDiscountAmount ?? null,
      minOrderValue: coupon.minOrderValue ?? 0,
      usageLimit: coupon.usageLimit ?? null,
      maxUsagePerUser: coupon.maxUsagePerUser ?? 1,
      status: coupon.status || CouponStatus.ACTIVE,
      categoryId: coupon.categoryId || null,
      startDate: formatDateForInput(coupon.startDate),
      endDate: formatDateForInput(coupon.endDate)
    }
  })

  const { errors, isSubmitting } = form.formState
  const watchDiscountType = form.watch('discountType')

  const mutation = useMutation({
    mutationFn: (values: CouponFormValues) =>
      updateCouponApi(coupon.id, values as unknown as CouponRequest),
    onSuccess: () => {
      toast.success(t('messages.updateSuccess', 'Cập nhật mã giảm giá thành công!'))
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      onSuccess()
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg = error.response?.data?.message || t('messages.updateError', 'Lỗi cập nhật!')
      toast.error(msg)
    }
  })

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      className='flex flex-col h-full overflow-hidden bg-slate-50/50'
    >
      <div className='flex-1 overflow-y-auto p-6 custom-scrollbar'>
        {/* LƯỚI 2 CỘT CÂN XỨNG */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8'>
          {/* ================= CỘT TRÁI (LOẠI MÃ & CẤU HÌNH TIỀN) ================= */}
          <div className='flex flex-col gap-6'>
            <section className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4'>
              <Label className='text-base font-bold text-slate-800'>Loại ưu đãi</Label>
              <Controller
                control={form.control}
                name='couponType'
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className='grid grid-cols-2 gap-4'
                  >
                    <div>
                      <RadioGroupItem
                        value={CouponType.ORDER}
                        id='edit-type-order'
                        className='peer sr-only'
                      />
                      <Label
                        htmlFor='edit-type-order'
                        className='flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-brand-green peer-data-[state=checked]:bg-green-50/30 cursor-pointer transition-all'
                      >
                        <Percent className='h-6 w-6 text-orange-500' />
                        <span className='font-semibold text-sm text-slate-700'>Đơn hàng</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value={CouponType.SHIPPING}
                        id='edit-type-shipping'
                        className='peer sr-only'
                      />
                      <Label
                        htmlFor='edit-type-shipping'
                        className='flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-brand-green peer-data-[state=checked]:bg-green-50/30 cursor-pointer transition-all'
                      >
                        <Truck className='h-6 w-6 text-blue-500' />
                        <span className='font-semibold text-sm text-slate-700'>Vận chuyển</span>
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </section>

            <section className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col gap-5'>
              <div className='flex items-center gap-2 text-brand-green font-semibold border-b pb-3'>
                <Ticket className='w-5 h-5' />
                <span>{t('form.section1', '1. Cấu hình mã')}</span>
              </div>

              <div className='space-y-2'>
                <Label className={errors.code ? 'text-destructive' : ''}>Mã Code *</Label>
                <Input
                  {...form.register('code')}
                  className={`uppercase h-11 font-mono font-bold tracking-widest ${errors.code ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.code && (
                  <p className='text-[11px] text-destructive'>{errors.code.message}</p>
                )}
              </div>

              <div className='grid grid-cols-2 gap-4'>
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
                        <SelectTrigger className='h-11'>
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
                    Giá trị giảm *
                  </Label>
                  <Input
                    type='number'
                    {...form.register('discountValue', { valueAsNumber: true })}
                    className={`h-11 font-semibold ${errors.discountValue ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {errors.discountValue && (
                    <p className='text-[11px] text-destructive'>{errors.discountValue.message}</p>
                  )}
                </div>
              </div>

              <div className='space-y-2 mt-auto'>
                <Label>Số tiền giảm tối đa (đ)</Label>
                <Input
                  type='number'
                  disabled={watchDiscountType === DiscountType.FIXED_AMOUNT}
                  {...form.register('maxDiscountAmount', {
                    setValueAs: (v) => (v === '' || v === null ? null : Number(v))
                  })}
                  placeholder='Để trống = Vô hạn'
                  className='h-11 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100'
                />
              </div>
            </section>
          </div>

          {/* ================= CỘT PHẢI (ĐIỀU KIỆN & THỜI GIAN) ================= */}
          <div className='flex flex-col gap-6'>
            <section className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-5'>
              <div className='flex items-center gap-2 text-brand-green font-semibold border-b pb-3'>
                <Settings2 className='w-5 h-5' />
                <span>{t('form.section2', '2. Điều kiện áp dụng')}</span>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Đơn tối thiểu (đ) *</Label>
                  <Input
                    type='number'
                    {...form.register('minOrderValue', { valueAsNumber: true })}
                    className='h-11 font-medium'
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
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Tổng lượt dùng</Label>
                  <Input
                    type='number'
                    {...form.register('usageLimit', {
                      setValueAs: (v) => (v === '' || v === null ? null : Number(v))
                    })}
                    placeholder='Vô hạn'
                    className='h-11'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Danh mục áp dụng</Label>
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
                          <SelectValue placeholder='Tất cả danh mục' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='ALL'>Tất cả</SelectItem>
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

            <section className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col gap-5'>
              <div className='flex items-center gap-2 text-brand-green font-semibold border-b pb-3'>
                <CalendarDays className='w-5 h-5' />
                <span>{t('form.section3', '3. Hiệu lực & Trạng thái')}</span>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {/* 👉 FIX LỖI 2: Tạo style rõ ràng cho thẻ input type datetime-local */}
                <div className='space-y-2'>
                  <Label>Ngày bắt đầu *</Label>
                  <Input
                    type='datetime-local'
                    {...form.register('startDate')}
                    className='h-11 w-full bg-white text-slate-800 font-semibold border-slate-200 focus-visible:ring-brand-green/30 focus-visible:border-brand-green'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Ngày kết thúc *</Label>
                  <Input
                    type='datetime-local'
                    {...form.register('endDate')}
                    className='h-11 w-full bg-white text-slate-800 font-semibold border-slate-200 focus-visible:ring-brand-green/30 focus-visible:border-brand-green'
                  />
                </div>
              </div>

              <div className='space-y-2 mt-auto'>
                <Label>Trạng thái hiển thị</Label>
                <Controller
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className='h-11 font-semibold'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value={CouponStatus.ACTIVE}
                          className='text-emerald-600 font-medium'
                        >
                          Đang hoạt động
                        </SelectItem>
                        <SelectItem
                          value={CouponStatus.EXPIRED}
                          className='text-rose-600 font-medium'
                        >
                          Tạm khóa / Hết hạn
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className='p-5 border-t bg-white flex justify-end gap-3 shrink-0 z-10'>
        <Button type='button' variant='outline' onClick={onCancel} className='px-6 h-10'>
          {t('common.cancel', 'Hủy')}
        </Button>
        <Button
          type='submit'
          disabled={mutation.isPending || isSubmitting}
          className='px-8 h-10 bg-brand-green hover:bg-brand-green-dark shadow-md transition-all'
        >
          {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {t('form.btnUpdate', 'Cập nhật mã')}
        </Button>
      </div>
    </form>
  )
}
