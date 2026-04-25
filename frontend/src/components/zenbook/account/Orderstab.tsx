import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Eye,
  Search,
  XCircle,
  Package,
  CheckCircle2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShoppingBag
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { orderService } from '@/services/order/order.api'

interface OrderItem {
  bookTitle: string
  quantity: number
  bookImage?: string
}

interface ApiError {
  response?: { data?: { message?: string } }
}

const STATUS_KEYS: Record<string, string> = {
  PENDING: 'orders.status.pending',
  CONFIRMED: 'orders.status.confirmed',
  PACKING: 'orders.status.packing',
  SHIPPING: 'orders.status.shipping',
  COMPLETED: 'orders.status.completed',
  CANCELLED: 'orders.status.cancelled',
  RETURNED: 'orders.status.returned'
}

const STATUS_CLASSES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  PACKING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  SHIPPING: 'bg-sky-50 text-sky-700 border-sky-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
  RETURNED: 'bg-slate-100 text-slate-700 border-slate-300'
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

function formatDate(dateStr: string) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isWithin7Days = (dateStr: string) => {
  if (!dateStr) return false
  const completedDate = new Date(dateStr).getTime()
  return new Date().getTime() - completedDate <= 7 * 24 * 60 * 60 * 1000
}

function OrderSkeleton() {
  return (
    <div className='flex flex-col gap-5 mt-4'>
      {[1, 2, 3].map((i) => (
        <div key={i} className='rounded-2xl border border-slate-100 overflow-hidden bg-white'>
          <div className='bg-slate-50/50 p-4 border-b border-slate-100 flex justify-between items-center'>
            <Skeleton className='h-5 w-32 rounded-lg' />
            <Skeleton className='h-7 w-24 rounded-full' />
          </div>
          <div className='p-5 grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='md:col-span-3 flex flex-col gap-3'>
              <Skeleton className='h-4 w-3/4 rounded-lg' />
              <Skeleton className='h-4 w-1/2 rounded-lg' />
            </div>
            <div className='flex flex-col items-start md:items-end gap-2'>
              <Skeleton className='h-4 w-16 rounded-lg' />
              <Skeleton className='h-6 w-24 rounded-lg' />
            </div>
          </div>
          <div className='p-4 border-t border-slate-100 bg-slate-50/30 flex justify-end gap-3'>
            <Skeleton className='h-9 w-28 rounded-lg' />
            <Skeleton className='h-9 w-32 rounded-lg' />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyOrders() {
  const { t } = useTranslation('account')
  return (
    <div className='flex flex-col items-center justify-center py-24 px-4 gap-5 text-center border border-dashed border-slate-200 rounded-3xl mt-4 bg-slate-50/50'>
      <div className='w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100'>
        <Package className='w-10 h-10 text-slate-400' />
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

interface CancelDialogProps {
  open: boolean
  isPending: boolean
  onConfirm: (note: string) => void
  onClose: () => void
}
function CancelDialog({ open, isPending, onConfirm, onClose }: CancelDialogProps) {
  const { t } = useTranslation('account')
  const [note, setNote] = useState('')
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-md rounded-2xl'>
        <DialogHeader>
          <DialogTitle className='text-rose-600 flex items-center gap-2 text-[18px]'>
            <XCircle className='w-5 h-5' /> {t('orders.dialog.cancel.title')}
          </DialogTitle>
          <DialogDescription className='pt-2 text-[13px]'>
            {t('orders.dialog.cancel.desc')}
          </DialogDescription>
        </DialogHeader>
        <div className='py-3'>
          <Label htmlFor='cancel-note' className='text-[13px] font-bold text-slate-800'>
            {t('orders.dialog.cancel.label')}
          </Label>
          <Textarea
            id='cancel-note'
            placeholder={t('orders.dialog.cancel.placeholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className='mt-2 resize-none rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-brand-green text-[13px]'
            rows={3}
          />
        </div>
        <DialogFooter className='gap-3 sm:gap-0 mt-2'>
          <Button
            variant='outline'
            onClick={onClose}
            disabled={isPending}
            className='rounded-xl h-10 px-6 text-[13px] font-bold'
          >
            {t('orders.dialog.cancel.keep')}
          </Button>
          <Button
            variant='destructive'
            onClick={() => onConfirm(note)}
            disabled={isPending}
            className='gap-2 rounded-xl h-10 px-6 text-[13px] font-bold'
          >
            {isPending && <Loader2 className='w-4 h-4 animate-spin' />}{' '}
            {t('orders.dialog.cancel.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ConfirmDialogProps {
  open: boolean
  isPending: boolean
  onConfirm: () => void
  onClose: () => void
}
function ConfirmReceivedDialog({ open, isPending, onConfirm, onClose }: ConfirmDialogProps) {
  const { t } = useTranslation('account')
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-md rounded-2xl'>
        <DialogHeader>
          <DialogTitle className='text-emerald-600 flex items-center gap-2 text-[18px]'>
            <CheckCircle2 className='w-5 h-5' /> {t('orders.dialog.confirm.title')}
          </DialogTitle>
          <DialogDescription className='pt-2 text-[13px]'>
            {t('orders.dialog.confirm.desc')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='gap-3 sm:gap-0 mt-6'>
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

interface ReturnDialogProps {
  open: boolean
  isPending: boolean
  onConfirm: (reason: string) => void
  onClose: () => void
}
function ReturnDialog({ open, isPending, onConfirm, onClose }: ReturnDialogProps) {
  const { t } = useTranslation('account')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError(t('orders.dialog.return.errorRequired'))
      return
    }
    setError('')
    onConfirm(reason)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setReason('')
          setError('')
          onClose()
        }
      }}
    >
      <DialogContent className='sm:max-w-md rounded-2xl'>
        <DialogHeader>
          <DialogTitle className='text-amber-600 flex items-center gap-2 text-[18px]'>
            <RotateCcw className='w-5 h-5' /> {t('orders.dialog.return.title')}
          </DialogTitle>
          <DialogDescription className='pt-2 text-[13px]'>
            {t('orders.dialog.return.desc')}
          </DialogDescription>
        </DialogHeader>
        <div className='py-3 flex flex-col gap-2'>
          <Label htmlFor='return-reason' className='text-[13px] font-bold text-slate-800'>
            {t('orders.dialog.return.label')} <span className='text-rose-500'>*</span>
          </Label>
          <Textarea
            id='return-reason'
            placeholder={t('orders.dialog.return.placeholder')}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              setError('')
            }}
            className={`resize-none rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-brand-green text-[13px] ${error ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
            rows={4}
          />
          {error && <p className='text-[12px] text-rose-500 font-bold pl-1'>{error}</p>}
        </div>
        <DialogFooter className='gap-3 sm:gap-0 mt-2'>
          <Button
            variant='outline'
            onClick={() => {
              setReason('')
              setError('')
              onClose()
            }}
            disabled={isPending}
            className='rounded-xl h-10 px-6 text-[13px] font-bold'
          >
            {t('orders.dialog.return.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending}
            className='gap-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-10 px-6 text-[13px] font-bold shadow-md shadow-amber-500/20'
          >
            {isPending ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <RotateCcw className='w-4 h-4' strokeWidth={2.5} />
            )}
            {t('orders.dialog.return.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function OrdersTab() {
  const { t } = useTranslation('account')
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null)
  const [returnTarget, setReturnTarget] = useState<string | null>(null)

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

  const orders = pageData?.content || []
  const totalPages = pageData?.totalPages || 0
  const totalElements = pageData?.totalElements || 0

  const cancelMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      orderService.updateStatus(id, {
        newStatus: 'CANCELLED',
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
    mutationFn: (id: string) =>
      orderService.updateStatus(id, {
        newStatus: 'COMPLETED',
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
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      orderService.updateStatus(id, { newStatus: 'RETURNED', note: reason }),
    onSuccess: () => {
      toast.success(t('orders.mutation.returnSuccess'))
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setReturnTarget(null)
    },
    onError: (error: ApiError) =>
      toast.error(error?.response?.data?.message || t('orders.mutation.returnError'))
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

  return (
    <div className='flex flex-col space-y-6 max-w-full animate-in fade-in duration-300'>
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

      <div className='flex flex-wrap gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100'>
        {TABS.map((tab) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2.5 text-[13px] font-bold rounded-xl transition-all duration-300 flex-1 min-w-[100px] text-center ${
                isActive
                  ? 'bg-white text-brand-green shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 border border-transparent'
              }`}
            >
              {tab === 'ALL' ? t('orders.status.all') : t(STATUS_KEYS[tab] || '')}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <OrderSkeleton />
      ) : filteredOrders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <div className='flex flex-col gap-5'>
          {filteredOrders.map((order) => {
            const statusKey = STATUS_KEYS[order.status] || 'orders.status.pending'
            const statusClass =
              STATUS_CLASSES[order.status] || 'bg-slate-50 text-slate-600 border-slate-200'
            const displayItems = (order.details || []).slice(0, 3)
            const remainingCount = (order.details || []).length - displayItems.length

            const canCancel = order.status === 'PENDING'
            const canConfirmReceived = order.status === 'SHIPPING'
            const canReturn = order.status === 'COMPLETED' && isWithin7Days(order.updatedAt)

            return (
              <div
                key={order.id}
                className='flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden'
              >
                <div className='bg-slate-50/80 px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3'>
                  <div className='flex items-center gap-3'>
                    <span className='font-mono font-bold text-[13px] text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm'>
                      #{order.orderCode}
                    </span>
                    <span className='text-[13px] text-slate-500 font-medium'>
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-[11.5px] font-black border uppercase tracking-wider ${statusClass}`}
                  >
                    {t(statusKey)}
                  </span>
                </div>

                <div className='p-5 flex flex-col md:flex-row justify-between gap-6'>
                  <div className='flex-1 flex flex-col gap-4'>
                    {displayItems.length > 0 ? (
                      displayItems.map((item: OrderItem, idx: number) => (
                        <div key={idx} className='flex items-start gap-4'>
                          <div className='w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden p-1'>
                            {item.bookImage ? (
                              <img
                                src={item.bookImage}
                                alt={item.bookTitle}
                                className='w-full h-full object-contain mix-blend-multiply'
                                loading='lazy'
                              />
                            ) : (
                              <ShoppingBag className='w-5 h-5 text-slate-300' />
                            )}
                          </div>
                          <div className='flex-1 min-w-0 pt-0.5'>
                            <p className='text-[14px] font-bold text-slate-800 line-clamp-2 leading-tight'>
                              {item.bookTitle}
                            </p>
                            <p className='text-[13px] text-slate-500 mt-1 font-medium'>
                              {t('orders.quantity')}:{' '}
                              <span className='font-bold text-slate-700'>{item.quantity}</span>
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className='text-[13px] text-slate-400 italic'>
                        {t('orders.noItems')}
                      </span>
                    )}
                    {remainingCount > 0 && (
                      <div className='text-[13px] text-slate-500 font-bold pl-[72px] mt-[-4px]'>
                        + {remainingCount} {t('orders.moreItems')}
                      </div>
                    )}
                  </div>

                  <div className='md:min-w-[180px] flex flex-col items-start md:items-end justify-center py-2 md:py-0 md:border-l md:border-slate-100 md:pl-6 border-t border-slate-100 pt-4 md:border-t-0 md:pt-0'>
                    <span className='text-[13px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide'>
                      {t('orders.columns.total')}
                    </span>
                    <span className='text-[18px] font-black text-brand-green'>
                      {formatCurrency(order.finalTotal)}
                    </span>
                  </div>
                </div>

                <div className='bg-slate-50/50 px-5 py-3.5 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5'>
                  {order.status === 'COMPLETED' && !isWithin7Days(order.updatedAt) && (
                    <span className='text-[12.5px] text-slate-400 italic font-medium mr-auto'>
                      {t('orders.returnExpiredHint')}
                    </span>
                  )}

                  {canCancel && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setCancelTarget(order.id)}
                      className='h-9 rounded-lg px-4 text-rose-600 border border-rose-200 bg-white hover:bg-rose-50 hover:border-rose-300 font-semibold text-[13px] shadow-sm transition-all'
                    >
                      <XCircle className='w-3.5 h-3.5 mr-1.5' strokeWidth={2.5} />{' '}
                      {t('orders.actions.cancel')}
                    </Button>
                  )}

                  {canConfirmReceived && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setConfirmTarget(order.id)}
                      className='h-9 rounded-lg px-4 text-emerald-600 border border-emerald-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 font-semibold text-[13px] shadow-sm transition-all'
                    >
                      <CheckCircle2 className='w-3.5 h-3.5 mr-1.5' strokeWidth={2.5} />{' '}
                      {t('orders.actions.confirm')}
                    </Button>
                  )}

                  {canReturn && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setReturnTarget(order.id)}
                      className='h-9 rounded-lg px-4 text-amber-600 border border-amber-200 bg-white hover:bg-amber-50 hover:border-amber-300 font-semibold text-[13px] shadow-sm transition-all'
                    >
                      <RotateCcw className='w-3.5 h-3.5 mr-1.5' strokeWidth={2.5} />{' '}
                      {t('orders.actions.return')}
                    </Button>
                  )}

                  <Button
                    asChild
                    className='h-9 rounded-lg px-4 bg-slate-900 text-white hover:bg-slate-800 font-semibold text-[13px] shadow-sm transition-all'
                  >
                    <Link to={`/customer/orders/${order.id}`}>
                      <Eye className='w-3.5 h-3.5 mr-1.5' strokeWidth={2.5} />{' '}
                      {t('orders.actions.details')}
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

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
              className='h-10 w-10 rounded-xl border-slate-200 text-slate-600'
            >
              <ChevronLeft className='w-4 h-4' strokeWidth={2.5} />
            </Button>
            <div className='hidden sm:flex gap-2'>
              {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size='icon'
                  onClick={() => setCurrentPage(page)}
                  className={`h-10 w-10 rounded-xl font-bold text-[13px] ${page === currentPage ? 'bg-brand-green hover:bg-brand-green-dark text-white shadow-md shadow-brand-green/20' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {page + 1}
                </Button>
              ))}
            </div>
            <Button
              variant='outline'
              size='icon'
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1 || isLoading}
              className='h-10 w-10 rounded-xl border-slate-200 text-slate-600'
            >
              <ChevronRight className='w-4 h-4' strokeWidth={2.5} />
            </Button>
          </div>
        </div>
      )}

      <CancelDialog
        open={!!cancelTarget}
        isPending={cancelMutation.isPending}
        onClose={() => setCancelTarget(null)}
        onConfirm={(note) => cancelTarget && cancelMutation.mutate({ id: cancelTarget, note })}
      />
      <ConfirmReceivedDialog
        open={!!confirmTarget}
        isPending={confirmReceivedMutation.isPending}
        onClose={() => setConfirmTarget(null)}
        onConfirm={() => confirmTarget && confirmReceivedMutation.mutate(confirmTarget)}
      />
      <ReturnDialog
        open={!!returnTarget}
        isPending={returnMutation.isPending}
        onClose={() => setReturnTarget(null)}
        onConfirm={(reason) => returnTarget && returnMutation.mutate({ id: returnTarget, reason })}
      />
    </div>
  )
}
