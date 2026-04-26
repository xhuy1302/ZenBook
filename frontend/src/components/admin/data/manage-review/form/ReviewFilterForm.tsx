'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search, RotateCcw, SlidersHorizontal } from 'lucide-react'

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

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

import { ReviewStatus } from '@/defines/review.enum'
import { reviewFilterSchema, type ReviewFilterFormValues } from '../schema/ReviewFilter.schema'

const RATING_OPTIONS = [
  { value: 1, label: '⭐ 1 sao', urgent: true },
  { value: 2, label: '⭐⭐ 2 sao', urgent: true },
  { value: 3, label: '⭐⭐⭐ 3 sao', urgent: false },
  { value: 4, label: '⭐⭐⭐⭐ 4 sao', urgent: false },
  { value: 5, label: '⭐⭐⭐⭐⭐ 5 sao', urgent: false }
]

const STATUS_OPTIONS = [
  { value: ReviewStatus.PENDING, label: 'Chờ duyệt / Ẩn', color: 'bg-amber-100 text-amber-700' },
  { value: ReviewStatus.APPROVED, label: 'Đã duyệt', color: 'bg-emerald-100 text-emerald-700' },
  { value: ReviewStatus.REJECTED, label: 'Từ chối', color: 'bg-red-100 text-red-700' }
]

interface ReviewFilterFormProps {
  defaultValues?: Partial<ReviewFilterFormValues>
  onSubmit: (values: ReviewFilterFormValues) => void
  isLoading?: boolean
}

export function ReviewFilterForm({ defaultValues, onSubmit, isLoading }: ReviewFilterFormProps) {
  const form = useForm<ReviewFilterFormValues>({
    resolver: zodResolver(reviewFilterSchema),
    defaultValues: {
      bookId: defaultValues?.bookId || '',
      rating: defaultValues?.rating,
      status: defaultValues?.status,
      fromDate: defaultValues?.fromDate || '',
      toDate: defaultValues?.toDate || '',
      page: defaultValues?.page ?? 0,
      size: defaultValues?.size ?? 10
    }
  })

  const handleReset = () => {
    form.reset({
      bookId: '',
      rating: undefined,
      status: undefined,
      fromDate: '',
      toDate: '',
      page: 0,
      size: 10
    })
    form.handleSubmit(onSubmit)()
  }

  const watchedValues = form.watch()
  const activeFilterCount = [
    watchedValues.bookId,
    watchedValues.rating,
    watchedValues.status,
    watchedValues.fromDate,
    watchedValues.toDate
  ].filter(Boolean).length

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 text-sm font-semibold text-slate-700'>
            <SlidersHorizontal className='h-4 w-4 text-slate-500' />
            Bộ lọc tìm kiếm
            {activeFilterCount > 0 && (
              <Badge variant='secondary' className='bg-blue-100 text-blue-700 text-xs px-1.5'>
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={handleReset}
            className='text-slate-500 hover:text-slate-700 h-8 px-2 text-xs'
          >
            <RotateCcw className='h-3 w-3 mr-1' />
            Đặt lại
          </Button>
        </div>

        <Separator />

        {/* Filter Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3'>
          {/* Book ID */}
          <FormField
            control={form.control}
            name='bookId'
            render={({ field }) => (
              <FormItem className='space-y-1.5'>
                <FormLabel className='text-xs font-medium text-slate-600'>Mã sách</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Nhập mã sách...'
                    {...field}
                    value={field.value ?? ''}
                    className='h-9 text-sm border-slate-200 focus:border-blue-400 focus:ring-blue-100'
                  />
                </FormControl>
                <FormMessage className='text-xs' />
              </FormItem>
            )}
          />

          {/* Rating Filter */}
          <FormField
            control={form.control}
            name='rating'
            render={({ field }) => (
              <FormItem className='space-y-1.5'>
                <FormLabel className='text-xs font-medium text-slate-600'>
                  Số sao
                  <span className='ml-1 text-red-400 text-[10px]'>(1-2★ cần xử lý)</span>
                </FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(val === 'all' ? undefined : Number(val))}
                  value={field.value ? String(field.value) : 'all'}
                >
                  <FormControl>
                    <SelectTrigger className='h-9 text-sm border-slate-200 focus:border-blue-400'>
                      <SelectValue placeholder='Tất cả' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='all'>Tất cả số sao</SelectItem>
                    {RATING_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        <span className='flex items-center gap-2'>
                          {opt.label}
                          {opt.urgent && (
                            <Badge className='text-[10px] px-1 py-0 bg-red-100 text-red-600 border-0'>
                              Gấp
                            </Badge>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className='text-xs' />
              </FormItem>
            )}
          />

          {/* Status Filter */}
          <FormField
            control={form.control}
            name='status'
            render={({ field }) => (
              <FormItem className='space-y-1.5'>
                <FormLabel className='text-xs font-medium text-slate-600'>Trạng thái</FormLabel>
                <Select
                  onValueChange={(val) =>
                    field.onChange(val === 'all' ? undefined : (val as ReviewStatus))
                  }
                  value={field.value ?? 'all'}
                >
                  <FormControl>
                    <SelectTrigger className='h-9 text-sm border-slate-200 focus:border-blue-400'>
                      <SelectValue placeholder='Tất cả' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='all'>Tất cả trạng thái</SelectItem>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${opt.color}`}
                        >
                          {opt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className='text-xs' />
              </FormItem>
            )}
          />

          {/* From Date */}
          <FormField
            control={form.control}
            name='fromDate'
            render={({ field }) => (
              <FormItem className='space-y-1.5'>
                <FormLabel className='text-xs font-medium text-slate-600'>Từ ngày</FormLabel>
                <FormControl>
                  <Input
                    type='date'
                    {...field}
                    value={field.value ?? ''}
                    className='h-9 text-sm border-slate-200 focus:border-blue-400 focus:ring-blue-100'
                  />
                </FormControl>
                <FormMessage className='text-xs' />
              </FormItem>
            )}
          />

          {/* To Date */}
          <FormField
            control={form.control}
            name='toDate'
            render={({ field }) => (
              <FormItem className='space-y-1.5'>
                <FormLabel className='text-xs font-medium text-slate-600'>Đến ngày</FormLabel>
                <FormControl>
                  <Input
                    type='date'
                    {...field}
                    value={field.value ?? ''}
                    className='h-9 text-sm border-slate-200 focus:border-blue-400 focus:ring-blue-100'
                  />
                </FormControl>
                <FormMessage className='text-xs' />
              </FormItem>
            )}
          />
        </div>

        {/* Page size + Submit row */}
        <div className='flex items-center justify-between gap-3 pt-1'>
          <div className='flex items-center gap-2'>
            <Label className='text-xs font-medium text-slate-600 whitespace-nowrap'>Hiển thị</Label>
            <FormField
              control={form.control}
              name='size'
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger className='h-8 w-20 text-xs border-slate-200'>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[10, 20, 50].map((n) => (
                        <SelectItem key={n} value={String(n)} className='text-xs'>
                          {n} dòng
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <Button
            type='submit'
            disabled={isLoading}
            className='h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium gap-2'
          >
            <Search className='h-4 w-4' />
            {isLoading ? 'Đang tìm...' : 'Tìm kiếm'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
