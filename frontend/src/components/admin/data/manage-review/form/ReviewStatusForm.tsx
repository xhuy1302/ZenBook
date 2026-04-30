'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, EyeOff, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next' // <-- thêm
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'

import { ReviewStatus } from '@/defines/review.enum'
import { reviewStatusSchema, type ReviewStatusFormValues } from '../schema/ReviewStatus.schema'

// Icon map giữ nguyên
const STATUS_ICONS = {
  [ReviewStatus.APPROVED]: CheckCircle2,
  [ReviewStatus.PENDING]: EyeOff,
  [ReviewStatus.REJECTED]: XCircle
}

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
  const { t } = useTranslation('review') // dùng namespace 'review'

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
                <div className='grid gap-3' role='radiogroup' aria-label={t('form.status.label')}>
                  {Object.values(ReviewStatus).map((status) => {
                    const Icon = STATUS_ICONS[status]
                    const isSelected = field.value === status
                    const isCurrent = currentStatus === status

                    const colorConfig = {
                      [ReviewStatus.APPROVED]: {
                        activeClass: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300',
                        iconClass: 'text-emerald-500',
                        baseClass: 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      },
                      [ReviewStatus.PENDING]: {
                        activeClass: 'border-amber-500 bg-amber-50 ring-2 ring-amber-300',
                        iconClass: 'text-amber-500',
                        baseClass: 'border-amber-200 bg-amber-50 text-amber-700'
                      },
                      [ReviewStatus.REJECTED]: {
                        activeClass: 'border-red-500 bg-red-50 ring-2 ring-red-300',
                        iconClass: 'text-red-500',
                        baseClass: 'border-red-200 bg-red-50 text-red-700'
                      }
                    }[status]

                    return (
                      <label
                        key={status}
                        htmlFor={`status-${status}`}
                        className={cn(
                          'flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150',
                          isSelected
                            ? colorConfig.activeClass
                            : `border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50`
                        )}
                      >
                        <input
                          type='radio'
                          id={`status-${status}`}
                          value={status}
                          checked={isSelected}
                          onChange={() => field.onChange(status)}
                          className='sr-only'
                        />
                        <Icon
                          className={cn(
                            'h-5 w-5 mt-0.5 shrink-0',
                            isSelected ? colorConfig.iconClass : 'text-slate-300'
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
                              {t(`status.${status}`)} {/* label */}
                            </span>
                            {isCurrent && (
                              <span className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500'>
                                {t('form.status.current')}
                              </span>
                            )}
                          </div>
                          <p
                            className={cn(
                              'text-xs mt-0.5',
                              isSelected ? 'opacity-80' : 'text-slate-400'
                            )}
                          >
                            {t(`status.${status}Description`)} {/* description */}
                          </p>
                        </div>
                        {/* Radio dot */}
                        <div
                          className={cn(
                            'w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all',
                            isSelected
                              ? `border-current ${colorConfig.iconClass}`
                              : 'border-slate-300'
                          )}
                        >
                          {isSelected && <div className='w-2 h-2 rounded-full bg-current' />}
                        </div>
                      </label>
                    )
                  })}
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
              {t('form.cancel')}
            </Button>
          )}
          <Button
            type='submit'
            size='sm'
            disabled={isLoading || !selectedStatus || selectedStatus === currentStatus}
            className='h-9 px-5 text-sm font-medium gap-1.5 bg-slate-800 hover:bg-slate-900 text-white min-w-[120px]'
          >
            {isLoading ? t('form.saving') : t('form.confirmChange')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
