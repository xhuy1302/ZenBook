'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import { getPromotionSchema, type PromotionFormValues } from '../schema/promotion.schema'
import { updatePromotionApi } from '@/services/promotion/promotion.api'
import type { PromotionRequest, PromotionResponse } from '@/services/promotion/promotion.type'
import { getAllBooksApi } from '@/services/book/book.api'

interface EditPromotionFormProps {
  promotion: PromotionResponse
  onSuccess: () => void
}

// Hàm hỗ trợ format ngày từ Backend (ISO) sang format của thẻ input type="datetime-local"
const formatDateForInput = (dateString: string) => {
  if (!dateString) return ''
  try {
    return format(new Date(dateString), "yyyy-MM-dd'T'HH:mm")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return ''
  }
}

export function EditPromotionForm({ promotion, onSuccess }: EditPromotionFormProps) {
  const { t } = useTranslation('promotion')
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')

  const { data: booksData, isLoading: isBooksLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => getAllBooksApi()
  })

  const books = booksData || []

  const filteredBooks = books.filter((book: { title: string }) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 👉 Khởi tạo dữ liệu mặc định từ thông tin của Promotion
  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(
      getPromotionSchema(t as unknown as (key: string) => string)
    ) as unknown as import('react-hook-form').Resolver<PromotionFormValues>,
    defaultValues: {
      name: promotion.name,
      description: promotion.description || '',
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      startDate: formatDateForInput(promotion.startDate),
      endDate: formatDateForInput(promotion.endDate),
      bookIds: promotion.books?.map((b) => b.id) || [] // Chuyển mảng Object thành mảng String IDs
    }
  })

  const selectedBookIds = form.watch('bookIds') || []
  const isAllSelected = books.length > 0 && selectedBookIds.length === books.length

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = books.map((b: { id: string }) => b.id)
      form.setValue('bookIds', allIds, { shouldValidate: true })
    } else {
      form.setValue('bookIds', [], { shouldValidate: true })
    }
  }

  const { errors, isDirty } = form.formState

  const mutation = useMutation({
    mutationFn: (values: PromotionFormValues) =>
      updatePromotionApi(promotion.id, values as unknown as PromotionRequest),
    onSuccess: () => {
      toast.success(t('message.success.update', 'Cập nhật khuyến mãi thành công!'))
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
      onSuccess()
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        t('message.error.update', 'Có lỗi xảy ra khi cập nhật!')
      toast.error(msg)
    }
  })

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className='space-y-6'>
      <div className='border rounded-lg p-4 space-y-4 bg-card'>
        <h3 className='font-semibold text-lg border-b pb-2'>
          {t('promotion.form.section1', 'Thông tin chung')}
        </h3>
        <div className='grid grid-cols-2 gap-4'>
          <div className='col-span-2 space-y-2'>
            <Label className={errors.name ? 'text-red-500' : ''}>
              {t('promotion.form.name', 'Tên chương trình')} <span className='text-red-500'>*</span>
            </Label>
            <Input
              {...form.register('name')}
              className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.name && (
              <p className='text-xs text-red-500 font-medium'>{errors.name.message}</p>
            )}
          </div>

          <div className='col-span-2 space-y-2'>
            <Label>{t('promotion.form.description', 'Mô tả')}</Label>
            <Textarea {...form.register('description')} rows={3} />
          </div>
        </div>
      </div>

      <div className='border rounded-lg p-4 space-y-4 bg-card'>
        <h3 className='font-semibold text-lg border-b pb-2'>
          {t('promotion.form.section2', 'Quy tắc giảm giá')}
        </h3>
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label>
              {t('promotion.form.discountType', 'Loại giảm giá')}{' '}
              <span className='text-red-500'>*</span>
            </Label>
            <Controller
              control={form.control}
              name='discountType'
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='PERCENTAGE'>
                      {t('filters.discountType.PERCENTAGE', 'Phần trăm (%)')}
                    </SelectItem>
                    <SelectItem value='FIXED_AMOUNT'>
                      {t('filters.discountType.FIXED_AMOUNT', 'Tiền mặt (VNĐ)')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className='space-y-2'>
            <Label className={errors.discountValue ? 'text-red-500' : ''}>
              {t('promotion.form.discountValue', 'Mức giảm')}{' '}
              <span className='text-red-500'>*</span>
            </Label>
            <Input
              type='number'
              {...form.register('discountValue', { valueAsNumber: true })}
              className={errors.discountValue ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.discountValue && (
              <p className='text-xs text-red-500 font-medium'>{errors.discountValue.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label className={errors.startDate ? 'text-red-500' : ''}>
              {t('promotion.form.startDate', 'Ngày bắt đầu')}{' '}
              <span className='text-red-500'>*</span>
            </Label>
            <Input
              type='datetime-local'
              {...form.register('startDate')}
              className={errors.startDate ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.startDate && (
              <p className='text-xs text-red-500 font-medium'>{errors.startDate.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label className={errors.endDate ? 'text-red-500' : ''}>
              {t('promotion.form.endDate', 'Ngày kết thúc')} <span className='text-red-500'>*</span>
            </Label>
            <Input
              type='datetime-local'
              {...form.register('endDate')}
              className={errors.endDate ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.endDate && (
              <p className='text-xs text-red-500 font-medium'>{errors.endDate.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className='border rounded-lg p-4 space-y-4 bg-card'>
        <div className='flex items-center justify-between border-b pb-2'>
          <h3 className='font-semibold text-lg'>{t('promotion.form.section3', 'Sách áp dụng')}</h3>
          {!isBooksLoading && books.length > 0 && (
            <div className='flex items-center space-x-2 bg-muted/50 px-3 py-1 rounded-full'>
              <Checkbox
                id='edit-select-all'
                checked={isAllSelected}
                onCheckedChange={handleToggleSelectAll}
              />
              <label
                htmlFor='edit-select-all'
                className='text-xs font-semibold cursor-pointer select-none'
              >
                {t('promotion.form.selectAll', 'Chọn tất cả')}
              </label>
            </div>
          )}
        </div>

        <div className='space-y-3'>
          <div className='relative'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              type='text'
              placeholder={t('promotion.form.searchBook', 'Tìm kiếm tên sách...')}
              className='pl-9'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className='border rounded-md p-4 h-[220px] overflow-y-auto bg-muted/20 space-y-3'>
            <Controller
              control={form.control}
              name='bookIds'
              render={({ field }) => (
                <>
                  {isBooksLoading ? (
                    <div className='flex flex-col items-center justify-center h-full gap-2'>
                      <Loader2 className='h-6 w-6 animate-spin text-primary' />
                    </div>
                  ) : filteredBooks.length === 0 ? (
                    <div className='flex flex-col items-center justify-center h-full text-muted-foreground'>
                      <span className='text-xs'>
                        {searchTerm
                          ? t('promotion.form.noBookFound', 'Không tìm thấy sách')
                          : t('promotion.form.noBook', 'Không có dữ liệu')}
                      </span>
                    </div>
                  ) : (
                    filteredBooks.map((book: { id: string; title: string }) => (
                      <div key={book.id} className='flex items-center space-x-2 group'>
                        <Checkbox
                          id={`edit-book-${book.id}`}
                          checked={(field.value || []).includes(book.id)}
                          onCheckedChange={(checked) => {
                            const current = field.value || []
                            const updated = checked
                              ? [...current, book.id]
                              : current.filter((id) => id !== book.id)
                            field.onChange(updated)
                          }}
                        />
                        <label
                          htmlFor={`edit-book-${book.id}`}
                          className='text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors'
                        >
                          {book.title}
                        </label>
                      </div>
                    ))
                  )}
                </>
              )}
            />
          </div>
          {errors.bookIds && (
            <p className='text-xs text-red-500 font-medium'>{errors.bookIds.message}</p>
          )}
        </div>
      </div>

      <div className='flex justify-end gap-3 border-t pt-4 sticky bottom-0 bg-background py-4 z-10'>
        <Button type='button' variant='ghost' onClick={onSuccess}>
          {t('actions.cancel', 'Hủy')}
        </Button>
        <Button type='submit' disabled={mutation.isPending || (!isDirty && form.formState.isValid)}>
          {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {t('actions.edit', 'Cập nhật')}
        </Button>
      </div>
    </form>
  )
}
