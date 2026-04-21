import { useState } from 'react'
import { Loader2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

interface CartSummaryProps {
  subtotal: number
  totalItems: number
  formatCurrency: (amount: number) => string
  onCheckout: () => void
  isCheckingOut: boolean
  t: (key: string) => string // Truyền hàm dịch vào
}

export function CartSummary({
  subtotal,
  totalItems,
  formatCurrency,
  onCheckout,
  isCheckingOut,
  t
}: CartSummaryProps) {
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)

  const shippingFee = subtotal > 0 && subtotal < 5000000 ? 30000 : 0
  const finalTotal = subtotal + shippingFee - discount

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'ZENBOOK') {
      setDiscount(100000)
    } else {
      setDiscount(0)
    }
  }

  return (
    <Card className='rounded-2xl border-neutral-200/80 shadow-lg shadow-neutral-200/30 p-6 md:p-8 sticky top-24 bg-white'>
      <h2 className='text-xl font-bold text-foreground mb-6'>{t('cart.orderSummary')}</h2>

      <div className='space-y-3.5 text-sm text-muted-foreground'>
        <div className='flex justify-between items-center'>
          <span>
            {t('cart.subtotal')} ({totalItems} {t('cart.items')})
          </span>
          <span className='font-semibold text-foreground'>{formatCurrency(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className='flex justify-between items-center text-brand-green'>
            <span>Discount</span>
            <span className='font-semibold'>-{formatCurrency(discount)}</span>
          </div>
        )}

        <div className='flex justify-between items-center'>
          <span>{t('cart.shipping')}</span>
          <span className='font-semibold text-foreground'>
            {shippingFee === 0 ? (
              <span className='text-brand-green'>{t('cart.free')}</span>
            ) : (
              formatCurrency(shippingFee)
            )}
          </span>
        </div>
      </div>

      <Separator className='my-6 bg-neutral-100' />

      {/* Coupon Section */}
      <div className='mb-6'>
        <label className='text-sm font-semibold text-foreground mb-2.5 block'>
          {t('cart.giftCardLabel')}
        </label>
        <div className='flex gap-2'>
          <div className='relative flex-1'>
            <Tag className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder={t('cart.giftCardPlaceholder')}
              className='pl-9 h-11 bg-neutral-50 border-neutral-200 focus-visible:ring-brand-green'
            />
          </div>
          <Button
            variant='outline'
            onClick={handleApplyCoupon}
            disabled={!couponCode}
            className='h-11 px-6 font-semibold border-neutral-200 text-foreground hover:bg-neutral-50'
          >
            {t('cart.apply')}
          </Button>
        </div>
      </div>

      <div className='flex justify-between items-end mb-8 bg-neutral-50 p-4 rounded-xl border border-neutral-100'>
        <span className='text-base font-bold text-foreground'>{t('cart.total')}</span>
        <div className='text-right'>
          <span className='text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5 font-semibold'>
            {t('cart.includingVat')}
          </span>
          <span className='text-2xl font-bold text-brand-red tracking-tight'>
            {formatCurrency(finalTotal)}
          </span>
        </div>
      </div>

      <Button
        onClick={onCheckout}
        disabled={subtotal === 0 || isCheckingOut}
        className='w-full h-14 rounded-xl bg-brand-green hover:bg-brand-green-dark text-primary-foreground font-bold text-base transition-all shadow-md shadow-brand-green/20'
      >
        {isCheckingOut ? (
          <>
            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
            Processing...
          </>
        ) : (
          t('cart.checkout')
        )}
      </Button>
    </Card>
  )
}
