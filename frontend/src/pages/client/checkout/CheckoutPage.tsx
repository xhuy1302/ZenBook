// CheckoutPage.tsx
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, ArrowLeft, MapPin, Plus, ChevronRight, ReceiptText, X, Mail } from 'lucide-react'
import { api } from '@/utils/axiosCustomize'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
// Import VoucherDialog đã hoàn thiện
import VoucherDialog from '@/pages/client/checkout/VoucherDialog'

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
  const [isVoucherDialogOpen, setIsVoucherDialogOpen] = useState(false)

  const [checkoutItems, setCheckoutItems] = useState<CartItemType[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)

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

  // --- Handlers cho Voucher Dialog ---
  const applyCouponsFromDialog = (
    orderCoupon: CouponResponse | null,
    shippingCoupon: CouponResponse | null
  ) => {
    setAppliedOrderCoupon(orderCoupon)
    setAppliedShippingCoupon(shippingCoupon)
    if (orderCoupon || shippingCoupon) {
      toast.success('Đã áp dụng mã giảm giá')
    }
  }

  const removeOrderCoupon = (e: React.MouseEvent) => {
    e.stopPropagation()
    setAppliedOrderCoupon(null)
    toast.info('Đã gỡ mã giảm giá đơn hàng')
  }

  const removeShippingCoupon = (e: React.MouseEvent) => {
    e.stopPropagation()
    setAppliedShippingCoupon(null)
    toast.info('Đã gỡ mã miễn phí vận chuyển')
  }
  // ------------------------------------

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

        // Mã code voucher
        orderCouponCode: appliedOrderCoupon?.code,
        shippingCouponCode: appliedShippingCoupon?.code,

        // Số tiền giảm giá (Lấy từ kết quả tính toán của shippingData)
        // Dùng ?? 0 để đảm bảo luôn gửi lên số, không gửi null/undefined
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
  const finalTotal = isCalculating ? 0 : shippingData ? shippingData.totalPayment : fallbackSubtotal

  return (
    <main className='min-h-screen bg-[#f5f5f5] pb-32 pt-6'>
      <div className='max-w-6xl mx-auto px-4'>
        {/* Header Back */}
        <div className='flex items-center gap-3 mb-6'>
          <button
            type='button'
            className='flex items-center gap-2 text-brand-green hover:text-brand-green-dark transition-colors'
            onClick={() => navigate('/cart')}
          >
            <ArrowLeft className='w-5 h-5' />
            <h1 className='text-xl font-medium text-zinc-900'>Thanh toán</h1>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {/* BLOCK 1: ĐỊA CHỈ NHẬN HÀNG (Style Shopee) */}
          <div className='bg-white rounded-sm shadow-sm relative overflow-hidden'>
            {/* Viền sọc màu thương hiệu (Zenbook Green) */}
            <div className='h-1 w-full bg-[repeating-linear-gradient(45deg,#10b981,#10b981_33px,transparent_0,transparent_41px,#34d399_0,#34d399_74px,transparent_0,transparent_82px)]' />

            <div className='p-6 md:p-8'>
              <div className='flex items-center gap-2 text-brand-green text-lg font-medium mb-4'>
                <MapPin className='w-5 h-5' />
                <h2>Địa chỉ nhận hàng</h2>
              </div>

              {!addresses || addresses.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50'>
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
                          Mặc định
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
                    THAY ĐỔI
                  </Button>
                </div>
              )}

              {/* Các trường ẩn để Form hoạt động đúng */}
              <input type='hidden' {...register('shippingAddress')} />
              <input type='hidden' {...register('customerName')} />
              <input type='hidden' {...register('customerPhone')} />

              {errors.shippingAddress && (
                <p className='text-red-500 text-xs mt-2'>* {errors.shippingAddress.message}</p>
              )}

              {/* Tích hợp Email siêu gọn gàng */}
              <div className='mt-5 pt-4 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Mail className='w-4 h-4 text-gray-400' />
                  <span>Email nhận thông báo đơn hàng:</span>
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
            {/* Bảng header (Desktop) */}
            <div className='hidden md:grid grid-cols-12 px-6 py-4 border-b border-gray-100 text-gray-500 text-sm'>
              <div className='col-span-6'>Sản phẩm</div>
              <div className='col-span-2 text-center'>Đơn giá</div>
              <div className='col-span-2 text-center'>Số lượng</div>
              <div className='col-span-2 text-right'>Thành tiền</div>
            </div>

            {/* List Item */}
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
                  {/* Mobile hiển thị Giá x SL */}
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

            {/* Lời nhắn & Vận chuyển */}
            <div className='bg-[#fafafa] border-t border-gray-100 grid grid-cols-1 md:grid-cols-2'>
              <div className='p-6 flex items-center gap-4 border-b md:border-b-0 md:border-r border-gray-100'>
                <span className='text-sm text-zinc-900 whitespace-nowrap'>Lời nhắn:</span>
                <Input
                  placeholder='Lưu ý cho người bán...'
                  className='h-10 text-sm bg-white border-gray-300 focus-visible:ring-brand-green'
                  {...register('note')}
                />
              </div>
              <div className='p-6 flex flex-col justify-center gap-2 text-sm'>
                <div className='flex justify-between items-center text-zinc-900'>
                  <span>Đơn vị vận chuyển (GHN):</span>
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
                  <span>Nhận hàng dự kiến sau 2-3 ngày</span>
                  <span>Được đồng kiểm</span>
                </div>
              </div>
            </div>
            {/* Tổng phụ */}
            <div className='px-6 py-4 flex justify-end items-center gap-4 border-t border-gray-100 bg-white'>
              <span className='text-sm text-gray-500'>
                Tổng số tiền ({checkoutItems.length} sản phẩm):
              </span>
              <span className='text-lg font-medium text-brand-green'>
                {formatVND(shippingData?.rawOrderTotal ?? fallbackSubtotal)}
              </span>
            </div>
          </div>

          {/* BLOCK 3: VOUCHER */}
          <div
            className='bg-white px-6 py-5 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-brand-green/50 border border-transparent transition-colors'
            onClick={() => setIsVoucherDialogOpen(true)}
          >
            <div className='flex items-center gap-3 shrink-0'>
              <ReceiptText className='w-6 h-6 text-brand-green' />
              <span className='text-lg text-zinc-900'>ZenBook Voucher</span>
            </div>
            <div className='flex items-center gap-3 w-full md:w-auto justify-end'>
              <div className='flex flex-wrap justify-end gap-2'>
                {appliedOrderCoupon && (
                  <span className='bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs px-2 py-1 rounded-sm font-medium flex items-center gap-1'>
                    -{appliedOrderCoupon.code}
                    <X
                      className='w-3 h-3 hover:text-brand-green-dark cursor-pointer'
                      onClick={removeOrderCoupon}
                    />
                  </span>
                )}
                {appliedShippingCoupon && (
                  <span className='bg-blue-50 text-blue-600 border border-blue-200 text-xs px-2 py-1 rounded-sm font-medium flex items-center gap-1'>
                    Freeship
                    <X
                      className='w-3 h-3 hover:text-blue-800 cursor-pointer'
                      onClick={removeShippingCoupon}
                    />
                  </span>
                )}
              </div>
              <span className='text-blue-600 text-sm font-medium shrink-0'>
                {appliedOrderCoupon || appliedShippingCoupon ? 'Đổi mã' : 'Chọn Voucher'}
              </span>
              <ChevronRight className='w-4 h-4 text-gray-400 shrink-0' />
            </div>
          </div>

          {/* BLOCK 4: PHƯƠNG THỨC THANH TOÁN */}
          <div className='bg-white rounded-sm shadow-sm p-6'>
            <div className='flex flex-col md:flex-row md:items-center gap-6'>
              <h2 className='text-base font-medium text-zinc-900 min-w-[200px]'>
                Phương thức thanh toán
              </h2>
              <div className='flex flex-wrap gap-3'>
                {[
                  { value: 'COD', label: 'Thanh toán khi nhận hàng' },
                  { value: 'VNPAY', label: 'Thanh toán VNPAY' }
                ].map(({ value, label }) => (
                  <label
                    key={value}
                    className={`relative px-4 py-2.5 rounded border cursor-pointer transition-all flex items-center justify-center min-w-[180px]
                        ${
                          paymentMethod === value
                            ? 'border-brand-green text-brand-green bg-brand-green/5'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                  >
                    <input
                      type='radio'
                      value={value}
                      {...register('paymentMethod')}
                      className='hidden'
                    />
                    <span className='text-sm font-medium'>{label}</span>
                    {paymentMethod === value && (
                      <div className='absolute bottom-0 right-0 w-4 h-4 bg-brand-green flex items-center justify-center rounded-tl'>
                        <svg
                          className='w-2.5 h-2.5 text-white'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={3}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* BLOCK 5: CHI TIẾT TỔNG KẾT */}
          <div className='bg-[#fafafa] rounded-sm shadow-sm border-t border-gray-100 p-6 flex flex-col items-end gap-3 text-sm'>
            <div className='flex justify-between w-full md:w-[350px]'>
              <span className='text-gray-500'>Tổng tiền hàng</span>
              <span className='text-zinc-900'>
                {formatVND(shippingData?.rawOrderTotal ?? fallbackSubtotal)}
              </span>
            </div>
            <div className='flex justify-between w-full md:w-[350px]'>
              <span className='text-gray-500'>Phí vận chuyển</span>
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
                <span className='text-gray-500'>Voucher giảm giá</span>
                <span className='text-brand-green'>- {formatVND(shippingData!.orderDiscount)}</span>
              </div>
            )}
            {(shippingData?.shippingDiscount || 0) > 0 && (
              <div className='flex justify-between w-full md:w-[350px]'>
                <span className='text-gray-500'>Voucher Freeship</span>
                <span className='text-brand-green'>
                  - {formatVND(shippingData!.shippingDiscount)}
                </span>
              </div>
            )}
            <div className='flex justify-between w-full md:w-[350px] items-center pt-2'>
              <span className='text-gray-500'>Tổng thanh toán</span>
              <span className='text-2xl font-bold text-brand-green'>
                {isCalculating ? (
                  <Loader2 className='w-6 h-6 animate-spin' />
                ) : (
                  formatVND(finalTotal)
                )}
              </span>
            </div>
          </div>

          {/* STICKY FOOTER ACTION */}
          <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40'>
            <div className='max-w-6xl mx-auto px-4 py-4 flex items-center justify-between md:justify-end gap-6'>
              <div className='flex flex-col md:flex-row md:items-center gap-1 md:gap-4'>
                <span className='text-sm text-gray-600 hidden md:inline'>Tổng thanh toán</span>
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
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' /> Xử lý...
                  </div>
                ) : (
                  'Đặt hàng'
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

        <VoucherDialog
          open={isVoucherDialogOpen}
          onOpenChange={setIsVoucherDialogOpen}
          subtotal={shippingData?.rawOrderTotal ?? fallbackSubtotal}
          currentOrderCoupon={appliedOrderCoupon}
          currentShippingCoupon={appliedShippingCoupon}
          onApplyCoupons={applyCouponsFromDialog}
        />
      </div>
    </main>
  )
}
