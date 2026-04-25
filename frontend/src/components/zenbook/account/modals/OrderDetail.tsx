import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  RefreshCcw,
  Box,
  RotateCcw,
  Image as ImageIcon,
  Receipt,
  MapPin,
  ShieldCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { orderService } from '@/services/order/order.api'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
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

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation('account')

  const {
    data: order,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: () => orderService.getById(id!),
    enabled: !!id
  })

  const getStatusConfig = (status: string) => {
    const statusKey = (status || '').toLowerCase()
    switch (status) {
      case 'PENDING':
        return {
          label: t(`orders.status.${statusKey}`),
          progress: 15,
          icon: <Clock className='w-3.5 h-3.5' />,
          color: 'text-amber-600 bg-amber-50 border-amber-200'
        }
      case 'CONFIRMED':
        return {
          label: t(`orders.status.${statusKey}`),
          progress: 30,
          icon: <CheckCircle className='w-3.5 h-3.5' />,
          color: 'text-blue-600 bg-blue-50 border-blue-200'
        }
      case 'PACKING':
        return {
          label: t(`orders.status.${statusKey}`),
          progress: 50,
          icon: <Box className='w-3.5 h-3.5' />,
          color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
        }
      case 'SHIPPING':
        return {
          label: t(`orders.status.${statusKey}`),
          progress: 75,
          icon: <Truck className='w-3.5 h-3.5' />,
          color: 'text-sky-600 bg-sky-50 border-sky-200'
        }
      case 'COMPLETED':
        return {
          label: t(`orders.status.${statusKey}`),
          progress: 100,
          icon: <CheckCircle className='w-3.5 h-3.5' />,
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
        }
      case 'CANCELLED':
        return {
          label: t(`orders.status.${statusKey}`),
          progress: 100,
          icon: <XCircle className='w-3.5 h-3.5' />,
          color: 'text-rose-600 bg-rose-50 border-rose-200'
        }
      case 'RETURNED':
        return {
          label: t(`orders.status.${statusKey}`),
          progress: 100,
          icon: <RotateCcw className='w-3.5 h-3.5' />,
          color: 'text-slate-600 bg-slate-100 border-slate-300'
        }
      default:
        return {
          label: status,
          progress: 0,
          icon: <Package className='w-3.5 h-3.5' />,
          color: 'text-slate-600 bg-slate-50 border-slate-200'
        }
    }
  }

  if (isLoading) {
    return (
      <div className='flex flex-col gap-4 max-w-4xl mx-auto w-full animate-pulse'>
        <Skeleton className='h-9 w-32 rounded-xl' />
        <Skeleton className='h-32 w-full rounded-2xl' />
        <Skeleton className='h-56 w-full rounded-2xl' />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in'>
        <XCircle className='w-10 h-10 text-rose-400 mb-3' />
        <p className='text-[13px] text-slate-700 font-bold'>{t('orders.detail.errorLoad')}</p>
        <Button variant='outline' asChild className='mt-4 rounded-xl h-9 text-[13px]'>
          <Link to='/customer/orders'>Quay lại danh sách</Link>
        </Button>
      </div>
    )
  }

  const statusConfig = getStatusConfig(order.status)
  const sortedHistories = order.histories
    ? [...order.histories].sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : []

  return (
    <div className='flex flex-col gap-4 max-w-4xl mx-auto animate-in slide-in-from-bottom-4 fade-in duration-500 pb-10'>
      <div className='flex items-center justify-between'>
        <Button
          variant='ghost'
          size='sm'
          asChild
          className='w-fit -ml-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors h-9 text-[13px]'
        >
          <Link to='/customer/orders'>
            <ArrowLeft className='w-4 h-4 mr-1.5' />
            {t('orders.detail.back')}
          </Link>
        </Button>
        <div className='text-[12.5px] text-slate-500 font-medium'>
          Mã đơn: <span className='font-mono font-bold text-slate-800'>{order.orderCode}</span>
        </div>
      </div>

      <div className='bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300'>
        <div className='flex flex-col md:flex-row justify-between gap-4'>
          <div className='flex flex-col items-start'>
            <div className='flex items-center gap-2.5 mb-2.5'>
              <div className='p-1.5 rounded-lg bg-slate-50 border border-slate-100'>
                <Receipt className='w-4 h-4 text-brand-green' />
              </div>
              <div>
                <h2 className='text-[14px] font-black text-slate-900 tracking-tight'>
                  Thông tin đơn hàng
                </h2>
                <p className='text-[12px] text-slate-500 font-medium mt-0.5'>
                  Đặt lúc: {formatDate(order.createdAt)}
                </p>
              </div>
            </div>

            <Badge
              variant='outline'
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] uppercase tracking-wider font-bold border ${statusConfig.color}`}
            >
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
          </div>

          <div className='md:text-right flex flex-col justify-end pt-3 md:pt-0 border-t md:border-0 border-slate-100'>
            <p className='text-[11px] text-slate-500 font-bold mb-0.5 uppercase tracking-wide'>
              {t('orders.detail.total')}
            </p>
            <p className='text-[20px] font-black text-brand-green tracking-tight'>
              {formatCurrency(order.finalTotal)}
            </p>
          </div>
        </div>

        <div className='mt-4 pt-4 border-t border-slate-50'>
          <Progress
            value={statusConfig.progress}
            className={`h-1.5 bg-slate-100 ${
              order.status === 'CANCELLED' || order.status === 'RETURNED'
                ? 'opacity-50 grayscale'
                : '[&>div]:bg-brand-green'
            }`}
          />
        </div>
      </div>

      <div className='bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300'>
        <div className='flex items-center gap-2 border-b border-slate-100 pb-3 mb-4'>
          <Clock className='w-4 h-4 text-brand-amber' />
          <h3 className='text-[13px] font-bold text-slate-800 uppercase tracking-wide'>
            {t('orders.detail.history')}
          </h3>
        </div>

        <div className='flex flex-col gap-3 relative before:absolute before:inset-0 before:ml-[9px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-slate-100'>
          {sortedHistories.map((h: any, index: number) => {
            const statusKey = (h.toStatus || 'unknown').toLowerCase()
            const isLatest = index === 0

            return (
              <div
                key={h.id || index}
                className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group'
              >
                <div
                  className={`flex items-center justify-center w-5 h-5 rounded-full border-[3px] border-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 transition-transform duration-300 group-hover:scale-110 ${
                    isLatest ? 'bg-brand-green ring-[3px] ring-brand-green/20' : 'bg-slate-300'
                  }`}
                ></div>

                <div
                  className={`w-[calc(100%-2rem)] md:w-[calc(50%-1.25rem)] p-3 rounded-xl border transition-colors duration-300 shadow-sm ${
                    isLatest
                      ? 'bg-brand-green/5 border-brand-green/20'
                      : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'
                  }`}
                >
                  <div className='flex flex-col gap-0.5'>
                    <p
                      className={`text-[13px] font-bold uppercase tracking-wide ${isLatest ? 'text-brand-green' : 'text-slate-700'}`}
                    >
                      {t(`orders.status.${statusKey}`)}
                    </p>
                    <p className='text-[11.5px] font-medium text-slate-500'>
                      {formatDate(h.createdAt)}
                    </p>
                    {h.note && (
                      <p className='text-[11.5px] mt-1.5 text-slate-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-100 font-medium'>
                        {h.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className='bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300'>
        <div className='px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2'>
          <Package className='w-4 h-4 text-blue-500' />
          <h3 className='font-bold text-[13px] text-slate-800 uppercase tracking-wide'>
            {t('orders.detail.products')}
          </h3>
          <span className='text-[11px] font-black text-white bg-slate-800 px-2 py-0.5 rounded-md ml-auto'>
            {order.details?.length || 0} SẢN PHẨM
          </span>
        </div>

        <div className='flex flex-col divide-y divide-slate-100'>
          {order.details?.map((item: any, index: number) => (
            <div
              key={item.id || index}
              className='p-4 flex flex-col sm:flex-row gap-4 bg-white hover:bg-slate-50/80 transition-colors group'
            >
              <div className='w-16 h-16 shrink-0 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden p-1 transition-transform duration-300 group-hover:scale-105'>
                {item.bookImage ? (
                  <img
                    src={item.bookImage}
                    alt={item.bookTitle}
                    loading='lazy'
                    decoding='async'
                    className='w-full h-full object-contain mix-blend-multiply'
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = '/placeholder.jpg'
                    }}
                  />
                ) : (
                  <ImageIcon className='w-5 h-5 text-slate-300' />
                )}
              </div>

              <div className='flex-1 flex flex-col justify-center min-w-0'>
                <p className='font-bold text-slate-800 line-clamp-2 text-[13px] leading-snug group-hover:text-brand-green transition-colors'>
                  {item.bookTitle}
                </p>
                <div className='flex items-center gap-2 mt-1.5'>
                  <span className='text-[11.5px] font-black text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md'>
                    x{item.quantity}
                  </span>
                  <span className='text-[12.5px] font-semibold text-slate-500'>
                    {formatCurrency(item.priceAtPurchase)}
                  </span>
                </div>

                {order.status === 'COMPLETED' && (
                  <Button
                    size='sm'
                    variant='outline'
                    className='mt-2 w-fit h-7 text-[11px] font-bold px-2 rounded-lg border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                  >
                    <Star className='w-3 h-3 mr-1 fill-amber-500' />
                    {t('orders.detail.evaluate')}
                  </Button>
                )}
              </div>

              <div className='sm:min-w-[100px] flex items-end sm:items-center justify-start sm:justify-end pt-2 sm:pt-0 mt-1 sm:mt-0'>
                <p className='font-black text-[14px] text-brand-green'>
                  {formatCurrency(item.subTotal)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='grid lg:grid-cols-2 gap-4'>
        <div className='bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col'>
          <div className='flex items-center gap-2 border-b border-slate-100 pb-3 mb-3'>
            <MapPin className='w-4 h-4 text-rose-500' />
            <h3 className='font-bold text-[13px] text-slate-800 uppercase tracking-wide'>
              Địa chỉ nhận hàng
            </h3>
          </div>
          <div className='flex flex-col gap-1.5 flex-1'>
            <p className='font-bold text-[13px] text-slate-900'>{order.customerName}</p>
            <p className='text-[12.5px] font-medium text-slate-600'>{order.customerPhone}</p>
            <p className='text-[12.5px] text-slate-500 leading-relaxed mt-0.5'>
              {order.shippingAddress}
            </p>
          </div>
        </div>

        <div className='bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col'>
          <div className='flex items-center gap-2 border-b border-slate-100 pb-3 mb-3'>
            <ShieldCheck className='w-4 h-4 text-emerald-500' />
            <h3 className='font-bold text-[13px] text-slate-800 uppercase tracking-wide'>
              {t('orders.detail.payment')}
            </h3>
          </div>

          <div className='flex flex-col gap-2.5 flex-1'>
            <div className='flex justify-between items-center text-[12.5px]'>
              <span className='text-slate-500 font-medium'>{t('orders.detail.subtotal')}</span>
              <span className='font-bold text-slate-700'>
                {formatCurrency(order.totalItemsPrice)}
              </span>
            </div>

            <div className='flex justify-between items-center text-[12.5px]'>
              <span className='text-slate-500 font-medium'>{t('orders.detail.shippingFee')}</span>
              <span className='font-bold text-slate-700'>{formatCurrency(order.shippingFee)}</span>
            </div>

            {order.discountAmount > 0 && (
              <div className='flex justify-between items-center text-[12.5px]'>
                <span className='text-slate-500 font-medium'>{t('orders.detail.discount')}</span>
                <span className='font-bold text-brand-green'>
                  -{formatCurrency(order.discountAmount)}
                </span>
              </div>
            )}

            <Separator className='my-1.5 bg-slate-100' />

            <div className='flex justify-between items-center'>
              <span className='font-bold text-[13px] text-slate-900 uppercase tracking-wide'>
                {t('orders.detail.finalTotal')}
              </span>
              <span className='font-black text-[18px] text-brand-green'>
                {formatCurrency(order.finalTotal)}
              </span>
            </div>
            <p className='text-right text-[11px] text-slate-400 italic mt-0.5'>
              (Vui lòng thanh toán số tiền này khi nhận hàng)
            </p>
          </div>
        </div>
      </div>

      <div className='flex flex-wrap items-center justify-end gap-3 pt-1'>
        {order.status === 'SHIPPING' && (
          <Button
            variant='outline'
            className='rounded-xl font-bold px-5 h-9 border-brand-green/30 text-brand-green hover:bg-brand-green/10 transition-all active:scale-95 text-[13px]'
          >
            <Truck className='w-4 h-4 mr-1.5' />
            {t('orders.detail.trackOrder')}
          </Button>
        )}

        {order.status === 'COMPLETED' && (
          <Button className='rounded-xl font-bold px-5 h-9 bg-brand-green hover:bg-brand-green-dark text-white shadow-md shadow-brand-green/20 transition-all active:scale-95 text-[13px]'>
            <RefreshCcw className='w-3.5 h-3.5 mr-1.5' strokeWidth={2.5} />
            {t('orders.detail.buyAgain')}
          </Button>
        )}
      </div>
    </div>
  )
}
