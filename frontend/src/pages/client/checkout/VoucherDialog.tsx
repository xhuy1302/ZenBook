'use client'

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Ticket, Truck, Check, Loader2, Gift } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
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
  currentUserId?: string
}

export default function VoucherSheet({
  open,
  onOpenChange,
  subtotal,
  currentOrderCoupon,
  currentShippingCoupon,
  onApplyCoupons,
  categoryIdsInCart,
  currentUserId
}: VoucherDialogProps) {
  const { t } = useTranslation('checkout')
  const [inputCode, setInputCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)

  const [selectedShipping, setSelectedShipping] = useState<CouponResponse | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<CouponResponse | null>(null)

  const { data: allCoupons = [], isLoading: isFetching } = useQuery({
    queryKey: ['coupons-active', currentUserId],
    queryFn: () => getAllCouponsApi(currentUserId),
    enabled: open
  })

  const myVisibleCoupons = allCoupons.filter(
    (v) => !v.userId || (currentUserId && v.userId === currentUserId)
  )

  const shippingVouchers = myVisibleCoupons.filter(
    (v) => v.couponType === 'SHIPPING' && v.status === 'ACTIVE'
  )
  const orderVouchers = myVisibleCoupons.filter(
    (v) => (v.couponType === 'ORDER' || v.code.includes('BIRTHDAY')) && v.status === 'ACTIVE'
  )

  useEffect(() => {
    if (open) {
      setSelectedShipping(currentShippingCoupon)
      setSelectedOrder(currentOrderCoupon)
      setInputCode('')
    }
  }, [open, currentShippingCoupon, currentOrderCoupon])

  const handleSelect = async (voucher: CouponResponse) => {
    if (voucher.couponType === 'SHIPPING' && selectedShipping?.id === voucher.id) {
      setSelectedShipping(null)
      return
    }
    if (
      (voucher.couponType === 'ORDER' || voucher.code.includes('BIRTHDAY')) &&
      selectedOrder?.id === voucher.id
    ) {
      setSelectedOrder(null)
      return
    }
    if (subtotal < voucher.minOrderValue) {
      toast.error(`Đơn hàng chưa đạt tối thiểu ${formatVND(voucher.minOrderValue)}`)
      return
    }
    setIsValidating(true)
    try {
      const validCoupon = await validateCouponApi({
        code: voucher.code,
        orderTotal: subtotal,
        couponType: voucher.couponType,
        categoryIdsInCart,
        currentUserId
      })
      if (voucher.couponType === 'SHIPPING') setSelectedShipping(validCoupon)
      else setSelectedOrder(validCoupon)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Mã không hợp lệ hoặc đã hết hạn!'
      toast.error(message)
    } finally {
      setIsValidating(false)
    }
  }

  const handleApplyInputCode = async () => {
    if (!inputCode.trim()) return
    const found = myVisibleCoupons.find(
      (c) => c.code.toUpperCase() === inputCode.toUpperCase().trim()
    )
    if (!found) {
      toast.error(t('toast.couponInvalid'))
      return
    }
    await handleSelect(found)
    setInputCode('')
  }

  const handleConfirm = () => {
    onApplyCoupons(selectedOrder, selectedShipping)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Thêm h-full để đảm bảo chiều cao cố định cho việc cuộn */}
      <SheetContent
        side='left'
        className='w-full sm:max-w-[420px] p-0 flex flex-col bg-slate-50 h-full'
      >
        <SheetHeader className='p-4 border-b bg-white shadow-sm shrink-0'>
          <SheetTitle className='text-lg font-bold text-zinc-900'>
            {t('voucher.sheetTitle')}
          </SheetTitle>
        </SheetHeader>

        <div className='p-4 bg-white flex items-center gap-2 border-b shrink-0'>
          <Input
            placeholder={t('voucher.inputPlaceholder')}
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className='uppercase bg-slate-50 focus-visible:ring-brand-green h-10 text-[13px]'
            onKeyDown={(e) => e.key === 'Enter' && handleApplyInputCode()}
          />
          <Button
            disabled={!inputCode || isValidating}
            onClick={handleApplyInputCode}
            className='bg-brand-green hover:bg-brand-green-dark h-10 px-5 text-[13px]'
          >
            {isValidating ? <Loader2 className='w-4 h-4 animate-spin' /> : t('voucher.apply')}
          </Button>
        </div>

        {/* ScrollArea flex-1 sẽ tự động chiếm không gian còn lại */}
        <ScrollArea className='flex-1 w-full'>
          <div className='p-4 space-y-6 pb-10'>
            {isFetching ? (
              <div className='flex flex-col items-center justify-center py-12'>
                <Loader2 className='w-8 h-8 animate-spin mb-3 text-brand-green' />
                <p className='text-[13px] text-gray-500'>{t('voucher.loading')}</p>
              </div>
            ) : (
              <>
                {shippingVouchers.length > 0 && (
                  <div>
                    <h3 className='text-[13px] font-bold text-zinc-700 mb-3 flex items-center gap-2'>
                      <Truck className='w-4 h-4' /> {t('voucher.freeShipping')}
                    </h3>
                    <div className='grid gap-3'>
                      {shippingVouchers.map((v) => (
                        <VoucherCard
                          key={v.id}
                          voucher={v}
                          subtotal={subtotal}
                          isSelected={selectedShipping?.id === v.id}
                          onSelect={() => handleSelect(v)}
                          t={t}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {orderVouchers.length > 0 && (
                  <div>
                    <h3 className='text-[13px] font-bold text-zinc-700 mb-3 flex items-center gap-2'>
                      <Ticket className='w-4 h-4' /> {t('voucher.orderDiscount')}
                    </h3>
                    <div className='grid gap-3'>
                      {orderVouchers.map((v) => (
                        <VoucherCard
                          key={v.id}
                          voucher={v}
                          subtotal={subtotal}
                          isSelected={selectedOrder?.id === v.id}
                          onSelect={() => handleSelect(v)}
                          t={t}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {myVisibleCoupons.length === 0 && (
                  <div className='text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400'>
                    <Gift className='w-8 h-8 mx-auto mb-2 opacity-20' />
                    <p className='text-[13px]'>{t('voucher.noVoucher')}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className='p-4 border-t bg-white shrink-0'>
          <div className='w-full flex flex-col gap-3'>
            <p className='text-[12px] text-gray-500 text-center'>{t('voucher.maxSelection')}</p>
            <div className='flex gap-2'>
              <Button variant='outline' className='flex-1 h-11' onClick={() => onOpenChange(false)}>
                {t('voucher.cancel')}
              </Button>
              <Button
                onClick={handleConfirm}
                className='bg-brand-green hover:bg-brand-green-dark flex-1 h-11 text-white font-bold'
              >
                {t('voucher.confirm')}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function VoucherCard({
  voucher,
  isSelected,
  subtotal,
  onSelect,
  t
}: {
  voucher: CouponResponse
  isSelected: boolean
  subtotal: number
  onSelect: () => void
  t: any
}) {
  const isEligible = subtotal >= voucher.minOrderValue
  const isBirthday = voucher.code.includes('BDAY')
  const isRedeemed = !!voucher.userId && !isBirthday
  const missingAmount = voucher.minOrderValue - subtotal
  const expiryDate = new Date(voucher.endDate).toLocaleDateString('vi-VN')

  return (
    <div
      onClick={() => isEligible && onSelect()}
      className={cn(
        'relative flex min-h-[100px] rounded-lg overflow-hidden border transition-all cursor-pointer bg-white shadow-sm',
        isSelected
          ? 'border-brand-green ring-1 ring-brand-green bg-brand-green/5'
          : 'border-slate-200 hover:border-slate-300',
        !isEligible && 'opacity-60 grayscale-[0.5] cursor-not-allowed'
      )}
    >
      {/* Left side label */}
      <div
        className={cn(
          'w-24 flex-shrink-0 flex flex-col items-center justify-center text-white relative px-2 text-center',
          voucher.couponType === 'SHIPPING' ? 'bg-sky-500' : 'bg-brand-green'
        )}
      >
        {voucher.couponType === 'SHIPPING' ? (
          <Truck className='h-7 w-7' />
        ) : (
          <Ticket className='h-7 w-7' />
        )}
        <p className='text-[10px] font-bold mt-1 uppercase'>ZENBOOK</p>
        {/* Đường răng cưa giả */}
        <div className='absolute top-0 right-0 h-full w-[4px] bg-[radial-gradient(circle_at_center,_#f8fafc_2px,_transparent_0)] bg-[length:4px_8px] z-10' />
      </div>

      {/* Right side content */}
      <div className='flex-1 p-3 flex flex-col justify-between min-w-0'>
        <div>
          <div className='flex justify-between items-start'>
            <div className='min-w-0 flex-1'>
              <h4 className='text-[14px] font-bold text-slate-900 truncate mb-1'>{voucher.code}</h4>
              <p className='text-[13px] font-bold text-brand-green-dark'>
                {t('voucher.discount')}{' '}
                {voucher.discountType === 'PERCENTAGE'
                  ? `${voucher.discountValue}%`
                  : formatVND(voucher.discountValue)}
              </p>
            </div>
            <div
              className={cn(
                'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1',
                isSelected ? 'bg-brand-green border-brand-green text-white' : 'border-slate-300'
              )}
            >
              {isSelected && <Check className='h-3 w-3 stroke-[3]' />}
            </div>
          </div>

          <p className='text-[11px] text-slate-500 mt-1'>
            {t('voucher.minOrder')} {formatVND(voucher.minOrderValue)}
          </p>
        </div>

        <div className='mt-2 pt-2 border-t border-dashed border-slate-100 flex justify-between items-center'>
          {/* Fix hiển thị ngày: Nếu t() lỗi placeholder, ta dùng text trực tiếp */}
          <p className='text-[10px] text-slate-400 font-medium'>HSD: {expiryDate}</p>

          {!isEligible && (
            <span className='text-[10px] text-rose-500 font-bold bg-rose-50 px-1.5 py-0.5 rounded'>
              Thiếu {formatVND(missingAmount)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
