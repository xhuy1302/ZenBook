'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { CouponResponse } from '@/services/coupon/coupon.type'
import { CouponStatusBadge } from '../../manage-coupon/CouponStatusBadge'
import { DiscountTypeBadge } from '../../manage-coupon/DiscountTypeBadge'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'

export function ViewCouponDialog({
  open,
  onOpenChange,
  coupon
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  coupon: CouponResponse
}) {
  const { t } = useTranslation('coupon')

  const readOnlyInputClass =
    'bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-border cursor-default'

  const formatCurrency = (value?: number | null) => {
    if (value === null || value === undefined) return t('common.na')
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>{t('dialog.viewTitle', 'Chi tiết mã giảm giá')}</DialogTitle>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto pr-2 space-y-6 pb-4 custom-scrollbar'>
          {/* KHU VỰC 1: THÔNG TIN CHUNG */}
          <div className='border rounded-lg p-4 space-y-4 bg-card'>
            <div className='flex items-center justify-between border-b pb-3'>
              <h3 className='font-semibold text-sm text-muted-foreground'>
                {t('form.section1', '1. Thông tin chung')}
              </h3>
              <div className='flex gap-2'>
                <DiscountTypeBadge type={coupon.discountType} />
                <CouponStatusBadge status={coupon.status} />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5 col-span-2 sm:col-span-1'>
                <Label className='text-xs text-muted-foreground'>{t('form.code', 'Mã Code')}</Label>
                <Input
                  value={coupon.code}
                  readOnly
                  className={`${readOnlyInputClass} font-bold text-lg text-primary tracking-widest`}
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>
                  {t('form.discountValue', 'Giá trị giảm')}
                </Label>
                <Input
                  value={
                    coupon.discountType === 'PERCENTAGE'
                      ? `${coupon.discountValue}%`
                      : formatCurrency(coupon.discountValue)
                  }
                  readOnly
                  className={`${readOnlyInputClass} font-bold text-orange-600`}
                />
              </div>

              {coupon.discountType === 'PERCENTAGE' && (
                <div className='space-y-1.5'>
                  <Label className='text-xs text-muted-foreground'>
                    {t('form.maxDiscount', 'Giảm tối đa')}
                  </Label>
                  <Input
                    value={formatCurrency(coupon.maxDiscountAmount)}
                    readOnly
                    className={readOnlyInputClass}
                  />
                </div>
              )}
            </div>
          </div>

          {/* KHU VỰC 2: ĐIỀU KIỆN ÁP DỤNG */}
          <div className='border rounded-lg p-4 space-y-4 bg-card'>
            <h3 className='font-semibold text-sm border-b pb-2 text-muted-foreground'>
              {t('form.section2', '2. Điều kiện & Hạn mức')}
            </h3>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>
                  {t('form.minOrder', 'Đơn hàng tối thiểu')}
                </Label>
                <Input
                  value={formatCurrency(coupon.minOrderValue)}
                  readOnly
                  className={readOnlyInputClass}
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>
                  {t('form.maxUsagePerUser', 'Giới hạn / User')}
                </Label>
                <Input
                  value={`${coupon.maxUsagePerUser} lần/người`}
                  readOnly
                  className={readOnlyInputClass}
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>
                  {t('form.usageLimit', 'Tổng lượt sử dụng')}
                </Label>
                <div
                  className={`flex items-center px-3 border rounded-md min-h-[40px] ${readOnlyInputClass}`}
                >
                  <span className='font-semibold'>{coupon.usedCount}</span>
                  <span className='text-muted-foreground mx-1'>/</span>
                  <span className='text-muted-foreground'>
                    {coupon.usageLimit ? coupon.usageLimit : 'Không giới hạn'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* KHU VỰC 3: THỜI GIAN */}
          <div className='border rounded-lg p-4 space-y-4 bg-card'>
            <h3 className='font-semibold text-sm border-b pb-2 text-muted-foreground'>
              {t('form.section3', '3. Thời gian áp dụng')}
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>
                  {t('form.startDate', 'Bắt đầu')}
                </Label>
                <Input
                  value={format(new Date(coupon.startDate), 'dd/MM/yyyy HH:mm')}
                  readOnly
                  className={readOnlyInputClass}
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>
                  {t('form.endDate', 'Kết thúc')}
                </Label>
                <Input
                  value={format(new Date(coupon.endDate), 'dd/MM/yyyy HH:mm')}
                  readOnly
                  className={`${readOnlyInputClass} text-destructive font-medium`}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
