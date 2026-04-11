'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useQuery } from '@tanstack/react-query'
import { orderService } from '@/services/order/order.api'
import { OrderStatusBadge } from '../OrderStatusBadge'
import { PaymentStatusBadge } from '../PaymentStatusBadge'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import type { OrderDetail } from '@/services/order/order.type'
import { User, MapPin, FileText, CreditCard } from 'lucide-react'

interface OrderDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
}

export function OrderDetailDialog({ open, onOpenChange, orderId }: OrderDetailDialogProps) {
  const { t } = useTranslation('order')
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getById(orderId),
    enabled: open && !!orderId
  })

  const getStatusTranslation = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return t('status.PENDING')
      case 'CONFIRMED':
        return t('status.CONFIRMED')
      case 'PACKING':
        return t('status.PACKING')
      case 'SHIPPING':
        return t('status.SHIPPING')
      case 'COMPLETED':
        return t('status.COMPLETED')
      case 'CANCELLED':
        return t('status.CANCELLED')
      case 'RETURNED':
        return t('status.RETURNED')
      default:
        return status || ''
    }
  }

  // 👉 THÊM Ở ĐÂY: Thuật toán sắp xếp lịch sử từ MỚI NHẤT -> CŨ NHẤT
  const sortedHistories = order?.histories
    ? [...order.histories].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='!w-[95vw] lg:!w-[90vw] !max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden bg-background border-0 shadow-2xl'>
        {/* HEADER */}
        <DialogHeader className='px-6 py-4 pr-14 bg-background border-b shadow-sm z-10 shrink-0'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
            <DialogTitle className='text-2xl font-bold tracking-tight flex items-center gap-2'>
              {t('detail.title')} <span className='text-primary'>#{order?.orderCode}</span>
            </DialogTitle>

            {order && (
              <div className='flex items-center gap-5'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium text-muted-foreground'>Trạng thái ĐH:</span>
                  <OrderStatusBadge status={order?.status} />
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium text-muted-foreground'>Thanh toán:</span>
                  <PaymentStatusBadge status={order?.paymentStatus} />
                </div>
              </div>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className='flex-1 flex items-center justify-center'>{t('common.loading')}</div>
        ) : order ? (
          <div className='flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950/50 p-6'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {/* ===================== CỘT TRÁI ===================== */}
              <div className='lg:col-span-2 space-y-6'>
                {/* 1. DANH SÁCH SẢN PHẨM */}
                <div className='bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden'>
                  <div className='px-5 py-4 border-b bg-muted/30 font-semibold text-base flex items-center gap-2'>
                    <FileText className='w-4 h-4 text-primary' /> {t('detail.items')}
                  </div>
                  <div className='p-5 space-y-4'>
                    {order?.details?.map((item: OrderDetail) => (
                      <div key={item.id} className='flex justify-between items-center py-2 group'>
                        <div className='flex items-center gap-4'>
                          {item.bookImage ? (
                            <img
                              src={item.bookImage}
                              alt={item.bookTitle}
                              className='w-14 h-14 object-cover rounded-md border shadow-sm group-hover:scale-105 transition-transform'
                            />
                          ) : (
                            <div className='w-14 h-14 rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground'>
                              No img
                            </div>
                          )}
                          <div className='space-y-1'>
                            <p className='font-medium text-base line-clamp-1'>{item.bookTitle}</p>
                            <p className='text-sm text-muted-foreground'>
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(item.priceAtPurchase || 0)}{' '}
                              <span className='font-semibold text-foreground'>
                                x {item.quantity}
                              </span>
                            </p>
                          </div>
                        </div>
                        <p className='font-bold text-base'>
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(item.subTotal || 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. GHI CHÚ */}
                {order?.note && (
                  <div className='bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900 shadow-sm p-5'>
                    <h4 className='font-semibold mb-2 text-amber-800 dark:text-amber-500 flex items-center gap-2'>
                      {t('fields.note')}
                    </h4>
                    <p className='text-sm text-amber-900/80 dark:text-amber-200/80 leading-relaxed italic'>
                      "{order?.note}"
                    </p>
                  </div>
                )}

                {/* 3. TỔNG KẾT TIỀN */}
                <div className='bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden'>
                  <div className='px-5 py-4 border-b bg-muted/30 font-semibold text-base flex items-center gap-2'>
                    <CreditCard className='w-4 h-4 text-primary' /> Thanh toán
                  </div>
                  <div className='p-5 space-y-3'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>{t('detail.totalItems')}:</span>
                      <span className='font-medium'>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(order?.totalItemsPrice || 0)}
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>{t('detail.shippingFee')}:</span>
                      <span className='font-medium'>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(order?.shippingFee || 0)}
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>{t('detail.discount')}:</span>
                      <span className='font-medium text-emerald-600'>
                        -{' '}
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(order?.discountAmount || 0)}
                      </span>
                    </div>
                    <div className='pt-3 mt-3 border-t flex justify-between items-center'>
                      <span className='font-bold text-lg'>{t('detail.finalTotal')}:</span>
                      <span className='text-2xl font-black text-primary'>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(order?.finalTotal || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===================== CỘT PHẢI ===================== */}
              <div className='space-y-6'>
                {/* 4. KHÁCH HÀNG */}
                <div className='bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden'>
                  <div className='px-5 py-4 border-b bg-muted/30 font-semibold text-base flex items-center gap-2'>
                    <User className='w-4 h-4 text-primary' /> Khách hàng
                  </div>
                  <div className='p-5 space-y-5'>
                    <div className='space-y-2'>
                      <p className='text-sm text-muted-foreground'>{t('fields.customerName')}</p>
                      <p className='font-medium'>{order?.customerName}</p>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-sm text-muted-foreground'>Thông tin liên lạc</p>
                      <p className='font-medium text-sm'>{order?.customerPhone}</p>
                      <p className='font-medium text-sm'>{order?.customerEmail}</p>
                    </div>

                    <div className='pt-4 border-t space-y-2'>
                      <p className='text-sm text-muted-foreground flex items-center gap-1'>
                        <MapPin className='w-3 h-3' /> {t('fields.shippingAddress')}
                      </p>
                      <p className='font-medium text-sm leading-relaxed'>
                        {order?.shippingAddress}
                      </p>
                    </div>

                    <div className='pt-4 border-t space-y-2'>
                      <p className='text-sm text-muted-foreground flex items-center gap-1'>
                        <CreditCard className='w-3 h-3' /> {t('fields.paymentMethod')}
                      </p>
                      <p className='font-medium text-sm uppercase'>{order?.paymentMethod}</p>
                    </div>
                  </div>
                </div>

                {/* 5. LỊCH SỬ */}
                <div className='bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden'>
                  <div className='px-5 py-4 border-b bg-muted/30 font-semibold text-base'>
                    {t('detail.history')}
                  </div>
                  <div className='p-5 space-y-5'>
                    {/* 👉 ĐÃ SỬA: Map qua biến sortedHistories thay vì order?.histories */}
                    {sortedHistories.length > 0 ? (
                      sortedHistories.map((h, index) => (
                        <div key={h.id} className='relative pl-6'>
                          {index !== sortedHistories.length - 1 && (
                            <div className='absolute left-[9px] top-5 bottom-[-20px] w-px bg-border'></div>
                          )}
                          <div className='absolute w-[10px] h-[10px] bg-primary rounded-full left-1 top-1.5 ring-4 ring-background'></div>

                          <div className='space-y-1.5'>
                            <div className='flex items-center gap-2 flex-wrap'>
                              {h.toStatus && <OrderStatusBadge status={h.toStatus} />}
                              {h.fromStatus && (
                                <span className='text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full'>
                                  ← {getStatusTranslation(h.fromStatus)}
                                </span>
                              )}
                            </div>
                            <p className='text-xs text-muted-foreground'>
                              {format(new Date(h.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })} •{' '}
                              <span className='font-medium text-foreground'>{h.actionBy}</span> (
                              {h.role})
                            </p>
                            {h.note && (
                              <div className='mt-2 text-sm bg-muted/50 p-2 rounded-md border border-border/50 italic text-muted-foreground'>
                                "{h.note}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className='text-muted-foreground text-sm text-center py-4'>
                        Chưa có lịch sử cập nhật.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
