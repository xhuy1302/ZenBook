'use client'

import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useCart } from '@/context/CartContext'
import { OrderStatus } from '@/defines/order.enum'

import {
  Search,
  Package,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShoppingBag,
  Star,
  RefreshCcw,
  Store,
  ShieldCheck,
  MessageSquarePlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { orderService } from '@/services/order/order.api'

// CÁC MODAL XỬ LÝ
import { ReviewFormModal } from '@/components/zenbook/review/ReviewFormModal'
import { CancelOrderModal } from '@/components/zenbook/account/order/CancelOrderModal'
import {
  ReturnOrderModal,
  type ReturnOrderData
} from '@/components/zenbook/account/order/ReturnOrderModal'
import type { Order } from '@/services/order/order.type'

interface OrderItem {
  id: string
  bookId: string
  bookTitle: string
  bookSlug?: string
  quantity: number
  priceAtPurchase?: number
  bookImage?: string
  isReviewed?: boolean
}

interface ApiError {
  response?: { data?: { message?: string } }
}

interface ConfirmReceivedDialogProps {
  open: boolean
  isPending: boolean
  onConfirm: () => void
  onClose: () => void
}

const STATUS_KEYS = {
  PENDING: 'orders.status.pending',
  CONFIRMED: 'orders.status.confirmed',
  PACKING: 'orders.status.packing',
  SHIPPING: 'orders.status.shipping',
  COMPLETED: 'orders.status.completed',
  CANCELLED: 'orders.status.cancelled',
  RETURN_REQUESTED: 'orders.status.return_requested',
  RETURNED: 'orders.status.returned'
} as const

const STATUS_TEXT_CLASSES: Record<string, string> = {
  PENDING: 'text-amber-500',
  CONFIRMED: 'text-blue-500',
  PACKING: 'text-indigo-500',
  SHIPPING: 'text-sky-500',
  COMPLETED: 'text-brand-green',
  CANCELLED: 'text-rose-500',
  RETURN_REQUESTED: 'text-amber-600',
  RETURNED: 'text-slate-500'
}

const TABS = [
  'ALL',
  'PENDING',
  'CONFIRMED',
  'PACKING',
  'SHIPPING',
  'COMPLETED',
  'CANCELLED',
  'RETURNED'
] as const
type TabType = (typeof TABS)[number]
const PAGE_SIZE = 10

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

const isWithin7Days = (dateStr: string) => {
  if (!dateStr) return false
  const completedDate = new Date(dateStr).getTime()
  return new Date().getTime() - completedDate <= 7 * 24 * 60 * 60 * 1000
}

function OrderSkeleton() {
  return (
    <div className='flex flex-col gap-4 mt-4'>
      {[1, 2, 3].map((i) => (
        <div key={i} className='rounded-2xl border border-slate-100 overflow-hidden bg-white'>
          <Skeleton className='h-12 w-full' />
          <div className='p-4 flex gap-4'>
            <Skeleton className='h-20 w-20 rounded-xl shrink-0' />
            <div className='flex flex-col gap-2 flex-1'>
              <Skeleton className='h-4 w-3/4 rounded-lg' />
              <Skeleton className='h-4 w-1/4 rounded-lg' />
            </div>
          </div>
          <div className='p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3'>
            <Skeleton className='h-9 w-28 rounded-xl' />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyOrders() {
  const { t } = useTranslation('account')
  return (
    <div className='flex flex-col items-center justify-center py-24 px-4 gap-5 text-center border border-dashed border-slate-200 rounded-3xl mt-4 bg-white shadow-sm'>
      <div className='w-20 h-20 rounded-full bg-slate-50 shadow-sm flex items-center justify-center border border-slate-100'>
        <Package className='w-10 h-10 text-slate-300' />
      </div>
      <div className='max-w-md'>
        <h3 className='font-bold text-[16px] text-slate-800'>{t('orders.emptyTitle')}</h3>
        <p className='text-[13px] text-slate-500 mt-2 font-medium'>
          {t('orders.emptyDescription')}
        </p>
      </div>
      <Button
        asChild
        className='mt-2 bg-brand-green hover:bg-brand-green-dark text-white rounded-xl px-8 h-11 font-bold shadow-md shadow-brand-green/20'
      >
        <Link to='/products'>
          <ShoppingBag className='w-4 h-4 mr-2' strokeWidth={2.5} />
          {t('orders.shopNow')}
        </Link>
      </Button>
    </div>
  )
}

function ConfirmReceivedDialog({
  open,
  isPending,
  onConfirm,
  onClose
}: ConfirmReceivedDialogProps) {
  const { t } = useTranslation('account')
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-md rounded-2xl [&>button]:hidden'>
        <DialogHeader>
          <DialogTitle className='text-emerald-600 flex items-center gap-2 text-[18px]'>
            <CheckCircle2 className='w-5 h-5' /> {t('orders.dialog.confirm.title')}
          </DialogTitle>
          <DialogDescription className='pt-2 text-[13px]'>
            {t('orders.dialog.confirm.desc')}
          </DialogDescription>
        </DialogHeader>
        <div className='py-3'>
          <p className='text-[13.5px] font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100'>
            Lưu ý: Chỉ xác nhận khi bạn đã nhận được hàng và sản phẩm không có vấn đề gì. Sau khi
            xác nhận, bạn sẽ không thể yêu cầu Đổi/Trả hàng.
          </p>
        </div>
        <DialogFooter className='gap-3 sm:gap-0 mt-2'>
          <Button
            variant='outline'
            onClick={onClose}
            disabled={isPending}
            className='rounded-xl h-10 px-6 text-[13px] font-bold'
          >
            {t('orders.dialog.confirm.notYet')}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className='gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-6 text-[13px] font-bold shadow-md shadow-emerald-600/20'
          >
            {isPending ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <CheckCircle2 className='w-4 h-4' strokeWidth={2.5} />
            )}
            {t('orders.dialog.confirm.action')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function OrdersTab() {
  const { t } = useTranslation('account')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { addItem } = useCart()

  const [activeTab, setActiveTab] = useState<TabType>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  const [cancelTarget, setCancelTarget] = useState<string | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null)
  const [returnTarget, setReturnTarget] = useState<string | null>(null)

  const [reviewTarget, setReviewTarget] = useState<{
    productId: string
    orderDetailId: string
    orderId: string
    book: { id: string; title: string; image?: string }
  } | null>(null)

  const getStatusText = (status: OrderStatus) => {
    const key = STATUS_KEYS[status] || 'orders.status.pending'
    return t(key as never)
  }

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['orders', 'my-orders', currentPage, activeTab],
    queryFn: () =>
      orderService.getMyOrders({
        page: currentPage,
        size: PAGE_SIZE,
        status: activeTab === 'ALL' ? undefined : activeTab
      }),
    staleTime: 30 * 1000
  })

  const orders = (pageData?.content as Order[]) || []
  const totalPages = pageData?.totalPages || 0
  const totalElements = pageData?.totalElements || 0

  const unreviewedOrderCount = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status === OrderStatus.COMPLETED &&
        order.details?.some((item: OrderItem) => !item.isReviewed)
    ).length
  }, [orders])

  const cancelMutation = useMutation({
    mutationFn: ({ code, note }: { code: string; note: string }) =>
      orderService.updateStatus(code, {
        newStatus: OrderStatus.CANCELLED,
        note: note || t('orders.mutation.cancelDefault')
      }),
    onSuccess: () => {
      toast.success(t('orders.mutation.cancelSuccess'))
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setCancelTarget(null)
    },
    onError: (error: ApiError) =>
      toast.error(error?.response?.data?.message || t('orders.mutation.cancelError'))
  })

  const confirmReceivedMutation = useMutation({
    mutationFn: (code: string) =>
      orderService.updateStatus(code, {
        newStatus: OrderStatus.COMPLETED,
        note: t('orders.mutation.confirmNote')
      }),
    onSuccess: () => {
      toast.success(t('orders.mutation.confirmSuccess'))
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setConfirmTarget(null)
    },
    onError: (error: ApiError) =>
      toast.error(error?.response?.data?.message || t('orders.mutation.confirmError'))
  })

  const returnMutation = useMutation({
    mutationFn: ({ code, data }: { code: string; data: ReturnOrderData }) => {
      const noteStr = `Lý do: ${data.reason}. Chi tiết: ${data.description}`
      return orderService.updateStatus(code, {
        newStatus: OrderStatus.RETURNED,
        note: noteStr
      })
    },
    onSuccess: () => {
      toast.success('Yêu cầu Trả hàng/Hoàn tiền đã được gửi thành công!')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setReturnTarget(null)
    },
    onError: (error: ApiError) =>
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu.')
  })

  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) => !searchTerm || order.orderCode?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [orders, searchTerm]
  )

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setCurrentPage(0)
  }

  const handleBuyAgain = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation()
    if (!order.details || order.details.length === 0) return

    order.details.forEach((item: OrderItem) => {
      addItem(
        {
          id: item.bookId,
          title: item.bookTitle,
          thumbnail: item.bookImage || '/images/placeholder-book.jpg',
          price: item.priceAtPurchase || 0,
          stock: 99,
          originalPrice: item.priceAtPurchase || 0,
          author: 'ZenBook'
        },
        item.quantity
      )
    })
    toast.success('Đã thêm các sản phẩm vào giỏ hàng!')
    navigate('/cart')
  }

  return (
    <div className='flex flex-col space-y-6 max-w-full animate-in fade-in duration-300 pb-10'>
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-5'>
        <div>
          <h2 className='text-xl font-bold text-slate-900'>{t('orders.title')}</h2>
          <p className='text-[13px] text-slate-500 mt-1 font-medium'>
            {t('orders.subtitle')}{' '}
            {totalElements > 0 && (
              <span className='font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-md ml-1'>
                {totalElements}
              </span>
            )}
          </p>
        </div>
        <div className='relative w-full md:w-80'>
          <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
          <Input
            placeholder={t('orders.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10 bg-white rounded-xl border-slate-200 focus-visible:ring-brand-green shadow-sm h-11 text-[13px] font-medium'
          />
        </div>
      </div>

      <div className='flex overflow-x-auto gap-2 p-1.5 bg-white shadow-sm rounded-2xl border border-slate-100 no-scrollbar'>
        {TABS.map((tab) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2.5 text-[13px] font-bold rounded-xl transition-all duration-300 whitespace-nowrap min-w-[100px] text-center ${
                isActive
                  ? 'bg-brand-green/10 text-brand-green border border-brand-green/20'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
              }`}
            >
              {tab === 'ALL'
                ? t('orders.status.all')
                : t(STATUS_KEYS[tab as keyof typeof STATUS_KEYS] as never)}
            </button>
          )
        })}
      </div>

      {unreviewedOrderCount > 0 && activeTab !== 'CANCELLED' && (
        <div className='bg-gradient-to-r from-brand-green/10 to-emerald-50 border border-brand-green/20 rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 shadow-sm'>
          <div className='w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-brand-green/10'>
            <Star className='w-6 h-6 text-brand-green fill-brand-green animate-pulse' />
          </div>
          <div className='flex-1'>
            <h4 className='text-[14px] font-bold text-slate-900'>
              Đánh giá ngay, nhận quà liền tay! 🎁
            </h4>
            <p className='text-[12.5px] text-slate-600 font-medium mt-0.5'>
              Bạn có <span className='text-brand-green font-bold'>{unreviewedOrderCount}</span> đơn
              hàng chưa đánh giá. Hoàn tất để nhận ngay{' '}
              <span className='text-brand-green font-bold'>+100 ZPoints</span> tích lũy nhé!
            </p>
          </div>
          <Button
            variant='ghost'
            onClick={() => handleTabChange('COMPLETED')}
            className='text-brand-green font-bold text-[13px] hover:bg-brand-green/10 rounded-xl hidden sm:flex'
          >
            Đến trang đánh giá
          </Button>
        </div>
      )}

      {isLoading ? (
        <OrderSkeleton />
      ) : filteredOrders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <div className='flex flex-col gap-5'>
          {filteredOrders.map((order) => {
            const statusTextClass = STATUS_TEXT_CLASSES[order.status] || 'text-slate-600'
            const displayItems = (order.details as OrderItem[]) || []

            const hasAnyReviewedItem = displayItems.some((item: OrderItem) => item.isReviewed)
            const unreviewedItem = displayItems.find((item: OrderItem) => !item.isReviewed)

            const canCancel = order.status === OrderStatus.PENDING
            const canConfirmReceived = order.status === OrderStatus.SHIPPING
            const canReturn =
              order.status === OrderStatus.COMPLETED &&
              isWithin7Days(order.updatedAt) &&
              !hasAnyReviewedItem

            return (
              <div
                key={order.id}
                className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group transition-colors hover:border-brand-green/30'
              >
                <div
                  className='flex items-center justify-between p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors'
                  onClick={() => navigate(`/customer/orders/${order.orderCode}`)}
                >
                  <div className='flex items-center gap-2'>
                    <Store className='w-4 h-4 text-brand-green' />
                    <span className='font-bold text-[13px] text-slate-800 uppercase tracking-wide'>
                      ZenBook Official
                    </span>
                    <span className='bg-brand-green text-white text-[10px] px-1.5 py-0.5 rounded-sm font-bold'>
                      MALL
                    </span>
                  </div>
                  <div className='flex items-center gap-2 text-[12.5px]'>
                    <span className='text-slate-500 font-medium hidden sm:inline'>
                      Mã đơn:{' '}
                      <span className='font-mono font-bold text-slate-800'>{order.orderCode}</span>
                    </span>
                    <span className='text-slate-200 hidden sm:inline'>|</span>
                    <span className={`uppercase font-black tracking-wide ${statusTextClass}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                <div
                  className='flex flex-col px-4 cursor-pointer'
                  onClick={() => navigate(`/customer/orders/${order.orderCode}`)}
                >
                  {displayItems.map((item: OrderItem) => (
                    <div
                      key={item.id}
                      className='py-4 flex gap-4 border-b border-slate-50 last:border-0 group/item'
                    >
                      <div className='w-20 h-20 border border-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1 bg-slate-50 transition-transform group-hover/item:scale-105'>
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
                        <p className='text-[14px] font-bold text-slate-800 line-clamp-2 leading-snug group-hover/item:text-brand-green transition-colors'>
                          {item.bookTitle}
                        </p>
                        <p className='text-[12.5px] text-slate-500 mt-1.5 font-medium'>
                          x{item.quantity}
                        </p>
                      </div>
                      <div className='text-right flex flex-col justify-center shrink-0'>
                        <span className='text-[14px] font-black text-brand-green'>
                          {formatCurrency(item.priceAtPurchase || 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='bg-slate-50/50 px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-3'>
                  <ShieldCheck className='w-4 h-4 text-brand-green hidden sm:block' />
                  <span className='text-[13px] text-slate-600 font-medium uppercase'>
                    Thành tiền:
                  </span>
                  <span className='text-[20px] font-black text-brand-green'>
                    {formatCurrency(order.finalTotal)}
                  </span>
                </div>

                <div className='px-5 py-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3'>
                  {canCancel && (
                    <Button
                      variant='outline'
                      onClick={() => setCancelTarget(order.orderCode)}
                      className='h-9 rounded-xl px-5 text-[13px] font-bold text-slate-600 border-slate-200 hover:text-rose-500'
                    >
                      Hủy đơn hàng
                    </Button>
                  )}
                  {canReturn && (
                    <Button
                      variant='outline'
                      onClick={() => setReturnTarget(order.orderCode)}
                      className='h-9 rounded-xl px-5 text-[13px] font-bold text-slate-600'
                    >
                      Trả hàng / Hoàn tiền
                    </Button>
                  )}
                  {canConfirmReceived && (
                    <Button
                      onClick={() => setConfirmTarget(order.orderCode)}
                      className='h-9 rounded-xl px-5 text-[13px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white'
                    >
                      Đã nhận được hàng
                    </Button>
                  )}
                  {order.status === OrderStatus.COMPLETED && (
                    <>
                      {/* 👉 Nút Đánh giá: Hiện khi còn sản phẩm chưa đánh giá */}
                      {unreviewedItem && (
                        <div className='relative'>
                          <Button
                            onClick={() =>
                              setReviewTarget({
                                productId: unreviewedItem.bookId,
                                orderDetailId: unreviewedItem.id,
                                orderId: order.orderCode,
                                book: {
                                  id: unreviewedItem.bookId,
                                  title: unreviewedItem.bookTitle,
                                  image: unreviewedItem.bookImage
                                }
                              })
                            }
                            className='h-9 rounded-xl px-6 text-[13px] font-bold bg-brand-green hover:bg-brand-green-dark text-white shadow-md'
                          >
                            <MessageSquarePlus className='w-4 h-4 mr-1.5' /> Đánh giá
                          </Button>
                          <span className='absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm animate-bounce'>
                            +100
                          </span>
                        </div>
                      )}

                      {/* 👉 Nút Xem đánh giá: Hiện khi đã có ít nhất 1 sản phẩm được đánh giá */}
                      {hasAnyReviewedItem && (
                        <Button
                          variant='outline'
                          onClick={() => navigate('/customer/myreviews')}
                          className='h-9 rounded-xl px-5 text-[13px] font-bold border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 shadow-sm'
                        >
                          <Star className='w-3.5 h-3.5 mr-1.5 fill-amber-500' /> Xem đánh giá
                        </Button>
                      )}

                      <Button
                        variant='outline'
                        onClick={(e) => handleBuyAgain(e, order)}
                        className='h-9 rounded-xl px-5 text-[13px] font-bold text-brand-green'
                      >
                        <RefreshCcw className='w-3.5 h-3.5 mr-1.5' /> Mua lại
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && filteredOrders.length > 0 && (
        <div className='flex items-center justify-between pt-6 mt-2'>
          <p className='text-[13px] text-slate-500 font-bold'>
            {t('orders.page')} <span className='text-slate-900'>{currentPage + 1}</span> /{' '}
            {totalPages}
          </p>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='icon'
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0 || isLoading}
              className='h-10 w-10 rounded-xl'
            >
              <ChevronLeft className='w-4 h-4' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1 || isLoading}
              className='h-10 w-10 rounded-xl'
            >
              <ChevronRight className='w-4 h-4' />
            </Button>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {cancelTarget && (
        <CancelOrderModal
          open={!!cancelTarget}
          onClose={() => setCancelTarget(null)}
          orderCode={cancelTarget}
          onConfirm={(reason) => cancelMutation.mutate({ code: cancelTarget, note: reason })}
        />
      )}
      {returnTarget && (
        <ReturnOrderModal
          open={!!returnTarget}
          onClose={() => setReturnTarget(null)}
          orderCode={returnTarget}
          onSubmit={(data) => returnMutation.mutate({ code: returnTarget, data })}
        />
      )}
      <ConfirmReceivedDialog
        open={!!confirmTarget}
        isPending={confirmReceivedMutation.isPending}
        onClose={() => setConfirmTarget(null)}
        onConfirm={() => confirmTarget && confirmReceivedMutation.mutate(confirmTarget)}
      />
      {reviewTarget && (
        <ReviewFormModal
          open={!!reviewTarget}
          onClose={() => {
            setReviewTarget(null)
            queryClient.invalidateQueries({ queryKey: ['orders'] })
          }}
          productId={reviewTarget.productId}
          orderDetailId={reviewTarget.orderDetailId}
          orderId={reviewTarget.orderId}
          book={reviewTarget.book}
        />
      )}
    </div>
  )
}
