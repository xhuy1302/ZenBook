'use client'

import { useContext, useMemo } from 'react' // 👉 THÊM: useMemo
import { useForm, Controller, useFieldArray, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, UploadCloud, User, Info, BookX } from 'lucide-react' // 👉 THÊM: icon BookX
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

import { AuthContext } from '@/context/AuthContext'
import { getReceiptSchema, type ReceiptFormValues } from '../schema/receipt.schema'
import { createReceiptApi } from '@/services/receipt/receipt.api'
import type { ReceiptRequest } from '@/services/receipt/receipt.type'
import { getAllPublishersApi } from '@/services/publisher/publisher.api'
import { getAllBooksApi } from '@/services/book/book.api'

import type { PublisherResponse } from '@/services/publisher/publisher.type'
import type { BookResponse } from '@/services/book/book.type'

export function CreateReceiptForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation('receipt')
  const queryClient = useQueryClient()

  const authContext = useContext(AuthContext)
  const user = authContext?.user

  const { data: publishersData, isLoading: isPublishersLoading } = useQuery({
    queryKey: ['publishers'],
    queryFn: () => getAllPublishersApi() as Promise<PublisherResponse[]>
  })

  const { data: booksData, isLoading: isBooksLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => getAllBooksApi() as Promise<BookResponse[]>
  })

  const publishers: PublisherResponse[] = publishersData || []
  const allBooks: BookResponse[] = booksData || [] // 👉 ĐỔI TÊN THÀNH allBooks

  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(
      getReceiptSchema(t as unknown as (key: string, fallback?: string) => string, allBooks)
    ) as unknown as Resolver<ReceiptFormValues>,
    defaultValues: {
      publisherId: '',
      note: '',
      details: [{ bookId: '', quantity: 1, importPrice: 0 }]
    }
  })

  const { errors } = form.formState
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'details'
  })

  const mutation = useMutation({
    mutationFn: (values: ReceiptFormValues) =>
      createReceiptApi(values as unknown as ReceiptRequest),
    onSuccess: async () => {
      toast.success(t('receipt.message.createSuccess', 'Tạo phiếu nhập nháp thành công!'))
      await queryClient.invalidateQueries({
        queryKey: ['receipts'],
        exact: false
      })
      onSuccess()
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        t('receipt.message.createError', 'Lỗi khi tạo phiếu nhập!')
      toast.error(msg)
    }
  })

  // 👉 LẤY VÀ LỌC DỮ LIỆU
  const watchedPublisherId = form.watch('publisherId') // Lấy NXB đang được chọn
  const watchedDetails = form.watch('details') as ReceiptFormValues['details']

  // 👉 TẠO DANH SÁCH SÁCH ĐÃ LỌC: Chỉ lấy sách thuộc NXB đang chọn
  const filteredBooks = useMemo(() => {
    if (!watchedPublisherId) return [] // Nếu chưa chọn NXB thì mảng sách trống

    return allBooks.filter((book) => {
      const bookPubId =
        book.publisher?.id || (book as unknown as { publisherId?: string }).publisherId

      return bookPubId === watchedPublisherId
    })
  }, [allBooks, watchedPublisherId])

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className='space-y-6'>
      <div className='border rounded-lg p-4 space-y-4 bg-card'>
        <h3 className='font-semibold text-lg border-b pb-2'>
          {t('receipt.form.sectionGeneral', 'Thông tin chung')}
        </h3>
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label className={errors.publisherId ? 'text-red-500' : ''}>
              {t('receipt.form.publisher', 'Nhà xuất bản')} <span className='text-red-500'>*</span>
            </Label>
            <Controller
              control={form.control}
              name='publisherId'
              render={({ field }) => (
                <Select
                  value={field.value}
                  // 👉 Khi NXB thay đổi, tự động XÓA danh sách sách cũ ở lưới dưới để tránh dính sách của NXB khác
                  onValueChange={(val) => {
                    field.onChange(val)
                    form.setValue('details', [{ bookId: '', quantity: 1, importPrice: 0 }])
                  }}
                  disabled={isPublishersLoading}
                >
                  <SelectTrigger
                    className={errors.publisherId ? 'border-red-500 focus:ring-red-500' : ''}
                  >
                    <SelectValue
                      placeholder={t('receipt.form.publisherPlaceholder', 'Chọn nhà xuất bản...')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {publishers.map((p: PublisherResponse) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name || (p as unknown as { publisherName?: string }).publisherName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.publisherId && (
              <p className='text-xs text-red-500 font-medium'>{errors.publisherId.message}</p>
            )}
          </div>

          {/* ... (Các thẻ Input User, Note, Upload giữ nguyên) ... */}
          <div className='space-y-2'>
            <Label className='flex items-center gap-1.5 text-muted-foreground'>
              <User className='w-3.5 h-3.5' />
              {t('receipt.form.creator', 'Người lập phiếu')}
            </Label>
            <Input
              value={user?.fullName || user?.username || 'Đang tải...'}
              readOnly
              disabled
              className='bg-muted/50 cursor-not-allowed font-medium text-primary'
            />
          </div>

          <div className='col-span-2 space-y-2'>
            <Label>{t('receipt.form.note', 'Ghi chú')}</Label>
            <Textarea
              {...form.register('note')}
              rows={2}
              placeholder={t('receipt.form.notePlaceholder', 'Ghi chú đơn nhập...')}
            />
          </div>

          <div className='col-span-2 space-y-2 border-t pt-3 mt-1'>
            <Label className='flex items-center gap-2'>
              <UploadCloud className='w-4 h-4 text-muted-foreground' />
              {t('receipt.form.attachment', 'File đính kèm (Hóa đơn / Chứng từ)')}
            </Label>
            <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
              <Input
                type='file'
                accept='image/*, application/pdf'
                className='w-full sm:w-1/2 cursor-pointer bg-muted/20'
              />
              <span className='text-[10px] text-muted-foreground italic'>
                {t('receipt.form.supportFiles', 'Hỗ trợ JPG, PNG, PDF (Tối đa 5MB)')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='border rounded-lg p-4 space-y-4 bg-card'>
        <div className='flex items-center justify-between border-b pb-2'>
          <h3 className='font-semibold text-lg'>
            {t('receipt.form.sectionDetails', 'Chi tiết nhập hàng')}
            {errors.details?.root && (
              <span className='ml-3 text-xs text-red-500 font-normal'>
                {errors.details.root.message}
              </span>
            )}
          </h3>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => append({ bookId: '', quantity: 1, importPrice: 0 })}
            className='h-8 px-2 flex items-center gap-1'
            disabled={!watchedPublisherId} // 👉 KHÓA NÚT THÊM SÁCH NẾU CHƯA CHỌN NXB
          >
            <Plus className='h-4 w-4' /> {t('receipt.action.addBook', 'Thêm sách')}
          </Button>
        </div>

        {/* 👉 NẾU CHƯA CHỌN NXB -> Hiện thông báo yêu cầu chọn trước */}
        {!watchedPublisherId ? (
          <div className='py-8 text-center text-muted-foreground flex flex-col items-center justify-center bg-muted/20 border border-dashed rounded-lg'>
            <BookX className='w-8 h-8 mb-2 opacity-50' />
            <p className='text-sm'>
              Vui lòng chọn <strong>Nhà xuất bản</strong> ở trên trước khi chọn sách nhập.
            </p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className='py-8 text-center text-muted-foreground flex flex-col items-center justify-center bg-muted/20 border border-dashed rounded-lg'>
            <BookX className='w-8 h-8 mb-2 opacity-50' />
            <p className='text-sm'>Không tìm thấy sách nào thuộc Nhà xuất bản này.</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {fields.map((field, index) => {
              const rowErrors = errors.details?.[index]
              const selectedBookId = watchedDetails[index]?.bookId
              // 👉 Tìm sách tham chiếu từ danh sách TẤT CẢ (vì Zod vẫn cần)
              const selectedBook = allBooks.find((b) => b.id === selectedBookId)

              return (
                <div
                  key={field.id}
                  className='flex items-start gap-3 p-3 border rounded-md bg-muted/20'
                >
                  <div className='flex-1 space-y-2'>
                    <Label className={rowErrors?.bookId ? 'text-red-500' : ''}>
                      {t('receipt.form.book', 'Sách')}
                    </Label>
                    <Controller
                      control={form.control}
                      name={`details.${index}.bookId`}
                      render={({ field: selectField }) => (
                        <Select
                          value={selectField.value}
                          onValueChange={selectField.onChange}
                          disabled={isBooksLoading}
                        >
                          <SelectTrigger className={rowErrors?.bookId ? 'border-red-500' : ''}>
                            <SelectValue
                              placeholder={t('receipt.form.bookPlaceholder', 'Chọn sách...')}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {/* 👉 RENDER DANH SÁCH SÁCH ĐÃ LỌC */}
                            {filteredBooks.map((b: BookResponse) => (
                              <SelectItem key={b.id} value={b.id}>
                                {b.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {rowErrors?.bookId && (
                      <p className='text-[10px] text-red-500'>{rowErrors.bookId.message}</p>
                    )}

                    {selectedBook && (
                      <div className='flex items-center gap-1.5 mt-1.5 text-[11px] text-muted-foreground bg-background p-1.5 rounded border'>
                        <Info className='w-3 h-3 text-blue-500' />
                        <span>
                          Bìa:{' '}
                          <strong className='text-foreground'>
                            {new Intl.NumberFormat('vi-VN').format(selectedBook.originalPrice)}đ
                          </strong>{' '}
                          | Bán:{' '}
                          <strong className='text-orange-600'>
                            {new Intl.NumberFormat('vi-VN').format(selectedBook.salePrice)}đ
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className='w-24 space-y-2 shrink-0'>
                    <Label className={rowErrors?.quantity ? 'text-red-500' : ''}>
                      {t('receipt.form.quantity', 'SL')}
                    </Label>
                    <Input
                      type='number'
                      {...form.register(`details.${index}.quantity`, { valueAsNumber: true })}
                      className={rowErrors?.quantity ? 'border-red-500' : ''}
                    />
                    {rowErrors?.quantity && (
                      <p className='text-[10px] text-red-500'>{rowErrors.quantity.message}</p>
                    )}
                  </div>

                  <div className='w-32 space-y-2 shrink-0'>
                    <Label className={rowErrors?.importPrice ? 'text-red-500' : ''}>
                      {t('receipt.form.importPrice', 'Giá nhập')}
                    </Label>
                    <Input
                      type='number'
                      {...form.register(`details.${index}.importPrice`, { valueAsNumber: true })}
                      className={rowErrors?.importPrice ? 'border-red-500' : ''}
                    />
                    {rowErrors?.importPrice && (
                      <p className='text-[10px] text-red-500'>{rowErrors.importPrice.message}</p>
                    )}
                  </div>

                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='mt-7 text-red-500 hover:bg-red-50 hover:text-red-600'
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className='flex justify-end gap-3 border-t pt-4 sticky bottom-0 bg-background py-4 z-10'>
        <Button type='button' variant='ghost' onClick={onSuccess}>
          {t('common.cancel', 'Hủy')}
        </Button>
        <Button type='submit' disabled={mutation.isPending || !watchedPublisherId}>
          {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {t('receipt.form.btnCreate', 'Lưu bản nháp')}
        </Button>
      </div>
    </form>
  )
}
