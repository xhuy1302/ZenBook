import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Loader2,
  ArrowLeft,
  MapPin,
  Plus,
  ChevronRight,
  ReceiptText,
  X,
  Mail,
  Gift,
  Sparkles,
  Ticket,
  Truck,
  CheckCircle2,
  Banknote,
  CreditCard
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { api } from '@/utils/axiosCustomize'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

import { AuthContext } from '@/context/AuthContext'
import { orderService } from '@/services/order/order.api'
import { createAddressApi, getAddressesApi } from '@/services/customer/customer.api'

import { calculateShippingFeeApi } from '@/services/shipping/shipping.api'
import type { ShippingFeeResponse } from '@/services/shipping/shipping.type'

import type { CartItemType } from '@/services/cart/cart.type'
import type { Address, AddressRequest } from '@/services/customer/customer.type'
import type { CouponResponse } from '@/services/coupon/coupon.type'

import AddressDialog from '@/components/zenbook/account/modals/AddressDialog'
import PhoneModal from '@/components/zenbook/account/modals/PhoneModal'
import SelectAddressModal from '@/components/zenbook/account/modals/SelectAddressModal'
import VoucherSheet from '@/pages/client/checkout/VoucherDialog'

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

export default function CheckoutPage() {
  const { t } = useTranslation('checkout')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const authContext = useContext(AuthContext)
  const user = authContext?.user

  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [isSelectAddressModalOpen, setIsSelectAddressModalOpen] = useState(false)
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false)
  const [isVoucherSheetOpen, setIsVoucherSheetOpen] = useState(false)

  const [checkoutItems, setCheckoutItems] = useState<CartItemType[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)

  const [appliedOrderCoupon, setAppliedOrderCoupon] = useState<CouponResponse | null>(null)
  const [appliedShippingCoupon, setAppliedShippingCoupon] = useState<CouponResponse | null>(null)

  const [shippingData, setShippingData] = useState<ShippingFeeResponse | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Khai báo schema sử dụng t()
  const checkoutSchema = z.object({
    customerName: z.string().min(2, t('validation.nameRequired')),
    customerPhone: z.string().regex(/^(0|\+84)[0-9]{8,9}$/, t('validation.phoneInvalid')),
    customerEmail: z.string().email(t('validation.emailInvalid')),
    shippingAddress: z.string().min(5, t('validation.addressRequired')),
    note: z.string().optional(),
    paymentMethod: z.enum(['COD', 'VNPAY'])
  })
  type CheckoutForm = z.infer<typeof checkoutSchema>

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: user?.username ?? '',
      customerEmail: user?.email ?? '',
      customerPhone: user?.phone ?? '',
      shippingAddress: '',
      paymentMethod: 'COD'
    }
  })

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddressesApi,
    enabled: !!user
  })

  useEffect(() => {
    const raw = sessionStorage.getItem('zenbook_checkout_items')
    if (!raw) {
      navigate('/cart')
      return
    }
    const parsed: CartItemType[] = JSON.parse(raw)
    if (parsed.length === 0) {
      navigate('/cart')
      return
    }
    setCheckoutItems(parsed)
  }, [navigate])

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const targetAddress =
        selectedAddress || addresses.find((addr: Address) => addr.isDefault) || addresses[0]
      setSelectedAddress(targetAddress)
    } else {
      setSelectedAddress(null)
    }
  }, [addresses])

  useEffect(() => {
    if (checkoutItems.length === 0 || !selectedAddress) return

    const fetchFee = async () => {
      setIsCalculating(true)
      try {
        const payload = {
          addressId: selectedAddress.id,
          items: checkoutItems.map((i) => ({ bookId: i.id, quantity: i.quantity })),
          orderVoucherCode: appliedOrderCoupon?.code,
          shippingVoucherCode: appliedShippingCoupon?.code
        }
        const res = await calculateShippingFeeApi(payload)
        if (res.data) {
          setShippingData(res.data)
        } else {
          // @ts-expect-error: fix type mismatch from API
          setShippingData(res)
        }
      } catch {
        setShippingData(null)
      } finally {
        setIsCalculating(false)
      }
    }

    const timeoutId = setTimeout(fetchFee, 400)
    return () => clearTimeout(timeoutId)
  }, [checkoutItems, selectedAddress, appliedOrderCoupon, appliedShippingCoupon])

  useEffect(() => {
    if (selectedAddress) {
      const fullAddress = [
        selectedAddress.street,
        selectedAddress.ward,
        selectedAddress.district,
        selectedAddress.city
      ]
        .filter(Boolean)
        .join(', ')

      setValue('shippingAddress', fullAddress, { shouldValidate: true })
      if (selectedAddress.recipientName)
        setValue('customerName', selectedAddress.recipientName, { shouldValidate: true })
      if (selectedAddress.phone)
        setValue('customerPhone', selectedAddress.phone, { shouldValidate: true })
    } else {
      setValue('shippingAddress', '')
      setValue('customerName', user?.username ?? '')
      setValue('customerPhone', user?.phone ?? '')
    }
  }, [selectedAddress, setValue, user])

  const paymentMethod = watch('paymentMethod')

  const applyCouponsFromDialog = (
    orderCoupon: CouponResponse | null,
    shippingCoupon: CouponResponse | null
  ) => {
    setAppliedOrderCoupon(orderCoupon)
    setAppliedShippingCoupon(shippingCoupon)
    if (orderCoupon || shippingCoupon) {
      toast.success(t('toast.couponApplied'))
    }
  }

  const removeOrderCoupon = (e: React.MouseEvent) => {
    e.stopPropagation()
    setAppliedOrderCoupon(null)
    toast.info(t('toast.couponRemoved'))
  }

  const removeShippingCoupon = (e: React.MouseEvent) => {
    e.stopPropagation()
    setAppliedShippingCoupon(null)
    toast.info(t('toast.couponRemoved'))
  }

  const onSubmit = async (data: CheckoutForm) => {
    if (!selectedAddress) {
      toast.error(t('toast.selectAddress'))
      return
    }

    try {
      const order = await orderService.create({
        ...data,
        addressId: selectedAddress.id,
        items: checkoutItems.map((i) => ({ bookId: i.id, quantity: i.quantity })),
        orderCouponCode: appliedOrderCoupon?.code,
        shippingCouponCode: appliedShippingCoupon?.code,
        orderDiscount: shippingData?.orderDiscount ?? 0,
        shippingDiscount: shippingData?.shippingDiscount ?? 0
      })

      const cartRaw = localStorage.getItem('zenbook_cart')
      if (cartRaw) {
        const cart: CartItemType[] = JSON.parse(cartRaw)
        const checkoutIds = new Set(checkoutItems.map((i) => i.id))
        const remaining = cart.filter((i) => !checkoutIds.has(i.id))
        localStorage.setItem('zenbook_cart', JSON.stringify(remaining))
      }
      sessionStorage.removeItem('zenbook_checkout_items')

      if (data.paymentMethod === 'VNPAY') {
        setIsRedirecting(true)
        toast.loading(t('redirectingVnpay'))
        const res = await api.get(`/payment/create-url/${order.id}`)
        if (res.data && res.data.url) {
          window.location.href = res.data.url
        } else {
          throw new Error('Không lấy được URL thanh toán')
        }
      } else {
        toast.success(t('toast.orderSuccess', { orderCode: order.orderCode }))
        navigate(`/orders/success/${order.orderCode}`)
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr?.response?.data?.message ?? 'Có lỗi xảy ra, vui lòng thử lại')
      setIsRedirecting(false)
    }
  }

  const handleSaveAddress = async (payload: AddressRequest) => {
    try {
      await createAddressApi(payload)
      toast.success(t('toast.addAddressSuccess'))
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setIsAddressDialogOpen(false)
    } catch {
      toast.error(t('toast.addAddressFail'))
    }
  }

  const handlePhoneUpdated = async (newPhone: string) => {
    setValue('customerPhone', newPhone, { shouldValidate: true })
    if (authContext?.updateUser) {
      await authContext.updateUser({ ...user, phone: newPhone })
    } else if (authContext?.isLoading === false && authContext?.user) {
      // @ts-expect-error: thiếu type setUser
      authContext.setUser({ ...user, phone: newPhone })
    }
  }

  if (checkoutItems.length === 0) return null

  const fallbackSubtotal = checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const finalTotal = isCalculating ? 0 : shippingData ? shippingData.totalPayment : fallbackSubtotal
  const hasNoCouponsApplied = !appliedOrderCoupon && !appliedShippingCoupon

  return (
    <main className='min-h-screen bg-[#f5f5f5] pb-32 pt-6'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='flex items-center gap-3 mb-6'>
          <button
            type='button'
            className='flex items-center gap-2 text-brand-green hover:text-brand-green-dark transition-colors'
            onClick={() => navigate('/cart')}
          >
            <ArrowLeft className='w-5 h-5' />
            <h1 className='text-xl font-medium text-zinc-900'>{t('title')}</h1>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {/* BLOCK 1: ĐỊA CHỈ */}
          <div className='bg-white rounded-sm shadow-sm relative overflow-hidden'>
            <div className='h-1 w-full bg-[repeating-linear-gradient(45deg,#10b981,#10b981_33px,transparent_0,transparent_41px,#34d399_0,#34d399_74px,transparent_0,transparent_82px)]' />
            <div className='p-6 md:p-8'>
              <div className='flex items-center gap-2 text-brand-green text-lg font-medium mb-4'>
                <MapPin className='w-5 h-5' />
                <h2>{t('address.label')}</h2>
              </div>
              {!addresses || addresses.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50'>
                  <p className='text-sm text-gray-600 mb-4 text-center whitespace-pre-line'>
                    {t('address.noAddressDesc')}
                  </p>
                  <Button
                    type='button'
                    onClick={() => setIsAddressDialogOpen(true)}
                    className='bg-brand-green hover:bg-brand-green-dark'
                  >
                    <Plus className='w-4 h-4 mr-2' /> {t('address.addNew')}
                  </Button>
                </div>
              ) : (
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                  <div className='flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-zinc-900'>
                    <div className='font-bold text-base whitespace-nowrap'>
                      {selectedAddress?.recipientName || watch('customerName')} (+84){' '}
                      {(selectedAddress?.phone || watch('customerPhone')).replace(/^0/, '')}
                    </div>
                    <div className='text-base text-gray-700 flex-1'>
                      {watch('shippingAddress')}
                      {selectedAddress?.isDefault && (
                        <span className='ml-3 text-[10px] uppercase border border-brand-green text-brand-green px-1.5 py-0.5 rounded-sm'>
                          {t('address.default')}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    type='button'
                    variant='ghost'
                    onClick={() => setIsSelectAddressModalOpen(true)}
                    className='text-blue-600 hover:text-blue-700 hover:bg-transparent px-0 font-medium whitespace-nowrap'
                  >
                    {t('address.change')}
                  </Button>
                </div>
              )}
              <input type='hidden' {...register('shippingAddress')} />
              <input type='hidden' {...register('customerName')} />
              <input type='hidden' {...register('customerPhone')} />
              {errors.shippingAddress && (
                <p className='text-red-500 text-xs mt-2'>* {errors.shippingAddress.message}</p>
              )}
              <div className='mt-5 pt-4 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Mail className='w-4 h-4 text-gray-400' />
                  <span>{t('address.emailNotice')}</span>
                </div>
                <Input
                  type='email'
                  readOnly
                  className='h-9 w-full md:w-64 bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed focus-visible:ring-0 text-sm'
                  {...register('customerEmail')}
                />
              </div>
            </div>
          </div>

          {/* BLOCK 2: SẢN PHẨM */}
          <div className='bg-white rounded-sm shadow-sm'>
            <div className='hidden md:grid grid-cols-12 px-6 py-4 border-b border-gray-100 text-gray-500 text-sm'>
              <div className='col-span-6'>{t('cart.product')}</div>
              <div className='col-span-2 text-center'>{t('cart.unitPrice')}</div>
              <div className='col-span-2 text-center'>{t('cart.quantity')}</div>
              <div className='col-span-2 text-right'>{t('cart.total')}</div>
            </div>
            <div className='px-6'>
              {checkoutItems.map((item) => (
                <div
                  key={item.id}
                  className='grid grid-cols-1 md:grid-cols-12 py-4 border-b border-gray-100 border-dashed last:border-0 items-center gap-4 md:gap-0'
                >
                  <div className='col-span-6 flex items-start gap-4'>
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className='w-16 h-16 object-cover rounded border border-gray-200 shrink-0'
                    />
                    <span className='text-sm text-zinc-900 line-clamp-2 mt-1'>{item.title}</span>
                  </div>
                  <div className='col-span-2 text-center text-sm text-gray-700 hidden md:block'>
                    {formatVND(item.price)}
                  </div>
                  <div className='col-span-2 text-center text-sm text-gray-700 hidden md:block'>
                    {item.quantity}
                  </div>
                  <div className='md:hidden flex justify-between text-sm text-gray-700 w-full'>
                    <span>
                      {formatVND(item.price)} x {item.quantity}
                    </span>
                    <span className='font-medium text-brand-green'>
                      {formatVND(item.price * item.quantity)}
                    </span>
                  </div>
                  <div className='col-span-2 text-right text-sm font-medium text-brand-green hidden md:block'>
                    {formatVND(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            <div className='bg-[#fafafa] border-t border-gray-100 grid grid-cols-1 md:grid-cols-2'>
              <div className='p-6 flex items-center gap-4 border-b md:border-b-0 md:border-r border-gray-100'>
                <span className='text-sm text-zinc-900 whitespace-nowrap'>{t('cart.message')}</span>
                <Input
                  placeholder={t('cart.messagePlaceholder')}
                  className='h-10 text-sm bg-white border-gray-300 focus-visible:ring-brand-green'
                  {...register('note')}
                />
              </div>
              <div className='p-6 flex flex-col justify-center gap-2 text-sm'>
                <div className='flex justify-between items-center text-zinc-900'>
                  <span>{t('cart.shippingUnit')}</span>
                  <span className='font-medium'>
                    {isCalculating ? (
                      <Loader2 className='w-4 h-4 animate-spin' />
                    ) : shippingData ? (
                      formatVND(shippingData.baseShippingFee)
                    ) : (
                      '---'
                    )}
                  </span>
                </div>
                <div className='flex justify-between items-center text-gray-500 text-xs'>
                  <span>{t('cart.estimatedDelivery')}</span>
                  <span>{t('cart.canCheck')}</span>
                </div>
              </div>
            </div>
            <div className='px-6 py-4 flex justify-end items-center gap-4 border-t border-gray-100 bg-white'>
              <span className='text-sm text-gray-500'>
                {t('cart.totalItems', { count: checkoutItems.length })}
              </span>
              <span className='text-lg font-medium text-brand-green'>
                {formatVND(shippingData?.rawOrderTotal ?? fallbackSubtotal)}
              </span>
            </div>
          </div>

          {/* BLOCK 3: VOUCHER */}
          <div
            className={cn(
              'bg-white px-6 py-5 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all border border-transparent',
              hasNoCouponsApplied
                ? 'border-brand-green/30 hover:border-brand-green bg-brand-green/5'
                : 'hover:border-gray-200'
            )}
            onClick={() => setIsVoucherSheetOpen(true)}
          >
            <div className='flex items-center gap-3 shrink-0'>
              <ReceiptText className='w-6 h-6 text-brand-green' />
              <span className='text-lg font-medium text-zinc-900'>{t('voucher.title')}</span>
              {hasNoCouponsApplied && (
                <Badge
                  variant='secondary'
                  className='bg-brand-green/10 text-brand-green border-none animate-pulse'
                >
                  <Sparkles className='w-3 h-3 mr-1' /> {t('voucher.applyHint')}
                </Badge>
              )}
            </div>

            <div className='flex items-center gap-4 w-full md:w-auto justify-end'>
              {/* Khu vực hiển thị các mã đã chọn */}
              <div className='flex flex-wrap justify-end gap-2'>
                {appliedShippingCoupon && (
                  <div className='flex items-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 rounded-md text-[13px] font-medium transition-colors hover:bg-sky-100'>
                    <Truck className='w-3.5 h-3.5' />
                    <span>Freeship</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeShippingCoupon(e)
                      }}
                      className='ml-1 p-0.5 hover:bg-sky-200 rounded-full transition-colors'
                    >
                      <X className='w-3 h-3' />
                    </button>
                  </div>
                )}

                {appliedOrderCoupon && (
                  <div className='flex items-center gap-1.5 bg-brand-green/10 text-brand-green border border-brand-green/20 px-2.5 py-1 rounded-md text-[13px] font-medium transition-colors hover:bg-brand-green/20'>
                    <Ticket className='w-3.5 h-3.5' />
                    <span>-{appliedOrderCoupon.code}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeOrderCoupon(e)
                      }}
                      className='ml-1 p-0.5 hover:bg-brand-green/20 rounded-full transition-colors'
                    >
                      <X className='w-3 h-3' />
                    </button>
                  </div>
                )}
              </div>

              {/* Nút bấm hành động */}
              <div className='flex items-center gap-1 shrink-0 ml-2'>
                {hasNoCouponsApplied ? (
                  <span className='text-brand-green text-sm font-semibold flex items-center gap-1 hover:underline'>
                    <Gift className='w-4 h-4' /> {t('voucher.select')}
                  </span>
                ) : (
                  <span className='text-blue-600 text-sm font-medium'>{t('voucher.change')}</span>
                )}
                <ChevronRight className='w-4 h-4 text-gray-400' />
              </div>
            </div>
          </div>

          {/* BLOCK 4: PHƯƠNG THỨC THANH TOÁN */}
          <div className='bg-white rounded-sm shadow-sm p-6 md:p-8'>
            <div className='flex items-center gap-2 mb-6'>
              <div className='w-1 h-5 bg-brand-green rounded-full' />
              <h2 className='text-lg font-semibold text-zinc-900'>{t('payment.title')}</h2>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {[
                {
                  value: 'COD',
                  label: t('payment.codLabel'),
                  description: 'Thanh toán khi nhận hàng',
                  icon: <Banknote className='w-6 h-6' />
                },
                {
                  value: 'VNPAY',
                  label: t('payment.vnpayLabel'),
                  description: 'Thanh toán qua ví điện tử/thẻ ATM',
                  icon: <CreditCard className='w-6 h-6' />
                }
              ].map((method) => {
                const isSelected = paymentMethod === method.value

                return (
                  <label
                    key={method.value}
                    className={cn(
                      'relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none',
                      isSelected
                        ? 'border-brand-green bg-brand-green/[0.03] ring-1 ring-brand-green/20'
                        : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    {/* Radio Input ẩn nhưng vẫn hoạt động để RHF nhận giá trị */}
                    <input
                      type='radio'
                      value={method.value}
                      {...register('paymentMethod')}
                      className='sr-only'
                    />

                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors',
                        isSelected ? 'bg-brand-green text-white' : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {method.icon}
                    </div>

                    <div className='flex-1'>
                      <p
                        className={cn(
                          'text-sm font-bold transition-colors',
                          isSelected ? 'text-brand-green' : 'text-zinc-700'
                        )}
                      >
                        {method.label}
                      </p>
                      <p className='text-xs text-slate-500 mt-0.5'>{method.description}</p>
                    </div>

                    {/* Icon Checkmark khi được chọn */}
                    <div
                      className={cn(
                        'shrink-0 transition-all duration-300 transform',
                        isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                      )}
                    >
                      <CheckCircle2 className='w-6 h-6 text-brand-green fill-brand-green/10' />
                    </div>
                  </label>
                )
              })}
            </div>

            {errors.paymentMethod && (
              <p className='text-red-500 text-xs mt-3 italic'>* {errors.paymentMethod.message}</p>
            )}
          </div>

          {/* BLOCK 5: TỔNG KẾT */}
          <div className='bg-[#fafafa] rounded-sm shadow-sm border-t border-gray-100 p-6 flex flex-col items-end gap-3 text-sm'>
            <div className='flex justify-between w-full md:w-[350px]'>
              <span className='text-gray-500'>{t('summary.totalGoods')}</span>
              <span className='text-zinc-900'>
                {formatVND(shippingData?.rawOrderTotal ?? fallbackSubtotal)}
              </span>
            </div>
            <div className='flex justify-between w-full md:w-[350px]'>
              <span className='text-gray-500'>{t('summary.shippingFee')}</span>
              <span className='text-zinc-900'>
                {isCalculating ? (
                  <Loader2 className='w-3 h-3 animate-spin' />
                ) : shippingData ? (
                  formatVND(shippingData.baseShippingFee)
                ) : (
                  '---'
                )}
              </span>
            </div>
            {(shippingData?.orderDiscount || 0) > 0 && (
              <div className='flex justify-between w-full md:w-[350px]'>
                <span className='text-gray-500'>{t('summary.voucherDiscount')}</span>
                <span className='text-brand-green'>- {formatVND(shippingData!.orderDiscount)}</span>
              </div>
            )}
            {(shippingData?.shippingDiscount || 0) > 0 && (
              <div className='flex justify-between w-full md:w-[350px]'>
                <span className='text-gray-500'>{t('summary.voucherFreeship')}</span>
                <span className='text-brand-green'>
                  - {formatVND(shippingData!.shippingDiscount)}
                </span>
              </div>
            )}
            <div className='flex justify-between w-full md:w-[350px] items-center pt-2'>
              <span className='text-gray-500'>{t('summary.totalPayment')}</span>
              <span className='text-2xl font-bold text-brand-green'>
                {isCalculating ? (
                  <Loader2 className='w-6 h-6 animate-spin' />
                ) : (
                  formatVND(finalTotal)
                )}
              </span>
            </div>
          </div>

          {/* STICKY FOOTER */}
          <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40'>
            <div className='max-w-6xl mx-auto px-4 py-4 flex items-center justify-between md:justify-end gap-6'>
              <div className='flex flex-col md:flex-row md:items-center gap-1 md:gap-4'>
                <span className='text-sm text-gray-600 hidden md:inline'>
                  {t('summary.stickyTotalPayment')}
                </span>
                <span className='text-xl md:text-2xl font-bold text-brand-green'>
                  {isCalculating ? (
                    <Loader2 className='w-6 h-6 animate-spin' />
                  ) : (
                    formatVND(finalTotal)
                  )}
                </span>
              </div>
              <Button
                type='submit'
                disabled={
                  isSubmitting ||
                  isCalculating ||
                  !selectedAddress ||
                  !shippingData ||
                  isRedirecting
                }
                className='w-40 md:w-52 h-11 bg-brand-green hover:bg-brand-green-dark text-sm font-semibold uppercase rounded-sm'
              >
                {isSubmitting || isRedirecting ? (
                  <div className='flex items-center text-white'>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' /> {t('summary.processing')}
                  </div>
                ) : (
                  t('summary.checkout')
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* MODALS */}
        <AddressDialog
          open={isAddressDialogOpen}
          onOpenChange={setIsAddressDialogOpen}
          onSave={handleSaveAddress}
        />
        {isSelectAddressModalOpen && (
          <SelectAddressModal
            open={isSelectAddressModalOpen}
            onOpenChange={setIsSelectAddressModalOpen}
            addresses={addresses || []}
            currentSelectedId={selectedAddress?.id}
            onSelect={(addr: Address) => {
              setSelectedAddress(addr)
              setIsSelectAddressModalOpen(false)
            }}
            onAddNew={() => {
              setIsSelectAddressModalOpen(false)
              setIsAddressDialogOpen(true)
            }}
          />
        )}
        <PhoneModal
          open={isPhoneModalOpen}
          onOpenChange={setIsPhoneModalOpen}
          currentPhone={user?.phone ?? undefined}
          onUpdated={handlePhoneUpdated}
        />
        <VoucherSheet
          open={isVoucherSheetOpen}
          onOpenChange={setIsVoucherSheetOpen}
          subtotal={shippingData?.rawOrderTotal ?? fallbackSubtotal}
          currentOrderCoupon={appliedOrderCoupon}
          currentShippingCoupon={appliedShippingCoupon}
          onApplyCoupons={applyCouponsFromDialog}
          currentUserId={user?.id}
        />
      </div>
    </main>
  )
}
