'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, User, FileText, CreditCard, AlertCircle } from 'lucide-react'
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

import { orderService } from '@/services/order/order.api'
import type { Order, OrderCreateRequest, OrderUpdateRequest } from '@/services/order/order.type'
import { orderFormSchema, type OrderFormValues } from '../schema/order.schema'
import { BookSelector } from './BookSelector'

interface OrderFormProps {
  order?: Order
  mode: 'create' | 'edit'
  onSuccess: () => void
}

export function OrderForm({ order, mode, onSuccess }: OrderFormProps) {
  const { t } = useTranslation('order')
  const queryClient = useQueryClient()

  const defaultItems =
    mode === 'edit' && order
      ? order.details.map((d) => ({ bookId: d.bookId, quantity: d.quantity }))
      : []

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: order?.customerName || '',
      customerPhone: order?.customerPhone || '',
      customerEmail: order?.customerEmail || '',
      shippingAddress: order?.shippingAddress || '',
      paymentMethod: order?.paymentMethod || 'COD',
      note: order?.note || '',
      items: defaultItems
    }
  })

  const mutation = useMutation({
    mutationFn: (values: OrderFormValues) => {
      if (mode === 'create') {
        return orderService.create(values as OrderCreateRequest)
      } else {
        return orderService.update(order!.id, values as OrderUpdateRequest)
      }
    },
    onSuccess: () => {
      toast.success(t(`message.success.${mode}`))
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      onSuccess()
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || t(`message.error.${mode}`))
    }
  })

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className='space-y-6'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* ================= CỘT TRÁI (CHIẾM 2/3): GIỎ HÀNG & GHI CHÚ ================= */}
        <div className='col-span-2 space-y-6'>
          {/* Card: Chọn Sản Phẩm */}
          <div className='bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden'>
            <div className='px-5 py-4 border-b bg-muted/30 font-semibold text-base flex items-center gap-2'>
              <FileText className='w-4 h-4 text-primary' /> {t('fields.items')} *
            </div>
            <div className='p-5'>
              {/* 👉 ĐÃ THÊM: Cảnh báo và khóa Component khi ở chế độ Edit */}
              {mode === 'edit' && (
                <div className='mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md flex items-start gap-2 text-sm'>
                  <AlertCircle className='w-4 h-4 mt-0.5 shrink-0' />
                  <p>
                    Hệ thống chỉ cho phép cập nhật thông tin giao hàng và ghi chú. Không thể thay
                    đổi sản phẩm hoặc số lượng đối với đơn hàng đã được tạo.
                  </p>
                </div>
              )}

              <div
                className={mode === 'edit' ? 'pointer-events-none opacity-60 grayscale-[30%]' : ''}
              >
                <Controller
                  control={form.control}
                  name='items'
                  render={({ field }) => (
                    <BookSelector value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>

              {form.formState.errors.items && (
                <p className='text-sm text-destructive mt-2'>
                  {form.formState.errors.items.message}
                </p>
              )}
            </div>
          </div>

          {/* Card: Ghi chú */}
          <div className='bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden'>
            <div className='px-5 py-4 border-b bg-muted/30 font-semibold text-base'>
              {t('fields.note')}
            </div>
            <div className='p-5'>
              <Textarea
                id='note'
                placeholder='Ghi chú thêm cho đơn hàng (không bắt buộc)...'
                className='min-h-[100px]'
                {...form.register('note')}
              />
            </div>
          </div>
        </div>

        {/* ================= CỘT PHẢI (CHIẾM 1/3): KHÁCH HÀNG & THANH TOÁN ================= */}
        <div className='space-y-6'>
          {/* Card: Thông tin khách hàng */}
          <div className='bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden'>
            <div className='px-5 py-4 border-b bg-muted/30 font-semibold text-base flex items-center gap-2'>
              <User className='w-4 h-4 text-primary' /> Thông tin giao hàng
            </div>
            <div className='p-5 space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='customerName'>{t('fields.customerName')} *</Label>
                <Input
                  id='customerName'
                  placeholder='Nguyễn Văn A'
                  {...form.register('customerName')}
                />
                {form.formState.errors.customerName && (
                  <p className='text-sm text-destructive'>
                    {form.formState.errors.customerName.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='customerPhone'>{t('fields.customerPhone')} *</Label>
                <Input
                  id='customerPhone'
                  placeholder='0987654321'
                  {...form.register('customerPhone')}
                />
                {form.formState.errors.customerPhone && (
                  <p className='text-sm text-destructive'>
                    {form.formState.errors.customerPhone.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='customerEmail'>{t('fields.customerEmail')} *</Label>
                <Input
                  id='customerEmail'
                  type='email'
                  placeholder='email@example.com'
                  disabled={mode === 'edit'}
                  {...form.register('customerEmail')}
                />
                {form.formState.errors.customerEmail && (
                  <p className='text-sm text-destructive'>
                    {form.formState.errors.customerEmail.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='shippingAddress'>{t('fields.shippingAddress')} *</Label>
                <Textarea
                  id='shippingAddress'
                  placeholder='Số nhà, Tên đường, Phường/Xã...'
                  {...form.register('shippingAddress')}
                />
                {form.formState.errors.shippingAddress && (
                  <p className='text-sm text-destructive'>
                    {form.formState.errors.shippingAddress.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Card: Thanh toán */}
          <div className='bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden'>
            <div className='px-5 py-4 border-b bg-muted/30 font-semibold text-base flex items-center gap-2'>
              <CreditCard className='w-4 h-4 text-primary' /> Hình thức thanh toán
            </div>
            <div className='p-5 space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='paymentMethod'>{t('fields.paymentMethod')} *</Label>
                <Controller
                  control={form.control}
                  name='paymentMethod'
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={mode === 'edit'}
                    >
                      <SelectTrigger id='paymentMethod'>
                        <SelectValue placeholder='Chọn phương thức...' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='COD'>Thanh toán khi nhận hàng (COD)</SelectItem>
                        <SelectItem value='BANKING'>Chuyển khoản ngân hàng</SelectItem>
                        <SelectItem value='VNPAY'>Ví VNPay</SelectItem>
                        <SelectItem value='MOMO'>Ví Momo</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.paymentMethod && (
                  <p className='text-sm text-destructive'>
                    {form.formState.errors.paymentMethod.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className='flex justify-end gap-3 pt-6'>
        <Button type='button' variant='outline' onClick={onSuccess}>
          {t('actions.cancel')}
        </Button>
        <Button type='submit' disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {mode === 'create' ? t('actions.create') : t('actions.save')}
        </Button>
      </div>
    </form>
  )
}
