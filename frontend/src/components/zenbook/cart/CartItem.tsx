import { useState } from 'react'
import { Minus, Plus, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Link } from 'react-router-dom'
import type { CartItemType } from '@/services/cart/cart.type'

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (id: string, delta: number) => Promise<void>
  onRemove: (id: string) => Promise<void>
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
  const [isPending, setIsPending] = useState(false)

  const handleQtyChange = async (delta: number) => {
    if (isPending) return
    setIsPending(true)
    try {
      await onUpdateQuantity(item.id, delta)
    } finally {
      setIsPending(false)
    }
  }

  const handleRemoveClick = async () => {
    if (isPending) return
    setIsPending(true)
    try {
      await onRemove(item.id)
    } finally {
      setIsPending(false)
    }
  }

  const displayPrice = item.price
  const originalPrice = item.originalPrice || item.price
  const hasDiscount = originalPrice > displayPrice

  return (
    <div
      className={`
        group relative flex flex-col sm:flex-row items-start sm:items-center
        gap-4 px-5 py-5
        bg-white border-b border-slate-100 last:border-0
        transition-all duration-200
        ${item.selected ? 'bg-green-50/30' : 'hover:bg-slate-50/60'}
        ${isPending ? 'opacity-60 pointer-events-none' : ''}
      `}
    >
      {item.selected && (
        <div className='absolute left-0 top-0 bottom-0 w-0.5 bg-green-500 rounded-r' />
      )}

      <div className='flex items-center gap-4 flex-1 min-w-0'>
        <Checkbox
          checked={item.selected}
          onCheckedChange={() => onToggleSelect(item.id)}
          disabled={isPending}
          className='shrink-0 w-[18px] h-[18px] rounded-[4px] border-2 border-slate-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 transition-colors text-white'
        />

        <Link to={`/products/${item.slug}`} className='shrink-0 block'>
          <div className='relative w-[72px] h-[90px] rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shadow-sm group-hover:shadow-md transition-shadow'>
            <img
              src={item.thumbnail || '/images/placeholder-book.jpg'}
              alt={item.title}
              className='w-full h-full object-contain p-1.5'
            />
          </div>
        </Link>

        <div className='flex flex-col gap-1 min-w-0'>
          <Link to={`/products/${item.slug}`}>
            <h3 className='text-sm font-semibold text-slate-800 line-clamp-2 leading-snug hover:text-green-600 transition-colors'>
              {item.title}
            </h3>
          </Link>
          {item.author && <p className='text-xs text-slate-400 line-clamp-1'>{item.author}</p>}

          <div className='flex items-baseline gap-1.5 sm:hidden mt-1.5'>
            <span className='text-sm font-bold text-green-600'>{formatCurrency(displayPrice)}</span>
            {hasDiscount && (
              <span className='text-xs text-slate-400 line-through'>
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className='flex items-center gap-4 sm:gap-6 w-full sm:w-auto pl-[calc(18px+16px+72px+16px)] sm:pl-0'>
        <div className='hidden sm:flex flex-col items-end min-w-[90px]'>
          <span className='text-sm font-bold text-green-600'>{formatCurrency(displayPrice)}</span>
          {hasDiscount && (
            <span className='text-[11px] text-slate-400 line-through leading-none mt-0.5'>
              {formatCurrency(originalPrice)}
            </span>
          )}
        </div>

        <div className='flex items-center rounded-lg border border-slate-200 overflow-hidden bg-white shadow-xs h-8'>
          <button
            onClick={() => handleQtyChange(-1)}
            disabled={isPending || item.quantity <= 1}
            className='w-8 h-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-30'
          >
            <Minus className='w-3 h-3' />
          </button>

          <div className='w-10 h-full flex items-center justify-center border-x border-slate-200'>
            {isPending ? (
              <Loader2 className='w-3 h-3 animate-spin text-green-500' />
            ) : (
              <span className='text-[13px] font-semibold text-slate-700'>{item.quantity}</span>
            )}
          </div>

          <button
            onClick={() => handleQtyChange(1)}
            disabled={isPending || (item.stock !== undefined && item.quantity >= item.stock)}
            className='w-8 h-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-30'
          >
            <Plus className='w-3 h-3' />
          </button>
        </div>

        <div className='hidden sm:block min-w-[100px] text-right'>
          <span className='text-sm font-bold text-red-600'>
            {formatCurrency(displayPrice * item.quantity)}
          </span>
        </div>

        <div className='sm:hidden flex-1 text-right'>
          <span className='text-sm font-bold text-red-600'>
            {formatCurrency(displayPrice * item.quantity)}
          </span>
        </div>

        <Button
          variant='ghost'
          size='icon'
          onClick={handleRemoveClick}
          disabled={isPending}
          className='h-8 w-8 rounded-lg shrink-0 text-slate-300 hover:text-green-500 hover:bg-green-50 transition-all'
        >
          {isPending ? (
            <Loader2 className='w-4 h-4 animate-spin' />
          ) : (
            <Trash2 className='w-4 h-4' />
          )}
        </Button>
      </div>
    </div>
  )
}
