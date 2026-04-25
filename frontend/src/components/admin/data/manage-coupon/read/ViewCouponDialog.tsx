'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import type { CouponResponse } from '@/services/coupon/coupon.type'
import { CouponStatusBadge } from '../../manage-coupon/CouponStatusBadge'
import { DiscountTypeBadge } from '../../manage-coupon/DiscountTypeBadge'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Ticket, Settings2, CalendarDays, Truck, Percent } from 'lucide-react'

interface ViewCouponDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coupon: CouponResponse
}

export function ViewCouponDialog({ open, onOpenChange, coupon }: ViewCouponDialogProps) {
  const { t } = useTranslation('coupon')

  const readOnlyInputClass =
    'bg-muted/30 border-dashed focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-border cursor-default h-11'

  const formatCurrency = (value?: number | null) => {
    if (value === null || value === undefined) return t('common.na', 'Không giới hạn')
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const isShipping = coupon.couponType === 'SHIPPING'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[850px] p-0 overflow-hidden flex flex-col max-h-[90vh]'>
        <DialogHeader className='px-6 pt-6 pb-4 border-b bg-slate-50/50 shrink-0'>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-xl font-bold tracking-tight text-slate-800'>
              {t('dialog.viewTitle', 'Chi tiết Mã giảm giá')}
            </DialogTitle>
            <div className='flex gap-2'>
              <DiscountTypeBadge type={coupon.discountType} />
              <CouponStatusBadge status={coupon.status} />
            </div>
          </div>
        </DialogHeader>

        {/* CHIA 2 CỘT CHO MÀN HÌNH LỚN */}
        <div className='flex-1 overflow-y-auto p-6 custom-scrollbar'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* CỘT TRÁI: THÔNG TIN CHUNG */}
            <div className='space-y-6'>
              <section className='space-y-4'>
                <div className='flex items-center gap-2 text-brand-green font-semibold'>
                  <Ticket className='w-5 h-5' />
                  <span>{t('form.section1', '1. Thông tin cấu hình')}</span>
                </div>

                <div className='p-5 border rounded-lg bg-white space-y-5 shadow-sm'>
                  {/* Mã Code nổi bật */}
                  <div className='space-y-2'>
                    <Label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                      {t('form.code', 'Mã Code')}
                    </Label>
                    <div className='px-4 py-3 bg-brand-green/10 border border-brand-green/20 rounded-md text-center'>
                      <span className='font-mono text-2xl font-extrabold text-brand-green tracking-[0.2em]'>
                        {coupon.code}
                      </span>
                    </div>
                  </div>

                  <Separator className='border-dashed' />

                  <div className='space-y-2'>
                    <Label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                      Loại ưu đãi
                    </Label>
                    <div
                      className={`flex items-center gap-3 p-3 rounded-md border ${isShipping ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-orange-50 border-orange-100 text-orange-700'}`}
                    >
                      {isShipping ? <Truck className='w-5 h-5' /> : <Percent className='w-5 h-5' />}
                      <span className='font-semibold text-sm'>
                        {isShipping
                          ? 'Giảm phí vận chuyển (Freeship)'
                          : 'Giảm đơn hàng (Tiền sách)'}
                      </span>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                        {t('form.discountValue', 'Mức giảm')}
                      </Label>
                      <Input
                        value={
                          coupon.discountType === 'PERCENTAGE'
                            ? `${coupon.discountValue}%`
                            : formatCurrency(coupon.discountValue)
                        }
                        readOnly
                        className={`${readOnlyInputClass} font-bold text-emerald-600 text-base`}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                        {t('form.maxDiscount', 'Giảm tối đa')}
                      </Label>
                      <Input
                        value={
                          coupon.discountType === 'PERCENTAGE'
                            ? formatCurrency(coupon.maxDiscountAmount)
                            : 'Không áp dụng'
                        }
                        readOnly
                        className={`${readOnlyInputClass} font-medium ${coupon.discountType !== 'PERCENTAGE' ? 'text-muted-foreground italic' : 'text-slate-700'}`}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* CỘT PHẢI: ĐIỀU KIỆN & THỜI GIAN */}
            <div className='space-y-6'>
              {/* Điều kiện */}
              <section className='space-y-4'>
                <div className='flex items-center gap-2 text-brand-green font-semibold'>
                  <Settings2 className='w-5 h-5' />
                  <span>{t('form.section2', '2. Điều kiện & Hạn mức')}</span>
                </div>

                <div className='p-5 border rounded-lg bg-white space-y-4 shadow-sm'>
                  <div className='space-y-2'>
                    <Label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                      {t('form.minOrder', 'Đơn tối thiểu')}
                    </Label>
                    <Input
                      value={formatCurrency(coupon.minOrderValue)}
                      readOnly
                      className={`${readOnlyInputClass} font-medium text-slate-700`}
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                        {t('form.maxUsagePerUser', 'Giới hạn / User')}
                      </Label>
                      <Input
                        value={`${coupon.maxUsagePerUser} lần/người`}
                        readOnly
                        className={`${readOnlyInputClass} font-medium text-slate-700`}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                        {t('form.usageLimit', 'Lượt dùng hệ thống')}
                      </Label>
                      <div
                        className={`flex items-center justify-between px-3 border rounded-md h-11 ${readOnlyInputClass}`}
                      >
                        <span className='font-bold text-slate-700'>{coupon.usedCount}</span>
                        <span className='text-muted-foreground text-xs'>
                          / {coupon.usageLimit ? coupon.usageLimit : '∞'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Thời gian */}
              <section className='space-y-4'>
                <div className='flex items-center gap-2 text-brand-green font-semibold'>
                  <CalendarDays className='w-5 h-5' />
                  <span>{t('form.section3', '3. Thời gian hiệu lực')}</span>
                </div>

                <div className='p-5 border rounded-lg bg-white grid grid-cols-2 gap-4 shadow-sm'>
                  <div className='space-y-2'>
                    <Label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                      {t('form.startDate', 'Bắt đầu')}
                    </Label>
                    <Input
                      value={format(new Date(coupon.startDate), 'dd/MM/yyyy HH:mm')}
                      readOnly
                      className={`${readOnlyInputClass} text-sm font-medium text-slate-700`}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                      {t('form.endDate', 'Kết thúc')}
                    </Label>
                    <Input
                      value={format(new Date(coupon.endDate), 'dd/MM/yyyy HH:mm')}
                      readOnly
                      className={`${readOnlyInputClass} text-sm font-bold text-destructive bg-red-50/30 border-red-100`}
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
