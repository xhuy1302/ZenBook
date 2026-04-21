'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
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

import { getCouponSchema, type CouponFormValues } from '../schema/coupon.schema'
import { createCouponApi } from '@/services/coupon/coupon.api'
import { CouponStatus, DiscountType } from '@/defines/coupon.enum'
import type { CouponRequest } from '@/services/coupon/coupon.type'

import { getAllCategoriesApi } from '@/services/category/category.api'
import type { CategoryResponse } from '@/services/category/category.type'

export function CreateCouponForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation('coupon')
  const queryClient = useQueryClient()

  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getAllCategoriesApi()
  })
  const categories = categoriesData || []

  const today = new Date()
  const nextMonth = new Date()
  nextMonth.setMonth(today.getMonth() + 1)

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(
      getCouponSchema(t as unknown as (key: string) => string)
    ) as unknown as import('react-hook-form').Resolver<CouponFormValues>,
    defaultValues: {
      code: '',
      discountType: DiscountType.PERCENTAGE,
      discountValue: undefined as unknown as number,
      // Ép chặt null ngay từ đầu để Zod không bị ngợp
      maxDiscountAmount: null as unknown as number,
      minOrderValue: 0,
      usageLimit: null as unknown as number,
      maxUsagePerUser: 1,
      status: CouponStatus.ACTIVE,
      categoryId: undefined,
      startDate: format(today, "yyyy-MM-dd'T'HH:mm"),
      endDate: format(nextMonth, "yyyy-MM-dd'T'HH:mm")
    }
  })

  const { errors } = form.formState
  const watch = form.watch
  const currentDiscountType = watch('discountType')

  const mutation = useMutation({
    mutationFn: (values: CouponFormValues) => createCouponApi(values as unknown as CouponRequest),
    onSuccess: () => {
      toast.success(t('messages.createSuccess', 'Tạo mã giảm giá thành công!'))
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      onSuccess()
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        t('messages.createError', 'Có lỗi xảy ra!')
      toast.error(msg)
    }
  })

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className='space-y-6'>
      {/* SECTION 1: THÔNG TIN CƠ BẢN */}
      <div className='border rounded-lg p-4 space-y-4 bg-card'>
        <h3 className='font-semibold text-lg border-b pb-2'>
          {t('form.section1', '1. Thông tin cơ bản')}
        </h3>
        <div className='grid grid-cols-2 gap-4'>
          <div className='col-span-2 sm:col-span-1 space-y-2'>
            <Label className={errors.code ? 'text-red-500' : ''}>
              {t('form.code', 'Mã Code')} <span className='text-red-500'>*</span>
            </Label>
            <Input
              {...form.register('code')}
              placeholder='VD: SUMMER2026'
              className={`uppercase ${errors.code ? 'border-red-500' : ''}`}
            />
            {errors.code && <p className='text-[10px] text-red-500'>{errors.code.message}</p>}
          </div>

          <div className='col-span-2 sm:col-span-1 space-y-2'>
            <Label>{t('form.discountType', 'Loại giảm giá')}</Label>
            <Controller
              control={form.control}
              name='discountType'
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val)
                    if (val === DiscountType.FIXED_AMOUNT) {
                      // FIX CHÍNH LÀ ĐÂY: Phải là null as any để Zod xử lý đúng
                      form.setValue('maxDiscountAmount', null as unknown as number, {
                        shouldValidate: true
                      })
                      form.clearErrors('maxDiscountAmount')
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DiscountType.PERCENTAGE}>Giảm theo phần trăm (%)</SelectItem>
                    <SelectItem value={DiscountType.FIXED_AMOUNT}>Giảm tiền mặt (đ)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className='col-span-2 sm:col-span-1 space-y-2'>
            <Label className={errors.discountValue ? 'text-red-500' : ''}>
              {t('form.discountValue', 'Giá trị giảm')} <span className='text-red-500'>*</span>
            </Label>
            <Input
              type='number'
              {...form.register('discountValue', { valueAsNumber: true })}
              placeholder={currentDiscountType === 'PERCENTAGE' ? 'VD: 15' : 'VD: 50000'}
              className={errors.discountValue ? 'border-red-500' : ''}
            />
            {errors.discountValue && (
              <p className='text-[10px] text-red-500'>{errors.discountValue.message}</p>
            )}
          </div>

          <div className='col-span-2 sm:col-span-1 space-y-2'>
            <Label className={errors.maxDiscountAmount ? 'text-red-500' : ''}>
              {t('form.maxDiscount', 'Giảm tối đa (đ)')}
            </Label>
            <Input
              type='number'
              {...form.register('maxDiscountAmount', {
                setValueAs: (v) => {
                  // Gom tất cả những thứ không hợp lệ thành null
                  if (v === '' || v === undefined || v === null) return null
                  const num = Number(v)
                  return Number.isNaN(num) ? null : num
                }
              })}
              placeholder='VD: 50000'
              disabled={currentDiscountType === DiscountType.FIXED_AMOUNT}
              className={`${currentDiscountType === DiscountType.FIXED_AMOUNT ? 'bg-muted cursor-not-allowed' : ''} ${errors.maxDiscountAmount ? 'border-red-500' : ''}`}
            />
            {currentDiscountType === DiscountType.PERCENTAGE && !errors.maxDiscountAmount && (
              <p className='text-[10px] text-muted-foreground italic'>
                {t('form.maxDiscountNote', 'Nên điền nếu giảm theo %')}
              </p>
            )}
            {errors.maxDiscountAmount && (
              <p className='text-[10px] text-red-500'>{errors.maxDiscountAmount.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: ĐIỀU KIỆN ÁP DỤNG */}
      <div className='border rounded-lg p-4 space-y-4 bg-card'>
        <h3 className='font-semibold text-lg border-b pb-2'>
          {t('form.section2', '2. Điều kiện áp dụng')}
        </h3>
        <div className='grid grid-cols-2 gap-4'>
          <div className='col-span-2 sm:col-span-1 space-y-2'>
            <Label className={errors.minOrderValue ? 'text-red-500' : ''}>
              {t('form.minOrder', 'Đơn hàng tối thiểu (đ)')} <span className='text-red-500'>*</span>
            </Label>
            <Input
              type='number'
              {...form.register('minOrderValue', { valueAsNumber: true })}
              className={errors.minOrderValue ? 'border-red-500' : ''}
            />
            {errors.minOrderValue && (
              <p className='text-[10px] text-red-500'>{errors.minOrderValue.message}</p>
            )}
          </div>

          <div className='col-span-2 sm:col-span-1 space-y-2'>
            <Label>{t('form.usageLimit', 'Tổng lượt dùng hệ thống')}</Label>
            <Input
              type='number'
              {...form.register('usageLimit', {
                setValueAs: (v) => {
                  if (v === '' || v === undefined || v === null) return null
                  const num = Number(v)
                  return Number.isNaN(num) ? null : num
                }
              })}
              placeholder='Để trống = Không giới hạn'
            />
          </div>

          <div className='col-span-2 sm:col-span-1 space-y-2'>
            <Label className={errors.maxUsagePerUser ? 'text-red-500' : ''}>
              {t('form.maxUsagePerUser', 'Giới hạn / Người dùng')}{' '}
              <span className='text-red-500'>*</span>
            </Label>
            <Input
              type='number'
              {...form.register('maxUsagePerUser', { valueAsNumber: true })}
              className={errors.maxUsagePerUser ? 'border-red-500' : ''}
            />
            {errors.maxUsagePerUser && (
              <p className='text-[10px] text-red-500'>{errors.maxUsagePerUser.message}</p>
            )}
          </div>

          <div className='col-span-2 sm:col-span-1 space-y-2'>
            <Label>{t('form.category', 'Chỉ áp dụng cho Danh mục (Tuỳ chọn)')}</Label>
            <Controller
              control={form.control}
              name='categoryId'
              render={({ field }) => (
                <Select
                  value={field.value || 'ALL'}
                  onValueChange={(val) => field.onChange(val === 'ALL' ? null : val)}
                  disabled={isCategoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn danh mục...' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>-- Tất cả danh mục --</SelectItem>
                    {categories.map((c: CategoryResponse) => (
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
      </div>

      {/* SECTION 3: THỜI GIAN & TRẠNG THÁI */}
      <div className='border rounded-lg p-4 space-y-4 bg-card'>
        <h3 className='font-semibold text-lg border-b pb-2'>
          {t('form.section3', '3. Thời gian & Trạng thái')}
        </h3>
        <div className='grid grid-cols-2 gap-4'>
          <div className='col-span-2 sm:col-span-1 space-y-2'>
            <Label className={errors.startDate ? 'text-red-500' : ''}>
              {t('form.startDate', 'Bắt đầu từ')} <span className='text-red-500'>*</span>
            </Label>
            <Input
              type='datetime-local'
              {...form.register('startDate')}
              className={errors.startDate ? 'border-red-500' : ''}
            />
            {errors.startDate && (
              <p className='text-[10px] text-red-500'>{errors.startDate.message}</p>
            )}
          </div>

          <div className='col-span-2 sm:col-span-1 space-y-2'>
            <Label className={errors.endDate ? 'text-red-500' : ''}>
              {t('form.endDate', 'Kết thúc vào')} <span className='text-red-500'>*</span>
            </Label>
            <Input
              type='datetime-local'
              {...form.register('endDate')}
              className={errors.endDate ? 'border-red-500' : ''}
            />
            {errors.endDate && <p className='text-[10px] text-red-500'>{errors.endDate.message}</p>}
          </div>

          <div className='col-span-2 space-y-2'>
            <Label>{t('common.status', 'Trạng thái')}</Label>
            <Controller
              control={form.control}
              name='status'
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className='w-[200px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CouponStatus).map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`fields.status.options.${s}`, s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

      <div className='flex justify-end gap-3 border-t pt-4 sticky bottom-0 bg-background py-4 z-10'>
        <Button type='button' variant='ghost' onClick={onSuccess}>
          {t('common.cancel', 'Hủy')}
        </Button>
        <Button type='submit' disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {t('form.btnCreate', 'Tạo mã giảm giá')}
        </Button>
      </div>
    </form>
  )
}
