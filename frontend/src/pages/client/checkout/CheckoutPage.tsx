// CheckoutPage.tsx
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Phone, ArrowLeft, Ticket, MapPin, Plus, X, Truck, Percent } from 'lucide-react'
import { api } from '@/utils/axiosCustomize'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

import { AuthContext } from '@/context/AuthContext'
import { orderService } from '@/services/order/order.api'
import { createAddressApi, getAddressesApi } from '@/services/customer/customer.api'
import { validateCouponApi } from '@/services/coupon/coupon.api'

import { calculateShippingFeeApi } from '@/services/shipping/shipping.api'
import type { ShippingFeeResponse } from '@/services/shipping/shipping.type'

import type { CartItemType } from '@/services/cart/cart.type'
import type { Address, AddressRequest } from '@/services/customer/customer.type'
import type { CouponResponse } from '@/services/coupon/coupon.type'

import AddressDialog from '@/components/zenbook/account/modals/AddressDialog'
import PhoneModal from '@/components/zenbook/account/modals/PhoneModal'
import SelectAddressModal from '@/components/zenbook/account/modals/SelectAddressModal'

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Vui lòng nhập họ và tên'),
  customerPhone: z.string().regex(/^(0|\+84)[0-9]{8,9}$/, 'Vui lòng thêm số điện thoại hợp lệ'),
  customerEmail: z.string().email('Email không hợp lệ'),
  shippingAddress: z.string().min(5, 'Vui lòng thêm địa chỉ giao hàng'),
  note: z.string().optional(),
  paymentMethod: z.enum(['COD', 'VNPAY'])
})

type CheckoutForm = z.infer<typeof checkoutSchema>

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

export default function CheckoutPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const authContext = useContext(AuthContext)
  const user = authContext?.user

  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [isSelectAddressModalOpen, setIsSelectAddressModalOpen] = useState(false)
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false)
  const [checkoutItems, setCheckoutItems] = useState<CartItemType[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)

  const [couponInput, setCouponInput] = useState('')
  const [isCouponLoading, setIsCouponLoading] = useState(false)

  const [appliedOrderCoupon, setAppliedOrderCoupon] = useState<CouponResponse | null>(null)
  const [appliedShippingCoupon, setAppliedShippingCoupon] = useState<CouponResponse | null>(null)

  const [shippingData, setShippingData] = useState<ShippingFeeResponse | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

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
          // @ts-expect-error: fix loi type tra ve tu API
          setShippingData(res)
        }
      } catch {
        setShippingData(null)
      } finally {
        setIsCalculating(false)
      }
    }

    const timeoutId = setTimeout(() => {
      fetchFee()
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [checkoutItems, selectedAddress, appliedOrderCoupon, appliedShippingCoupon])

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
  const currentPhone = watch('customerPhone')

  const handleApplyCoupon = async () => {
    const code = couponInput.trim()
    if (!code) {
      toast.warning('Vui lòng nhập mã giảm giá')
      return
    }

    if (appliedOrderCoupon?.code === code || appliedShippingCoupon?.code === code) {
      toast.warning('Mã giảm giá này đang được áp dụng rồi!')
      setCouponInput('')
      return
    }

    setIsCouponLoading(true)
    try {
      const rawSubtotal = checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
      const result = await validateCouponApi({
        code,
        orderTotal: rawSubtotal,
        currentUserId: user?.id ?? undefined
      })

      if (result.couponType === 'SHIPPING') {
        setAppliedShippingCoupon(result)
        toast.success('Đã áp dụng mã Miễn phí vận chuyển!')
      } else {
        setAppliedOrderCoupon(result)
        toast.success('Đã áp dụng mã Giảm giá đơn hàng!')
      }

      setCouponInput('')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr?.response?.data?.message ?? 'Mã giảm giá không hợp lệ hoặc đã hết hạn')
    } finally {
      setIsCouponLoading(false)
    }
  }

  const handleRemoveOrderCoupon = () => {
    setAppliedOrderCoupon(null)
    toast.info('Đã gỡ mã giảm giá đơn hàng')
  }

  const handleRemoveShippingCoupon = () => {
    setAppliedShippingCoupon(null)
    toast.info('Đã gỡ mã miễn phí vận chuyển')
  }

  const handleCouponKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleApplyCoupon()
    }
  }

  const onSubmit = async (data: CheckoutForm) => {
    if (!selectedAddress) {
      toast.error('Vui lòng chọn địa chỉ giao hàng')
      return
    }

    try {
      const order = await orderService.create({
        ...data,
        addressId: selectedAddress.id,
        items: checkoutItems.map((i) => ({ bookId: i.id, quantity: i.quantity })),
        orderCouponCode: appliedOrderCoupon?.code,
        shippingCouponCode: appliedShippingCoupon?.code
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
        toast.loading('Đang chuyển hướng sang VNPAY...')

        const res = await api.get(`/payment/create-url/${order.id}`)

        if (res.data && res.data.url) {
          window.location.href = res.data.url
        } else {
          throw new Error('Không lấy được URL thanh toán')
        }
      } else {
        toast.success(`Đặt hàng thành công! Mã đơn: ${order.orderCode}`)
        navigate(`/orders/success/${order.id}`)
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
      toast.success('Thêm địa chỉ thành công!')
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setIsAddressDialogOpen(false)
    } catch {
      toast.error('Thêm địa chỉ thất bại')
    }
  }

  const handlePhoneUpdated = async (newPhone: string) => {
    setValue('customerPhone', newPhone, { shouldValidate: true })

    if (authContext?.updateUser) {
      await authContext.updateUser({ ...user, phone: newPhone })
    } else if (authContext?.isLoading === false && authContext?.user) {
      // @ts-expect-error: context bi thieu type setUser
      authContext.setUser({ ...user, phone: newPhone })
    }
  }

  if (checkoutItems.length === 0) return null

  const fallbackSubtotal = checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <main className='min-h-screen bg-[#f3f4f6]'>
      <div className='max-w-6xl mx-auto px-4 py-6 md:py-10'>
        <div className='flex items-center gap-3 mb-6 md:mb-8'>
          <button
            type='button'
            className='flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-colors'
            onClick={() => navigate('/cart')}
          >
            <ArrowLeft className='w-5 h-5' />
            <h1 className='text-lg font-medium'>Quay về giỏ hàng</h1>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8'>
            <div className='lg:col-span-7 space-y-6'>
              <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-5 md:p-6'>
                <h2 className='font-bold text-zinc-900 mb-4 text-lg'>Thông tin khách hàng</h2>
                <div className='grid grid-cols-1 gap-4'>
                  <div className='space-y-1.5'>
                    <Input
                      placeholder='Họ và tên người nhận (bắt buộc)'
                      className='h-11 rounded-md border-gray-300 focus-visible:ring-brand-green/30 focus-visible:border-brand-green'
                      {...register('customerName')}
                    />
                    {errors.customerName && (
                      <p className='text-red-500 text-xs'>{errors.customerName.message}</p>
                    )}
                  </div>
                  <div className='space-y-1.5'>
                    <div className='flex items-center justify-between p-3 rounded-md border border-gray-200 bg-gray-50/50'>
                      <div className='flex items-center gap-3'>
                        <Phone className='w-5 h-5 text-gray-500' />
                        {currentPhone ? (
                          <span className='font-medium text-zinc-900'>{currentPhone}</span>
                        ) : (
                          <span className='text-gray-500 italic text-sm'>
                            Chưa có số điện thoại
                          </span>
                        )}
                      </div>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => setIsPhoneModalOpen(true)}
                        className='h-8 px-3 text-brand-green border-brand-green/20 hover:bg-brand-green/10'
                      >
                        {currentPhone ? 'Thay đổi' : 'Thêm số điện thoại'}
                      </Button>
                    </div>
                    <input type='hidden' {...register('customerPhone')} />
                    {errors.customerPhone && (
                      <p className='text-red-500 text-xs'>{errors.customerPhone.message}</p>
                    )}
                  </div>
                  <div className='space-y-1.5'>
                    <Input
                      type='email'
                      readOnly
                      placeholder='Email'
                      className='h-11 rounded-md border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed focus-visible:ring-0'
                      {...register('customerEmail')}
                    />
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-5 md:p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='font-bold text-zinc-900 text-lg'>Địa chỉ nhận hàng</h2>
                  {addresses && addresses.length > 0 && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => setIsSelectAddressModalOpen(true)}
                      className='text-brand-green hover:text-brand-green-dark hover:bg-transparent px-0'
                    >
                      Thay đổi địa chỉ
                    </Button>
                  )}
                </div>
                {!addresses || addresses.length === 0 ? (
                  <div className='flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50'>
                    <div className='w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center mb-3'>
                      <MapPin className='w-6 h-6 text-brand-green' />
                    </div>
                    <p className='text-sm text-gray-600 mb-4 text-center'>
                      Bạn chưa thiết lập địa chỉ giao hàng nào.
                      <br />
                      Vui lòng thêm địa chỉ để tiếp tục đặt hàng.
                    </p>
                    <Button
                      type='button'
                      onClick={() => setIsAddressDialogOpen(true)}
                      className='bg-brand-green hover:bg-brand-green-dark'
                    >
                      <Plus className='w-4 h-4 mr-2' /> Thêm địa chỉ mới
                    </Button>
                    <input type='hidden' {...register('shippingAddress')} />
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <div className='p-3 bg-gray-50 border border-brand-green/30 rounded-md relative'>
                      {selectedAddress?.isDefault && (
                        <span className='absolute -top-2.5 right-3 bg-brand-green text-white text-[10px] font-bold px-2 py-0.5 rounded-sm'>
                          Mặc định
                        </span>
                      )}
                      <p className='font-medium text-zinc-900 mb-1'>
                        {selectedAddress?.recipientName || watch('customerName')}
                      </p>
                      <p className='text-sm text-gray-600'>{watch('shippingAddress')}</p>
                    </div>
                    <div className='space-y-1.5'>
                      <Textarea
                        placeholder='Ghi chú thêm (tuỳ chọn)'
                        rows={2}
                        className='resize-none rounded-md border-gray-300 focus-visible:ring-brand-green/30 focus-visible:border-brand-green'
                        {...register('note')}
                      />
                    </div>
                  </div>
                )}
                {errors.shippingAddress && (
                  <p className='text-red-500 text-xs mt-1.5'>{errors.shippingAddress.message}</p>
                )}
              </div>

              <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-5 md:p-6'>
                <h2 className='font-bold text-zinc-900 mb-4 text-lg'>Phương thức thanh toán</h2>
                <div className='grid grid-cols-1 gap-3'>
                  {[
                    {
                      value: 'COD',
                      label: 'Thanh toán khi nhận hàng (COD)',
                      img: 'https://cdn-icons-png.flaticon.com/512/2897/2897818.png'
                    },
                    {
                      value: 'VNPAY',
                      label: 'Thanh toán qua VNPAY',
                      img: 'https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr_logo-vnpay.png'
                    }
                  ].map(({ value, label, img }) => (
                    <label
                      key={value}
                      className={`flex items-center gap-4 p-3.5 rounded-md border cursor-pointer transition-all ${
                        paymentMethod === value
                          ? 'border-brand-green bg-brand-green/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type='radio'
                        value={value}
                        {...register('paymentMethod')}
                        className='hidden'
                      />
                      <div className='w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0'>
                        {paymentMethod === value && (
                          <div className='w-2.5 h-2.5 rounded-full bg-brand-green' />
                        )}
                      </div>
                      <img src={img} alt={value} className='w-8 h-8 object-contain' />
                      <span className='text-sm font-medium'>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className='lg:col-span-5'>
              <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-5 md:p-6 sticky top-24'>
                <h2 className='font-bold text-zinc-900 mb-5 text-lg'>
                  Đơn hàng ({checkoutItems.length} sản phẩm)
                </h2>

                <div className='space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar'>
                  {checkoutItems.map((item) => (
                    <div key={item.id} className='flex gap-4 items-start'>
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className='w-14 h-14 object-cover rounded-md shrink-0 border border-gray-100'
                      />
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-zinc-900 line-clamp-2 leading-snug'>
                          {item.title}
                        </p>
                        <div className='flex items-center justify-between mt-1'>
                          <p className='text-sm font-bold text-brand-green'>
                            {formatVND(item.price)}
                          </p>
                          <p className='text-xs text-gray-500 font-medium'>SL: {item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className='my-5' />

                <div className='mb-5 space-y-3'>
                  <Label className='flex items-center gap-2 text-sm font-semibold text-zinc-800'>
                    <Ticket className='w-4 h-4' /> Mã giảm giá / Freeship
                  </Label>

                  <div className='flex gap-2'>
                    <Input
                      placeholder='Nhập mã tại đây...'
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={handleCouponKeyDown}
                      disabled={isCouponLoading}
                      className='h-10 rounded-md uppercase tracking-widest flex-1'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      onClick={handleApplyCoupon}
                      disabled={isCouponLoading || !couponInput.trim()}
                      className='h-10 px-4 shrink-0'
                    >
                      {isCouponLoading ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Áp dụng'}
                    </Button>
                  </div>

                  {appliedOrderCoupon && (
                    <div className='flex items-center justify-between px-3 py-2.5 rounded-md bg-orange-50 border border-orange-200 mt-2'>
                      <div className='flex items-center gap-2 min-w-0'>
                        <Percent className='w-4 h-4 text-orange-500 shrink-0' />
                        <div className='min-w-0'>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm font-bold text-orange-600 tracking-wide'>
                              {appliedOrderCoupon.code}
                            </span>
                          </div>
                          <p className='text-[11px] text-orange-600/80 mt-0.5 truncate'>
                            Giảm giá đơn hàng
                          </p>
                        </div>
                      </div>
                      <button
                        type='button'
                        onClick={handleRemoveOrderCoupon}
                        className='ml-2 p-1 rounded-full hover:bg-orange-100 text-orange-400 hover:text-orange-600 transition-colors shrink-0'
                      >
                        <X className='w-4 h-4' />
                      </button>
                    </div>
                  )}

                  {appliedShippingCoupon && (
                    <div className='flex items-center justify-between px-3 py-2.5 rounded-md bg-blue-50 border border-blue-200 mt-2'>
                      <div className='flex items-center gap-2 min-w-0'>
                        <Truck className='w-4 h-4 text-blue-500 shrink-0' />
                        <div className='min-w-0'>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm font-bold text-blue-600 tracking-wide'>
                              {appliedShippingCoupon.code}
                            </span>
                          </div>
                          <p className='text-[11px] text-blue-600/80 mt-0.5 truncate'>
                            Miễn phí vận chuyển
                          </p>
                        </div>
                      </div>
                      <button
                        type='button'
                        onClick={handleRemoveShippingCoupon}
                        className='ml-2 p-1 rounded-full hover:bg-blue-100 text-blue-400 hover:text-blue-600 transition-colors shrink-0'
                      >
                        <X className='w-4 h-4' />
                      </button>
                    </div>
                  )}
                </div>

                <Separator className='my-5' />

                <div className='space-y-3 text-sm text-gray-600 mb-5'>
                  <div className='flex justify-between'>
                    <span>Tạm tính (Tiền sách)</span>
                    <span className='text-zinc-900 font-medium'>
                      {formatVND(shippingData?.rawOrderTotal ?? fallbackSubtotal)}
                    </span>
                  </div>

                  <div className='flex justify-between'>
                    <span>Phí vận chuyển (GHN)</span>
                    <span className='text-zinc-900 font-medium'>
                      {isCalculating ? (
                        <Loader2 className='w-4 h-4 animate-spin' />
                      ) : shippingData ? (
                        formatVND(shippingData.baseShippingFee)
                      ) : (
                        <span className='text-gray-400'>---</span>
                      )}
                    </span>
                  </div>

                  {(shippingData?.orderDiscount || 0) > 0 && (
                    <div className='flex justify-between text-orange-600'>
                      <span className='flex items-center gap-1.5'>
                        <Percent className='w-3.5 h-3.5' /> Giảm giá Shop
                      </span>
                      <span className='font-semibold'>
                        - {formatVND(shippingData!.orderDiscount)}
                      </span>
                    </div>
                  )}

                  {(shippingData?.shippingDiscount || 0) > 0 && (
                    <div className='flex justify-between text-blue-600'>
                      <span className='flex items-center gap-1.5'>
                        <Truck className='w-3.5 h-3.5' /> Miễn phí vận chuyển
                      </span>
                      <span className='font-semibold'>
                        - {formatVND(shippingData!.shippingDiscount)}
                      </span>
                    </div>
                  )}
                </div>

                <Separator className='my-5' />

                <div className='flex justify-between items-center mb-6'>
                  <span className='font-bold text-zinc-900'>Tổng thanh toán:</span>
                  <span className='text-2xl font-bold text-brand-green'>
                    {isCalculating ? (
                      <Loader2 className='w-6 h-6 animate-spin' />
                    ) : shippingData ? (
                      formatVND(shippingData.totalPayment)
                    ) : (
                      formatVND(fallbackSubtotal)
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
                  className='w-full h-auto py-3 bg-brand-green hover:bg-brand-green-dark relative overflow-hidden'
                >
                  {isSubmitting || isRedirecting ? (
                    <div className='flex items-center text-white py-2'>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />{' '}
                      {isRedirecting ? 'Đang chuyển hướng VNPAY...' : 'Đang xử lý...'}
                    </div>
                  ) : (
                    <span className='text-sm font-bold text-white uppercase tracking-wide'>
                      Hoàn tất đặt hàng
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>

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
      </div>
    </main>
  )
}
