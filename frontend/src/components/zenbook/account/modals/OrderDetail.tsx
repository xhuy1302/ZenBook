'use client'

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
// 👉 Import thêm useQueryClient
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  Store,
  MapPin,
  Receipt,
  FileText,
  Clock,
  CheckCircle2,
  Truck,
  Box,
  XCircle,
  RotateCcw,
  Star,
  RefreshCcw,
  MessageSquarePlus,
  ImageIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { orderService } from '@/services/order/order.api'
import type { OrderDetail } from '@/services/order/order.type'
import { ReviewFormModal } from '@/components/zenbook/review/ReviewFormModal'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function formatDate(dateStr: string) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'
  return (
    <div className='flex gap-0.5'>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${cls} ${
            i < Math.floor(rating)
              ? 'text-amber-400 fill-amber-400'
              : 'text-slate-200 fill-slate-200'
          }`}
        />
      ))}
    </div>
  )
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation('account')

  // 👉 Khởi tạo queryClient
  const queryClient = useQueryClient()

  const [reviewTarget, setReviewTarget] = useState<{
    productId: string
    orderDetailId: string
    book: { id: string; title: string; image?: string }
  } | null>(null)

  const {
    data: order,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: () => orderService.getById(id!),
    enabled: !!id
  })

  const getBannerConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'CONFIRMED':
      case 'PACKING':
        return { bg: 'bg-amber-500', icon: <Box className='w-9 h-9 text-white/90' /> }
      case 'SHIPPING':
        return { bg: 'bg-sky-500', icon: <Truck className='w-9 h-9 text-white/90' /> }
      case 'COMPLETED':
        return { bg: 'bg-brand-green', icon: <CheckCircle2 className='w-9 h-9 text-white/90' /> }
      case 'CANCELLED':
        return { bg: 'bg-rose-500', icon: <XCircle className='w-9 h-9 text-white/90' /> }
      case 'RETURNED':
        return { bg: 'bg-slate-500', icon: <RotateCcw className='w-9 h-9 text-white/90' /> }
      default:
        return { bg: 'bg-slate-500', icon: <Clock className='w-9 h-9 text-white/90' /> }
    }
  }

  // 👉 Hàm gọi lại khi đánh giá thành công
  const handleReviewSuccess = () => {
    setReviewTarget(null) // Đóng modal
    // Báo cho React Query xóa cache cũ đi và gọi lại API getById ngầm bên dưới
    queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
  }

  if (isLoading) {
    return (
      <div className='flex flex-col gap-4 max-w-4xl mx-auto w-full animate-pulse'>
        <Skeleton className='h-24 w-full rounded-2xl' />
        <Skeleton className='h-32 w-full rounded-2xl' />
        <Skeleton className='h-64 w-full rounded-2xl' />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl shadow-sm'>
        <FileText className='w-16 h-16 text-slate-300 mb-4' />
        <p className='text-slate-600 font-medium'>Không tìm thấy đơn hàng</p>
        <Button variant='outline' asChild className='mt-4 rounded-xl'>
          <Link to='/customer/orders'>Quay lại danh sách</Link>
        </Button>
      </div>
    )
  }

  const bannerConfig = getBannerConfig(order.status)
  const sortedHistories = order.histories
    ? [...order.histories].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )
    : []

  return (
    <div className='min-h-screen pb-10'>
      <div className='max-w-4xl mx-auto flex flex-col gap-4 pt-2 px-4 sm:px-0'>
        {/* ... (Phần Header, Banner, Địa chỉ, Timeline giữ nguyên) ... */}

        {/* HEADER & BANNER */}
        <div className='bg-white shadow-sm border border-slate-100 rounded-2xl overflow-hidden'>
          <div className='flex items-center justify-between p-4 border-b border-slate-100'>
            <Link
              to='/customer/orders'
              className='flex items-center text-slate-500 hover:text-brand-green transition-colors text-[13px] font-bold'
            >
              <ChevronLeft className='w-4 h-4 mr-1' /> QUAY LẠI
            </Link>
            <div className='text-[13px] flex items-center gap-2'>
              <span className='text-slate-500 font-medium'>
                Mã đơn: <span className='text-slate-800 font-mono'>{order.orderCode}</span>
              </span>
              <span className='text-slate-300'>|</span>
              <span className='uppercase font-black text-brand-green'>
                {t(`orders.status.${order.status.toLowerCase()}` as never)}
              </span>
            </div>
          </div>
          <div className={`${bannerConfig.bg} px-7 py-8 flex items-center justify-between`}>
            <div className='text-white'>
              <h2 className='text-2xl font-black uppercase tracking-wide'>
                {t(`orders.status.${order.status.toLowerCase()}` as never)}
              </h2>
              <p className='text-sm opacity-90 mt-1.5 font-medium'>
                {order.status === 'COMPLETED'
                  ? 'Cảm ơn bạn đã mua sắm tại ZenBook!'
                  : 'Đơn hàng của bạn đang được xử lý.'}
              </p>
            </div>
            {bannerConfig.icon}
          </div>
        </div>

        {/* ĐỊA CHỈ NHẬN HÀNG */}
        <div className='bg-white p-6 shadow-sm border border-slate-100 rounded-2xl'>
          <div className='flex items-center gap-2 mb-4'>
            <MapPin className='w-5 h-5 text-rose-500' />
            <h3 className='text-[15px] font-bold text-slate-800 uppercase tracking-wide'>
              Địa Chỉ Nhận Hàng
            </h3>
          </div>
          <div className='pl-7 text-[13px] text-slate-600 flex flex-col gap-1.5'>
            <p className='font-black text-slate-900 text-[14px]'>{order.customerName}</p>
            <p className='font-medium'>{order.customerPhone}</p>
            <p className='leading-relaxed'>{order.shippingAddress}</p>
          </div>
        </div>

        {/* LỊCH SỬ GIAO HÀNG */}
        <div className='bg-white p-6 shadow-sm border border-slate-100 rounded-2xl'>
          <div className='flex items-center gap-2 mb-4'>
            <Truck className='w-5 h-5 text-sky-500' />
            <h3 className='text-[15px] font-bold text-slate-800 uppercase tracking-wide'>
              Thông Tin Vận Chuyển
            </h3>
          </div>
          <div className='pl-7'>
            <div className='relative border-l-2 border-slate-100 ml-2 space-y-6 pb-2'>
              {sortedHistories.map((h, i) => {
                const isLatest = i === 0
                const statusKey = (h.toStatus || 'pending').toLowerCase()
                return (
                  <div key={i} className='relative pl-6'>
                    <div
                      className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full ${isLatest ? 'bg-brand-green ring-4 ring-brand-green/20' : 'bg-slate-300'}`}
                    />
                    <p
                      className={`text-[13px] font-bold uppercase tracking-wide ${isLatest ? 'text-brand-green' : 'text-slate-600'}`}
                    >
                      {t(`orders.status.${statusKey}` as never)}
                    </p>
                    <p className='text-[11px] text-slate-400 mt-1 font-medium'>
                      {formatDate(h.createdAt)}
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
        <div className='bg-white shadow-sm border border-slate-100 rounded-2xl overflow-hidden'>
          <div className='px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2'>
            <Store className='w-4 h-4 text-brand-green' />
            <span className='font-bold text-[13px] text-slate-800 uppercase tracking-wide'>
              ZenBook Official
            </span>
            <span className='bg-brand-green text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold tracking-wider'>
              MALL
            </span>
          </div>

          <div className='flex flex-col divide-y divide-slate-100'>
            {/* 👉 Fix TypeScript: Khai báo rõ item: any hoặc OrderDetail nếu bạn đã có thuộc tính bookSlug */}
            {order.details?.map((item: any, index: number) => {
              // 👉 SỬA LỖI 1: Ưu tiên dùng slug, nếu không có mới dùng ID
              const productUrl = `/products/${item.bookSlug || item.bookId}`

              return (
                <div key={item.id || index} className='p-5 flex flex-col gap-3 group'>
                  <div className='flex gap-4'>
                    <Link
                      to={productUrl}
                      className='w-20 h-20 border border-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1 bg-slate-50 transition-transform group-hover:scale-105'
                    >
                      {item.bookImage ? (
                        <img
                          src={item.bookImage}
                          alt={item.bookTitle}
                          className='w-full h-full object-contain mix-blend-multiply'
                        />
                      ) : (
                        <ImageIcon className='w-6 h-6 text-slate-300' />
                      )}
                    </Link>

                    <div className='flex-1 flex flex-col justify-center min-w-0'>
                      <Link
                        to={productUrl}
                        className='text-[14px] font-bold text-slate-800 line-clamp-2 hover:text-brand-green transition-colors leading-snug'
                      >
                        {item.bookTitle}
                      </Link>
                      <div className='flex items-center gap-2 mt-2'>
                        <span className='text-[11px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md'>
                          x{item.quantity}
                        </span>
                        <span className='text-[13px] font-bold text-slate-500'>
                          {formatCurrency(item.priceAtPurchase)}
                        </span>
                      </div>
                    </div>

                    <div className='text-right flex flex-col justify-center shrink-0'>
                      <span className='text-[15px] font-black text-brand-green'>
                        {formatCurrency(item.subTotal)}
                      </span>
                    </div>
                  </div>

                  {order.status === 'COMPLETED' && (
                    <div className='flex items-center justify-between mt-2 pt-4 border-t border-slate-50'>
                      <div>
                        {item.isReviewed ? (
                          <div className='flex flex-col gap-1'>
                            <span className='text-[11.5px] font-bold text-slate-400 flex items-center gap-1'>
                              <CheckCircle2 className='w-3.5 h-3.5 text-emerald-500' /> Bạn đã đánh
                              giá
                            </span>
                            {/* Nếu backend có trả về số sao đã đánh giá thì map vào đây, tạm thời để 5 */}
                            <StarRow rating={5} size='sm' />
                          </div>
                        ) : (
                          <span className='text-[11.5px] text-slate-400 italic'>
                            Hãy chia sẻ trải nghiệm của bạn
                          </span>
                        )}
                      </div>

                      <div className='flex items-center gap-2'>
                        <Button
                          variant='outline'
                          className='h-9 rounded-xl font-bold text-[12px] border-brand-green/30 text-brand-green hover:bg-brand-green/10 transition-colors'
                          asChild
                        >
                          <Link to={productUrl}>
                            <RefreshCcw className='w-3.5 h-3.5 mr-1.5' strokeWidth={2.5} /> Mua Lại
                          </Link>
                        </Button>

                        {!item.isReviewed && (
                          <Button
                            className='bg-brand-green hover:bg-brand-green-dark text-white h-9 px-5 text-[12px] rounded-xl shadow-md shadow-brand-green/20 font-bold transition-transform active:scale-95'
                            onClick={() =>
                              setReviewTarget({
                                productId: item.bookId,
                                orderDetailId: item.id,
                                book: {
                                  id: item.bookId,
                                  title: item.bookTitle,
                                  image: item.bookImage
                                }
                              })
                            }
                          >
                            <MessageSquarePlus className='w-3.5 h-3.5 mr-1.5' /> Đánh Giá
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* CHI TIẾT THANH TOÁN */}
        <div className='bg-white shadow-sm border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-end p-6'>
          <div className='w-full md:w-96 flex flex-col gap-3 text-[13px]'>
            <div className='flex justify-between items-center text-slate-500 font-medium'>
              <span>Tổng tiền hàng</span>
              <span className='text-slate-800 font-bold'>
                {formatCurrency(order.totalItemsPrice)}
              </span>
            </div>
            <div className='flex justify-between items-center text-slate-500 font-medium'>
              <span>Phí vận chuyển</span>
              <span className='text-slate-800 font-bold'>{formatCurrency(order.shippingFee)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className='flex justify-between items-center text-slate-500 font-medium'>
                <span>Giảm giá</span>
                <span className='text-brand-green font-bold'>
                  -{formatCurrency(order.discountAmount)}
                </span>
              </div>
            )}
            <Separator className='my-2 bg-slate-100' />
            <div className='flex justify-between items-center'>
              <span className='text-slate-800 font-black uppercase tracking-wide'>Thành tiền</span>
              <span className='text-2xl font-black text-brand-green'>
                {formatCurrency(order.finalTotal)}
              </span>
            </div>
            <div className='flex justify-between items-center text-slate-500 border-t border-dashed border-slate-200 pt-3 mt-2'>
              <span className='flex items-center gap-2 font-medium'>
                <Receipt className='w-4 h-4 text-slate-400' /> Phương thức thanh toán
              </span>
              <span className='text-slate-800 font-black uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md'>
                {order.paymentMethod}
              </span>
            </div>
          </div>
        </div>

        {/* 6. MODAL ĐÁNH GIÁ */}
        {reviewTarget && (
          <ReviewFormModal
            open={!!reviewTarget}
            onClose={() => setReviewTarget(null)}
            // 👉 Truyền prop onSuccess để báo cho OrderDetail biết
            onSuccess={handleReviewSuccess}
            productId={reviewTarget.productId}
            orderDetailId={reviewTarget.orderDetailId}
            orderId={order.id}
            book={reviewTarget.book}
          />
        )}
      </div>
    </div>
  )
}
