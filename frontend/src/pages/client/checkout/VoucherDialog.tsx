'use client'

import React, { useEffect, useState } from 'react'
import { Ticket, Truck, Info, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

import { getAllCouponsApi, validateCouponApi } from '@/services/coupon/coupon.api'
import type { CouponResponse } from '@/services/coupon/coupon.type'

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

interface VoucherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subtotal: number
  currentOrderCoupon: CouponResponse | null
  currentShippingCoupon: CouponResponse | null
  onApplyCoupons: (
    orderCoupon: CouponResponse | null,
    shippingCoupon: CouponResponse | null
  ) => void
  categoryIdsInCart?: string[]
}

export default function VoucherDialog({
  open,
  onOpenChange,
  subtotal,
  currentOrderCoupon,
  currentShippingCoupon,
  onApplyCoupons,
  categoryIdsInCart
}: VoucherDialogProps) {
  const [inputCode, setInputCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)

  const [selectedShipping, setSelectedShipping] = useState<CouponResponse | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<CouponResponse | null>(null)

  // Fetch danh sách vouchers
  const { data: allCoupons = [], isLoading: isFetching } = useQuery({
    queryKey: ['coupons-active'],
    queryFn: getAllCouponsApi,
    enabled: open // Chỉ fetch khi mở dialog
  })

  // Đồng bộ state khi mở lại Dialog
  useEffect(() => {
    if (open) {
      setSelectedShipping(currentShippingCoupon)
      setSelectedOrder(currentOrderCoupon)
      setInputCode('')
    }
  }, [open, currentShippingCoupon, currentOrderCoupon])

  // Lọc voucher đang hoạt động
  const shippingVouchers = allCoupons.filter(
    (v) => v.couponType === 'SHIPPING' && v.status === 'ACTIVE'
  )
  const orderVouchers = allCoupons.filter((v) => v.couponType === 'ORDER' && v.status === 'ACTIVE')

  // Hàm xử lý chọn/bỏ chọn voucher
  const handleSelect = async (voucher: CouponResponse) => {
    // Nếu click lại mã đang chọn -> Bỏ chọn
    if (voucher.couponType === 'SHIPPING' && selectedShipping?.id === voucher.id) {
      setSelectedShipping(null)
      return
    }
    if (voucher.couponType === 'ORDER' && selectedOrder?.id === voucher.id) {
      setSelectedOrder(null)
      return
    }

    // UX: Chặn bấm gọi API nếu chưa đạt giá trị tối thiểu
    if (subtotal < voucher.minOrderValue) {
      toast.error(`Đơn hàng chưa đạt tối thiểu ${formatVND(voucher.minOrderValue)} để dùng mã này.`)
      return
    }

    setIsValidating(true)
    try {
      const validCoupon = await validateCouponApi({
        code: voucher.code,
        orderTotal: subtotal,
        couponType: voucher.couponType,
        categoryIdsInCart
      })

      if (voucher.couponType === 'SHIPPING') {
        setSelectedShipping(validCoupon)
      } else {
        setSelectedOrder(validCoupon)
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr?.response?.data?.message ?? 'Mã không hợp lệ hoặc không đủ điều kiện!')
    } finally {
      setIsValidating(false)
    }
  }

  // Hàm xử lý khi người dùng nhập tay mã giảm giá
  const handleApplyInputCode = async () => {
    if (!inputCode.trim()) return

    // Tìm mã trong danh sách fetch được để biết CouponType
    const found = allCoupons.find((c) => c.code.toUpperCase() === inputCode.toUpperCase().trim())

    if (!found) {
      toast.error('Mã giảm giá không tồn tại hoặc đã hết hạn!')
      return
    }

    await handleSelect(found)
    setInputCode('')
  }

  // Xác nhận & Gửi lên component cha
  const handleConfirm = () => {
    onApplyCoupons(selectedOrder, selectedShipping)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[480px] p-0 gap-0 overflow-hidden bg-muted/30'>
        <DialogHeader className='p-4 border-b bg-background'>
          <DialogTitle className='text-lg font-bold text-zinc-900'>
            Chọn ZenBook Voucher
          </DialogTitle>
        </DialogHeader>

        {/* --- Ô nhập mã --- */}
        <div className='p-4 bg-background flex items-center gap-3 border-b shadow-sm z-10 relative'>
          <span className='text-sm font-medium text-muted-foreground shrink-0 whitespace-nowrap'>
            Mã Voucher
          </span>
          <Input
            placeholder='Nhập mã giảm giá...'
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className='uppercase bg-muted/50 focus-visible:ring-brand-green'
            onKeyDown={(e) => e.key === 'Enter' && handleApplyInputCode()}
          />
          <Button
            disabled={!inputCode || isValidating}
            onClick={handleApplyInputCode}
            className='bg-brand-green hover:bg-brand-green-dark disabled:bg-muted'
          >
            {isValidating ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Áp dụng'}
          </Button>
        </div>

        {/* --- Danh sách Voucher --- */}
        <ScrollArea className='max-h-[50vh] p-4 bg-gray-50'>
          {isFetching ? (
            <div className='flex flex-col items-center justify-center py-10 text-muted-foreground'>
              <Loader2 className='w-8 h-8 animate-spin mb-2 text-brand-green' />
              <p className='text-sm'>Đang tải danh sách mã...</p>
            </div>
          ) : (
            <>
              {/* Nhóm Freeship */}
              {shippingVouchers.length > 0 && (
                <div className='mb-6'>
                  <h3 className='text-sm font-medium text-zinc-700 mb-3 flex items-center gap-2'>
                    Mã Miễn Phí Vận Chuyển
                    <span className='text-[10px] font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full'>
                      Chọn 1 mã
                    </span>
                  </h3>
                  <div className='space-y-3'>
                    {shippingVouchers.map((voucher) => (
                      <VoucherCard
                        key={voucher.id}
                        voucher={voucher}
                        subtotal={subtotal}
                        isSelected={selectedShipping?.id === voucher.id}
                        onSelect={() => handleSelect(voucher)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Nhóm Giảm giá Đơn Hàng */}
              {orderVouchers.length > 0 && (
                <div>
                  <h3 className='text-sm font-medium text-zinc-700 mb-3 flex items-center gap-2'>
                    Mã Giảm Giá
                    <span className='text-[10px] font-normal bg-brand-green/20 text-brand-green-dark px-2 py-0.5 rounded-full'>
                      Chọn 1 mã
                    </span>
                  </h3>
                  <div className='space-y-3'>
                    {orderVouchers.map((voucher) => (
                      <VoucherCard
                        key={voucher.id}
                        voucher={voucher}
                        subtotal={subtotal}
                        isSelected={selectedOrder?.id === voucher.id}
                        onSelect={() => handleSelect(voucher)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {shippingVouchers.length === 0 && orderVouchers.length === 0 && (
                <div className='text-center py-8 text-gray-500 text-sm'>
                  Hiện chưa có mã giảm giá nào.
                </div>
              )}
            </>
          )}
        </ScrollArea>

        {/* --- Footer Xác nhận --- */}
        <DialogFooter className='p-4 border-t bg-background shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]'>
          <div className='w-full flex items-center justify-between'>
            <div className='text-sm text-muted-foreground'>
              Đã chọn:{' '}
              <span className='font-bold text-brand-green text-base'>
                {[selectedShipping, selectedOrder].filter(Boolean).length}
              </span>{' '}
              mã
            </div>
            <div className='flex gap-3'>
              <Button variant='outline' onClick={() => onOpenChange(false)}>
                Trở lại
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isValidating}
                className='bg-brand-green hover:bg-brand-green-dark text-white min-w-[120px]'
              >
                Đồng ý
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// --- COMPONENT THẺ VOUCHER (UI RĂNG CƯA) ---
function VoucherCard({
  voucher,
  isSelected,
  subtotal,
  onSelect
}: {
  voucher: CouponResponse
  isSelected: boolean
  subtotal: number
  onSelect: () => void
}) {
  const isShipping = voucher.couponType === 'SHIPPING'
  const isEligible = subtotal >= voucher.minOrderValue

  // Xanh dương cho Freeship, Xanh lá cho Đơn hàng
  const colorClass = isShipping ? 'bg-blue-500' : 'bg-brand-green'
  const selectedBorderClass = isShipping
    ? 'border-blue-500 ring-blue-500/50'
    : 'border-brand-green ring-brand-green/50'
  const checkboxColorClass = isShipping
    ? 'bg-blue-500 border-blue-500'
    : 'bg-brand-green border-brand-green'

  // Render Description
  let discountLabel = ''
  if (voucher.discountType === 'PERCENTAGE') {
    discountLabel = `Giảm ${voucher.discountValue}%`
    if (voucher.maxDiscountAmount) {
      discountLabel += ` (Tối đa ${formatVND(voucher.maxDiscountAmount)})`
    }
  } else {
    discountLabel = `Giảm ${formatVND(voucher.discountValue)}`
  }

  return (
    <div
      onClick={() => isEligible && onSelect()}
      className={`relative flex h-[116px] rounded-lg overflow-hidden border shadow-sm transition-all
        ${!isEligible ? 'opacity-50 bg-gray-100 grayscale-[0.5] cursor-not-allowed' : 'cursor-pointer hover:border-gray-400 bg-white'}
        ${isSelected ? `${selectedBorderClass} ring-1` : 'border-border'}
      `}
    >
      {/* Cột trái (Màu nhận diện + Icon) */}
      <div
        className={`w-[110px] shrink-0 ${colorClass} flex flex-col items-center justify-center text-white p-2 relative`}
      >
        {isShipping ? <Truck className='h-8 w-8 mb-1' /> : <Ticket className='h-8 w-8 mb-1' />}
        <span className='text-[11px] text-center font-bold leading-tight'>
          ZenBook
          <br />
          {isShipping ? 'Freeship' : 'Voucher'}
        </span>

        {/* Răng cưa giả lập bằng viền đứt */}
        <div className='absolute top-0 -right-[1px] h-full w-[2px] border-l-[4px] border-dotted border-white/90 mix-blend-screen'></div>
      </div>

      {/* Cột phải (Thông tin) */}
      <div className='flex-1 p-3 pl-4 flex flex-col justify-between min-w-0'>
        <div className='flex justify-between items-start gap-2'>
          <div className='min-w-0 flex-1'>
            <h4 className='text-sm font-bold text-zinc-900 truncate'>{voucher.code}</h4>
            <p className='text-xs text-gray-600 mt-1 font-medium truncate'>{discountLabel}</p>
            <p className='text-[11px] text-gray-500 mt-0.5'>
              Đơn Tối Thiểu {formatVND(voucher.minOrderValue)}
            </p>
          </div>

          <button
            className='text-gray-400 hover:text-gray-600 shrink-0'
            onClick={(e) => e.stopPropagation()}
          >
            <Info className='h-4 w-4' />
          </button>
        </div>

        <div className='flex justify-between items-end mt-2'>
          <div className='flex flex-col'>
            {/* Thanh tiến trình / Thông báo */}
            {!isEligible && (
              <span className='text-[10px] font-medium text-rose-500 mb-0.5'>
                Mua thêm {formatVND(voucher.minOrderValue - subtotal)} để áp dụng
              </span>
            )}
            <span className='text-[10px] text-gray-500'>
              HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
            </span>
          </div>

          {/* Custom Checkbox */}
          <div className='shrink-0 ml-2'>
            <div
              className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-colors
              ${isSelected ? `${checkboxColorClass} text-white` : 'border-gray-300 bg-transparent'}
              ${!isEligible ? 'bg-gray-200 border-gray-300' : ''}
            `}
            >
              {isSelected && <Check className='h-3 w-3 stroke-[3]' />}
            </div>
          </div>
        </div>
      </div>

      {/* Ribbon "Số lượng có hạn" nếu sắp hết */}
      {isEligible && voucher.usageLimit && voucher.usageLimit - voucher.usedCount < 10 && (
        <div className='absolute top-0 left-0'>
          <div className='bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-br-md uppercase tracking-wider'>
            Sắp hết
          </div>
        </div>
      )}
    </div>
  )
}
