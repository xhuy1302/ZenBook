import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import type { CartItemType } from '@/services/cart/cart.type'

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (id: string, delta: number) => void
  onRemove: (id: string) => void
  onToggleSelect: (id: string) => void
  formatCurrency: (amount: number) => string
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  onToggleSelect,
  formatCurrency
}: CartItemProps) {
  return (
    <div className='group flex flex-col sm:flex-row gap-4 p-4 md:p-5 bg-white rounded-2xl border border-neutral-200/60 shadow-sm hover:shadow-md transition-all duration-200'>
      {/* Selection & Image */}
      <div className='flex items-center gap-4'>
        {/* FIX LỖI ĐEN XÌ: Thêm text-white và chuyển màu bg sang brand-green */}
        <Checkbox
          checked={item.selected}
          onCheckedChange={() => onToggleSelect(item.id)}
          className='w-5 h-5 rounded-[4px] border-neutral-300 text-white data-[state=checked]:bg-brand-green data-[state=checked]:border-brand-green'
        />
        <div className='relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-50 border border-neutral-100'>
          <img
            src={item.image}
            alt={item.name}
            className='h-full w-full object-cover object-center mix-blend-multiply'
          />
        </div>
      </div>

      {/* Details */}
      <div className='flex flex-1 flex-col justify-between py-1'>
        <div className='flex flex-col sm:flex-row sm:justify-between gap-2'>
          <div className='space-y-1.5 pr-4'>
            <h3 className='font-semibold text-foreground line-clamp-2 leading-snug'>{item.name}</h3>
            {item.variant && (
              <Badge
                variant='secondary'
                className='bg-neutral-100 text-neutral-600 font-medium px-2 py-0.5'
              >
                {item.variant}
              </Badge>
            )}
          </div>
          <div className='text-right'>
            <p className='font-bold text-foreground text-lg'>{formatCurrency(item.price)}</p>
          </div>
        </div>

        {/* Controls & Subtotal */}
        <div className='flex items-center justify-between mt-4 pt-4 border-t border-neutral-100/80'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center rounded-lg border border-neutral-200 bg-white overflow-hidden h-9'>
              <button
                className='w-9 h-full flex items-center justify-center text-muted-foreground hover:bg-neutral-100 hover:text-foreground transition-colors disabled:opacity-50'
                onClick={() => onUpdateQuantity(item.id, -1)}
                disabled={item.quantity <= 1}
              >
                <Minus className='h-3.5 w-3.5' />
              </button>
              <div className='flex h-full w-10 items-center justify-center text-sm font-semibold text-foreground border-x border-neutral-200'>
                {item.quantity}
              </div>
              <button
                className='w-9 h-full flex items-center justify-center text-muted-foreground hover:bg-neutral-100 hover:text-foreground transition-colors'
                onClick={() => onUpdateQuantity(item.id, 1)}
              >
                <Plus className='h-3.5 w-3.5' />
              </button>
            </div>

            <Button
              variant='ghost'
              size='icon'
              className='h-9 w-9 text-neutral-400 hover:text-brand-red hover:bg-brand-red-light transition-colors rounded-lg'
              onClick={() => onRemove(item.id)}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>

          <div className='text-right sm:hidden'>
            <p className='text-sm font-bold text-foreground'>
              {formatCurrency(item.price * item.quantity)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
