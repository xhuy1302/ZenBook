'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useQuery } from '@tanstack/react-query'
import { orderService } from '@/services/order/order.api'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import type { OrderDetail } from '@/services/order/order.type'
import {
  MapPin,
  CreditCard,
  X,
  Store,
  ShoppingBag,
  Receipt,
  Box,
  Truck,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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

  // Format tiền tệ chuẩn VN
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  // Cấu hình Header Banner dựa vào status
  const getBannerConfig = (status?: string) => {
    switch (status) {
      case 'PENDING':
      case 'CONFIRMED':
      case 'PACKING':
        return { bg: 'bg-amber-500', icon: <Box className='w-8 h-8 text-white/90' /> }
      case 'SHIPPING':
        return { bg: 'bg-sky-500', icon: <Truck className='w-8 h-8 text-white/90' /> }
      case 'COMPLETED':
        return { bg: 'bg-brand-green', icon: <CheckCircle2 className='w-8 h-8 text-white/90' /> }
      case 'CANCELLED':
        return { bg: 'bg-rose-500', icon: <XCircle className='w-8 h-8 text-white/90' /> }
      case 'RETURNED':
        return { bg: 'bg-slate-500', icon: <RotateCcw className='w-8 h-8 text-white/90' /> }
      default:
        return { bg: 'bg-slate-500', icon: <Clock className='w-8 h-8 text-white/90' /> }
    }
  }

  const sortedHistories = order?.histories
    ? [...order.histories].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : []

  const bannerConfig = getBannerConfig(order?.status)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='!w-[95vw] lg:!w-[800px] !max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-[#f5f5f5] border-0 shadow-2xl'>
        {/* HEADER */}
        <DialogHeader className='px-6 py-4   border-b shadow-sm z-10 shrink-0 flex flex-row items-center justify-between space-y-0'>
          <DialogTitle className='text-lg font-bold tracking-tight text-slate-800 flex items-center gap-2'>
            Chi tiết đơn hàng
          </DialogTitle>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors shrink-0'
            onClick={() => onOpenChange(false)}
          >
            <X className='h-4 w-4' />
          </Button>
        </DialogHeader>

        {isLoading ? (
          <div className='flex-1 flex flex-col items-center justify-center gap-3'>
            <div className='w-8 h-8 border-4 border-brand-green/30 border-t-brand-green rounded-full animate-spin'></div>
            <p className='text-slate-500 font-medium text-sm'>Đang tải thông tin...</p>
          </div>
        ) : order ? (
          <div className='flex-1 overflow-y-auto pb-8'>
            <div className='flex flex-col'>
              {/* 1. KHỐI BANNER TRẠNG THÁI (Shopee Style) */}
              <div className='  shadow-sm'>
                <div className='flex items-center justify-between p-4 border-b border-slate-100 text-[13px]'>
                  <span className='text-slate-500 font-medium'>
                    Mã đơn hàng: <span className='text-slate-800 font-mono'>{order.orderCode}</span>
                  </span>
                  <span className={`uppercase font-black tracking-wide text-brand-green`}>
                    {t(`status.${order.status}`)}
                  </span>
                </div>
                <div className={`${bannerConfig.bg} px-6 py-8 flex items-center justify-between`}>
                  <div className='text-white'>
                    <h2 className='text-2xl font-black uppercase tracking-wide'>
                      {t(`status.${order.status}`)}
                    </h2>
                    <p className='text-[13px] opacity-90 mt-1.5 font-medium'>
                      {order.status === 'COMPLETED'
                        ? 'Đơn hàng đã được giao thành công.'
                        : 'Đơn hàng của bạn đang được hệ thống xử lý.'}
                    </p>
                  </div>
                  {bannerConfig.icon}
                </div>
              </div>

              {/* 2. ĐỊA CHỈ NHẬN HÀNG */}
              <div className='  mt-3 p-5 shadow-sm'>
                <div className='flex items-center gap-2 mb-3'>
                  <MapPin className='w-5 h-5 text-rose-500' />
                  <h3 className='text-[14px] font-bold text-slate-800 uppercase tracking-wide'>
                    Địa Chỉ Nhận Hàng
                  </h3>
                </div>
                <div className='pl-7 text-[13px] text-slate-600 flex flex-col gap-1.5'>
                  <p className='font-black text-slate-900 text-[14px]'>{order.customerName}</p>
                  <p className='font-medium'>{order.customerPhone}</p>
                  <p className='leading-relaxed'>{order.shippingAddress}</p>
                </div>
              </div>

              {/* 3. LỊCH SỬ GIAO HÀNG (TIMELINE DỌC) */}
              <div className='  mt-3 p-5 shadow-sm'>
                <div className='flex items-center gap-2 mb-4'>
                  <Truck className='w-5 h-5 text-sky-500' />
                  <h3 className='text-[14px] font-bold text-slate-800 uppercase tracking-wide'>
                    Lịch sử trạng thái
                  </h3>
                </div>
                <div className='pl-7'>
                  <div className='relative border-l-2 border-slate-100 ml-2 space-y-6 pb-2'>
                    {sortedHistories.map((h, i) => {
                      const isLatest = i === 0
                      return (
                        <div key={i} className='relative pl-6'>
                          <div
                            className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full ${isLatest ? 'bg-brand-green ring-4 ring-brand-green/20' : 'bg-slate-300'}`}
                          />
                          <p
                            className={`text-[13px] font-bold uppercase tracking-wide ${isLatest ? 'text-brand-green' : 'text-slate-600'}`}
                          >
                            {t(`status.${h.toStatus}` as never)}
                          </p>
                          <p className='text-[11px] text-slate-400 mt-1 font-medium'>
                            {format(new Date(h.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            {/* Hiển thị người thao tác cho Admin dễ nhìn */}
                            <span className='ml-2 font-normal italic opacity-70'>
                              ({h.actionBy})
                            </span>
                          </p>
                          {h.note && (
                            <p className='text-[12.5px] text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100'>
                              {h.note}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* 4. DANH SÁCH SẢN PHẨM */}
              <div className='  mt-3 shadow-sm'>
                <div className='px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2'>
                  <Store className='w-4 h-4 text-brand-green' />
                  <span className='font-bold text-[13px] text-slate-800 uppercase tracking-wide'>
                    ZenBook Official
                  </span>
                  <span className='bg-brand-green text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold tracking-wider'>
                    MALL
                  </span>
                </div>

                <div className='flex flex-col divide-y divide-slate-100 px-5'>
                  {order.details?.map((item: OrderDetail) => (
                    <div key={item.id} className='py-4 flex gap-4'>
                      <div className='w-20 h-20 border border-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1 bg-slate-50'>
                        {item.bookImage ? (
                          <img
                            src={item.bookImage}
                            alt={item.bookTitle}
                            className='w-full h-full object-contain mix-blend-multiply'
                          />
                        ) : (
                          <ShoppingBag className='w-6 h-6 text-slate-300' />
                        )}
                      </div>
                      <div className='flex-1 flex flex-col justify-center min-w-0'>
                        <p className='text-[14px] font-bold text-slate-800 line-clamp-2 leading-snug'>
                          {item.bookTitle}
                        </p>
                        <p className='text-[12px] font-medium text-slate-500 mt-1'>
                          Mã SP: {item.bookId}
                        </p>
                        <div className='flex items-center gap-2 mt-2'>
                          <span className='text-[11px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md'>
                            x{item.quantity}
                          </span>
                        </div>
                      </div>
                      <div className='text-right flex flex-col justify-center shrink-0'>
                        <span className='text-[13px] font-bold text-slate-500 line-through mb-1 hidden'>
                          {/* Nếu có giá gốc thì bỏ hidden đi */}
                        </span>
                        <span className='text-[14px] font-black text-brand-green'>
                          {formatCurrency(item.priceAtPurchase || 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. GHI CHÚ CHUNG ĐƠN HÀNG */}
              {order.note && (
                <div className='bg-amber-50 mt-3 p-4 shadow-sm border-t border-amber-100'>
                  <p className='text-[13px] font-semibold text-amber-800 mb-1'>
                    Ghi chú của khách hàng:
                  </p>
                  <p className='text-[13px] text-amber-900/80 italic'>"{order.note}"</p>
                </div>
              )}

              {/* 6. CHI TIẾT THANH TOÁN */}
              <div className='  mt-3 p-5 shadow-sm'>
                <div className='flex flex-col gap-3 text-[13px]'>
                  <div className='flex justify-between items-center text-slate-500 font-medium'>
                    <span>Tổng tiền hàng</span>
                    <span className='text-slate-800 font-bold'>
                      {formatCurrency(order.totalItemsPrice || 0)}
                    </span>
                  </div>
                  <div className='flex justify-between items-center text-slate-500 font-medium'>
                    <span>Phí vận chuyển</span>
                    <span className='text-slate-800 font-bold'>
                      {formatCurrency(order.shippingFee || 0)}
                    </span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className='flex justify-between items-center text-slate-500 font-medium'>
                      <span>Giảm giá</span>
                      <span className='text-brand-green font-bold'>
                        -{formatCurrency(order.discountAmount)}
                      </span>
                    </div>
                  )}

                  <div className='my-2 border-t border-dashed border-slate-200' />

                  <div className='flex justify-between items-center'>
                    <span className='text-slate-800 font-black uppercase tracking-wide'>
                      Thành tiền
                    </span>
                    <span className='text-2xl font-black text-brand-green'>
                      {formatCurrency(order.finalTotal || 0)}
                    </span>
                  </div>
                </div>

                <div className='bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100 mt-5'>
                  <div className='flex items-center gap-2'>
                    <CreditCard className='w-5 h-5 text-slate-400' />
                    <span className='text-[13px] font-medium text-slate-600'>
                      Phương thức thanh toán
                    </span>
                  </div>
                  <span className='text-[13px] font-black uppercase tracking-wider text-slate-800'>
                    {order.paymentMethod}
                  </span>
                </div>
                <div className='flex items-center justify-between px-2 mt-3'>
                  <div className='flex items-center gap-2'>
                    <Receipt className='w-4 h-4 text-slate-400' />
                    <span className='text-[12px] font-medium text-slate-500'>
                      Trạng thái thanh toán
                    </span>
                  </div>
                  <span
                    className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                  >
                    {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
