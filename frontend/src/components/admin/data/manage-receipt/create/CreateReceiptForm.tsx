'use client'

import { useContext } from 'react'
import { useForm, Controller, useFieldArray, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, User, Info, Truck } from 'lucide-react'
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
import { getAllSuppliersApi } from '@/services/supplier/supplier.api' // 👉 Đổi API sang Supplier
import { getAllBooksApi } from '@/services/book/book.api'

import type { SupplierResponse } from '@/services/supplier/supplier.type' // 👉 Đổi Type sang Supplier
import type { BookResponse } from '@/services/book/book.type'

export function CreateReceiptForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation('receipt')
  const queryClient = useQueryClient()

  const authContext = useContext(AuthContext)
  const user = authContext?.user

  // 1. LẤY DANH SÁCH NHÀ CUNG CẤP
  const { data: suppliersData, isLoading: isSuppliersLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => getAllSuppliersApi() as Promise<SupplierResponse[]>
  })

  // 2. LẤY TẤT CẢ SÁCH (Không lọc nữa)
  const { data: booksData, isLoading: isBooksLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => getAllBooksApi() as Promise<BookResponse[]>
  })

  const suppliers: SupplierResponse[] = suppliersData || []
  const allBooks: BookResponse[] = booksData || []

  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(
      getReceiptSchema(t as unknown as (key: string, fallback?: string) => string, allBooks)
    ) as unknown as Resolver<ReceiptFormValues>,
    defaultValues: {
      supplierId: '',
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
      await queryClient.invalidateQueries({ queryKey: ['receipts'], exact: false })
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('message.createError'))
    }
  })

  const watchedSupplierId = form.watch('supplierId')
  const watchedDetails = form.watch('details')

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className='space-y-6'>
      {/* SECTION 1: THÔNG TIN CHUNG */}
      <div className='border rounded-lg p-4 space-y-4 bg-card'>
        <h3 className='font-semibold text-lg border-b pb-2 flex items-center gap-2'>
          <Info className='w-5 h-5 text-primary' />{' '}
          {t('receipt.form.sectionGeneral', 'Thông tin chung')}
        </h3>
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label className={errors.supplierId ? 'text-red-500' : 'flex items-center gap-1.5'}>
              <Truck className='w-3.5 h-3.5' /> {t('receipt.form.supplier', 'Nhà cung cấp')}{' '}
              <span className='text-red-500'>*</span>
            </Label>
            <Controller
              control={form.control}
              name='supplierId'
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSuppliersLoading}
                >
                  <SelectTrigger className={errors.supplierId ? 'border-red-500' : ''}>
                    <SelectValue
                      placeholder={t('receipt.form.supplierPlaceholder', 'Chọn nhà cung cấp...')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.supplierId && (
              <p className='text-xs text-red-500'>{errors.supplierId.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label className='flex items-center gap-1.5 text-muted-foreground'>
              <User className='w-3.5 h-3.5' /> {t('receipt.form.creator', 'Người lập phiếu')}
            </Label>
            <Input
              value={user?.fullName || 'Admin'}
              readOnly
              disabled
              className='bg-muted/50 cursor-not-allowed'
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
        </div>
      </div>

      {/* SECTION 2: CHI TIẾT NHẬP HÀNG */}
      <div className='border rounded-lg p-4 space-y-4 bg-card'>
        <div className='flex items-center justify-between border-b pb-2'>
          <h3 className='font-semibold text-lg'>
            {t('receipt.form.sectionDetails', 'Chi tiết nhập hàng')}
          </h3>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => append({ bookId: '', quantity: 1, importPrice: 0 })}
            className='h-8 px-2'
          >
            <Plus className='h-4 w-4 mr-1' /> {t('receipt.action.addBook', 'Thêm dòng')}
          </Button>
        </div>

        <div className='space-y-4'>
          {fields.map((field, index) => {
            const rowErrors = errors.details?.[index]
            const selectedBook = allBooks.find((b) => b.id === watchedDetails[index]?.bookId)

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
                      <Select value={selectField.value} onValueChange={selectField.onChange}>
                        <SelectTrigger className={rowErrors?.bookId ? 'border-red-500' : ''}>
                          <SelectValue placeholder='Chọn sách...' />
                        </SelectTrigger>
                        <SelectContent>
                          {allBooks.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {selectedBook && (
                    <p className='text-[10px] text-muted-foreground italic'>
                      Giá bán hiện tại:{' '}
                      {new Intl.NumberFormat('vi-VN').format(selectedBook.salePrice)}đ
                    </p>
                  )}
                  {rowErrors?.bookId && (
                    <p className='text-[10px] text-red-500'>{rowErrors.bookId.message}</p>
                  )}
                </div>

                <div className='w-24 space-y-2'>
                  <Label>{t('receipt.form.quantity', 'SL')}</Label>
                  <Input
                    type='number'
                    {...form.register(`details.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>

                <div className='w-32 space-y-2'>
                  <Label>{t('receipt.form.importPrice', 'Giá nhập')}</Label>
                  <Input
                    type='number'
                    {...form.register(`details.${index}.importPrice`, { valueAsNumber: true })}
                  />
                  {rowErrors?.importPrice && (
                    <p className='text-[10px] text-red-500'>{rowErrors.importPrice.message}</p>
                  )}
                </div>

                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='mt-7 text-red-500 hover:bg-red-50'
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      <div className='flex justify-end gap-3 border-t pt-4'>
        <Button type='button' variant='ghost' onClick={onSuccess}>
          Hủy
        </Button>
        <Button type='submit' disabled={mutation.isPending || !watchedSupplierId}>
          {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {t('receipt.form.btnCreate', 'Lưu bản nháp')}
        </Button>
      </div>
    </form>
  )
}
