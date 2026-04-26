'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, EyeOff, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'

import { ReviewStatus } from '@/defines/review.enum'
import { reviewStatusSchema, type ReviewStatusFormValues } from '../schema/ReviewStatus.schema'

const STATUS_CONFIG = [
  {
    value: ReviewStatus.APPROVED,
    label: 'Phê duyệt',
    description: 'Hiển thị đánh giá công khai trên trang sản phẩm',
    Icon: CheckCircle2,
    colorClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    activeClass: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300',
    iconClass: 'text-emerald-500'
  },
  {
    value: ReviewStatus.PENDING,
    label: 'Ẩn tạm thời',
    description: 'Ẩn khỏi trang sản phẩm nhưng vẫn lưu trong hệ thống',
    Icon: EyeOff,
    colorClass: 'border-amber-200 bg-amber-50 text-amber-700',
    activeClass: 'border-amber-500 bg-amber-50 ring-2 ring-amber-300',
    iconClass: 'text-amber-500'
  },
  {
    value: ReviewStatus.REJECTED,
    label: 'Từ chối',
    description: 'Vi phạm chính sách — spam, ngôn từ không phù hợp',
    Icon: XCircle,
    colorClass: 'border-red-200 bg-red-50 text-red-700',
    activeClass: 'border-red-500 bg-red-50 ring-2 ring-red-300',
    iconClass: 'text-red-500'
  }
] as const

interface ReviewStatusFormProps {
  currentStatus?: ReviewStatus
  isLoading?: boolean
  onSubmit: (values: ReviewStatusFormValues) => void
  onCancel?: () => void
}

export function ReviewStatusForm({
  currentStatus,
  isLoading = false,
  onSubmit,
  onCancel
}: ReviewStatusFormProps) {
  const form = useForm<ReviewStatusFormValues>({
    resolver: zodResolver(reviewStatusSchema),
    defaultValues: {
      status: currentStatus
    }
  })

  const selectedStatus = form.watch('status')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='status'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className='grid gap-3' role='radiogroup' aria-label='Chọn trạng thái'>
                  {STATUS_CONFIG.map(
                    ({ value, label, description, Icon, activeClass, iconClass }) => {
                      const isSelected = field.value === value
                      const isCurrent = currentStatus === value

                      return (
                        <label
                          key={value}
                          htmlFor={`status-${value}`}
                          className={cn(
                            'flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150',
                            isSelected
                              ? activeClass
                              : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                          )}
                        >
                          <input
                            type='radio'
                            id={`status-${value}`}
                            value={value}
                            checked={isSelected}
                            onChange={() => field.onChange(value)}
                            className='sr-only'
                          />
                          <Icon
                            className={cn(
                              'h-5 w-5 mt-0.5 shrink-0',
                              isSelected ? iconClass : 'text-slate-300'
                            )}
                          />
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2'>
                              <span
                                className={cn(
                                  'text-sm font-semibold',
                                  isSelected ? '' : 'text-slate-700'
                                )}
                              >
                                {label}
                              </span>
                              {isCurrent && (
                                <span className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500'>
                                  Hiện tại
                                </span>
                              )}
                            </div>
                            <p
                              className={cn(
                                'text-xs mt-0.5',
                                isSelected ? 'opacity-80' : 'text-slate-400'
                              )}
                            >
                              {description}
                            </p>
                          </div>
                          {/* Radio dot */}
                          <div
                            className={cn(
                              'w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all',
                              isSelected ? `border-current ${iconClass}` : 'border-slate-300'
                            )}
                          >
                            {isSelected && <div className='w-2 h-2 rounded-full bg-current' />}
                          </div>
                        </label>
                      )
                    }
                  )}
                </div>
              </FormControl>
              <FormMessage className='text-xs' />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className='flex items-center justify-end gap-2 pt-2 border-t border-slate-100'>
          {onCancel && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onCancel}
              disabled={isLoading}
              className='h-9 px-4 text-sm border-slate-200 text-slate-600'
            >
              Huỷ
            </Button>
          )}
          <Button
            type='submit'
            size='sm'
            disabled={isLoading || !selectedStatus || selectedStatus === currentStatus}
            className='h-9 px-5 text-sm font-medium gap-1.5 bg-slate-800 hover:bg-slate-900 text-white min-w-[120px]'
          >
            {isLoading ? 'Đang lưu...' : 'Xác nhận thay đổi'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
