import { Loader2, Truck, ShieldCheck, ChevronRight, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface CartSummaryProps {
  subtotal: number
  totalItems: number
  formatCurrency: (amount: number) => string
  onCheckout: () => void
  isCheckingOut: boolean
  t: (key: string) => string
}

// Ngưỡng freeship thực tế hơn cho nhà sách (Ví dụ: 300k hoặc 500k)
const FREE_SHIPPING_THRESHOLD = 500000

export function CartSummary({
  subtotal,
  totalItems,
  formatCurrency,
  onCheckout,
  isCheckingOut,
  t
}: CartSummaryProps) {
  // Ở trang Giỏ hàng, chúng ta chưa có địa chỉ nên KHÔNG cộng 30k vào finalTotal.
  // Phí ship thực tế sẽ được tính và cộng ở trang Checkout sau khi gọi API GHN.
  const finalTotal = subtotal

  const freeShipRemaining = FREE_SHIPPING_THRESHOLD - subtotal
  const isEligibleForFreeShip = subtotal >= FREE_SHIPPING_THRESHOLD
  const freeShipPct = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)

  return (
    <Card className='rounded-2xl border border-emerald-100 shadow-md bg-white overflow-hidden'>
      {/* ── Header ── */}
      <div className='bg-emerald-600 px-6 py-4'>
        <h2 className='text-base font-bold text-white tracking-wide uppercase'>
          {t('cart.orderSummary')}
        </h2>
      </div>

      <div className='p-6 space-y-5'>
        {/* ── Freeship progress (Thanh tiến trình) ── */}
        {subtotal > 0 && (
          <div className='space-y-1.5'>
            <div className='flex justify-between text-xs text-gray-500'>
              <span className='flex items-center gap-1'>
                <Truck className='h-3.5 w-3.5 text-emerald-600' />
                {isEligibleForFreeShip
                  ? 'Đơn hàng của bạn đủ điều kiện Miễn phí vận chuyển!'
                  : `Mua thêm ${formatCurrency(freeShipRemaining)} để được Freeship`}
              </span>
              <span className='font-medium text-emerald-700'>{Math.round(freeShipPct)}%</span>
            </div>
            <div className='h-1.5 w-full rounded-full bg-emerald-100 overflow-hidden'>
              <div
                className='h-full rounded-full bg-emerald-500 transition-all duration-500'
                style={{ width: `${freeShipPct}%` }}
              />
            </div>
          </div>
        )}

        <Separator className='bg-emerald-50' />

        {/* ── Breakdown (Chi tiết tiền) ── */}
        <div className='space-y-3'>
          <div className='flex justify-between text-sm text-gray-600'>
            <span>
              {t('cart.subtotal')} ({totalItems} {t('cart.items')})
            </span>
            <span className='font-medium text-gray-800'>{formatCurrency(subtotal)}</span>
          </div>

          <div className='flex justify-between text-sm'>
            <span className='flex items-center gap-1.5 text-gray-600'>
              <Truck className='h-3.5 w-3.5' />
              {t('cart.shipping')}
            </span>
            <span className='text-xs text-gray-400 italic'>Tính ở bước thanh toán</span>
          </div>

          {/* Note nhỏ để khách yên tâm */}
          <div className='flex gap-1.5 p-2 rounded-lg bg-blue-50 text-[11px] text-blue-600 border border-blue-100'>
            <Info className='h-3 w-3 shrink-0 mt-0.5' />
            <span>Phí vận chuyển thực tế sẽ được tính dựa trên địa chỉ nhận hàng của bạn.</span>
          </div>
        </div>

        <Separator className='bg-emerald-50' />

        {/* ── Total (Tổng tiền tạm tính) ── */}
        <div className='rounded-xl bg-emerald-50 border border-emerald-100 px-5 py-4 flex justify-between items-center'>
          <span className='text-sm font-bold text-gray-700'>Tạm tính</span>
          <div className='text-right'>
            <span className='text-2xl font-black text-emerald-700 leading-none block'>
              {formatCurrency(finalTotal)}
            </span>
            <span className='text-[10px] text-gray-400 mt-1 block'>(Chưa bao gồm phí ship)</span>
          </div>
        </div>

        {/* ── CTA ── */}
        <Button
          onClick={onCheckout}
          disabled={subtotal === 0 || isCheckingOut}
          className={cn(
            'w-full h-12 text-base font-bold tracking-wide transition-all duration-200',
            'bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl',
            'shadow-md shadow-emerald-200 active:scale-[0.98]',
            'disabled:bg-gray-200 disabled:shadow-none disabled:text-gray-400'
          )}
        >
          {isCheckingOut ? (
            <span className='flex items-center gap-2'>
              <Loader2 className='h-4 w-4 animate-spin' />
              Đang xử lý...
            </span>
          ) : (
            <span className='flex items-center justify-center gap-1.5'>
              Tiến hành thanh toán
              <ChevronRight className='h-4 w-4' />
            </span>
          )}
        </Button>

        {/* ── Trust badges ── */}
        <div className='flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1'>
          <ShieldCheck className='h-3.5 w-3.5 text-emerald-400' />
          <span>Thanh toán an toàn & bảo mật</span>
        </div>
      </div>
    </Card>
  )
}
