import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next' // THÊM IMPORT NÀY
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CartItem } from '@/components/zenbook/cart/CartItem'
import { CartSummary } from '@/components/zenbook/cart/CartSummary'
import type { CartItemType } from '@/services/cart/cart.type'

// Premium Mock Data
const MOCK_DATA: CartItemType[] = [
  {
    id: '1',
    name: 'Apple AirPods Pro (2nd generation) with MagSafe Charging Case',
    variant: 'White',
    price: 6199000,
    quantity: 1,
    selected: true,
    image:
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    variant: 'Midnight Blue',
    price: 8990000,
    quantity: 1,
    selected: true,
    image:
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400&auto=format&fit=crop'
  }
]

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

export default function CartPage() {
  // KHỞI TẠO HÀM DỊCH THUẬT
  const { t } = useTranslation('common')
  const safeTranslate = t as unknown as (key: string) => string

  // Initialize state from localStorage or fallback to mock data
  const [items, setItems] = useState<CartItemType[]>(() => {
    const saved = localStorage.getItem('zenbook_cart')
    return saved ? JSON.parse(saved) : MOCK_DATA
  })

  const [isCheckingOut, setIsCheckingOut] = useState(false)

  // Persist to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('zenbook_cart', JSON.stringify(items))
  }, [items])

  // Derived state
  const selectedItems = useMemo(() => items.filter((i) => i.selected), [items])
  const isAllSelected = items.length > 0 && selectedItems.length === items.length
  const subtotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const totalSelectedItems = selectedItems.reduce((acc, item) => acc + item.quantity, 0)

  // Handlers
  const handleUpdateQuantity = (id: string, delta: number) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta)
          return { ...item, quantity: newQty }
        }
        return item
      })
    )
  }

  const handleRemove = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
    toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
  }

  const handleToggleSelect = (id: string) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    )
  }

  const handleToggleSelectAll = () => {
    setItems((current) => current.map((item) => ({ ...item, selected: !isAllSelected })))
  }

  const handleCheckout = () => {
    setIsCheckingOut(true)
    // Simulate API call
    setTimeout(() => {
      setIsCheckingOut(false)
      toast.success('Đặt hàng thành công!', {
        description: 'Vui lòng kiểm tra email để xem hóa đơn.'
      })
      // Optional: Clear selected items
      setItems((current) => current.filter((item) => !item.selected))
    }, 2000)
  }

  // Empty State Rendering
  if (items.length === 0) {
    return (
      <div className='min-h-screen bg-[#FAFAFA] flex flex-col'>
        <div className='flex-1 flex items-center justify-center p-4'>
          <div className='max-w-md w-full text-center space-y-6'>
            <div className='w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-neutral-100'>
              <ShoppingBag className='w-10 h-10 text-neutral-300' />
            </div>
            <div>
              <h2 className='text-2xl font-semibold text-zinc-900 tracking-tight'>
                {safeTranslate('cart.emptyTitle')}
              </h2>
              <p className='text-neutral-500 mt-2'>{safeTranslate('cart.emptyDesc')}</p>
            </div>
            <Button
              className='w-full h-12 rounded-xl bg-brand-green hover:bg-brand-green-dark text-white text-base'
              onClick={() => window.history.back()}
            >
              {safeTranslate('cart.continueShopping')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className='min-h-screen bg-[#FAFAFA] flex flex-col'>
      <div className='flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 lg:p-8 pb-24'>
        {/* Header */}
        <div className='flex items-center gap-4 mb-8 mt-4'>
          <Button
            variant='ghost'
            size='icon'
            className='rounded-full hover:bg-white'
            onClick={() => window.history.back()}
          >
            <ArrowLeft className='w-5 h-5 text-zinc-900' />
          </Button>
          <h1 className='text-3xl font-semibold tracking-tight text-zinc-900'>
            {safeTranslate('cart.title')}
          </h1>
        </div>

        <div className='grid lg:grid-cols-12 gap-8 lg:gap-12'>
          {/* Left Column: Cart Items */}
          <div className='lg:col-span-7 xl:col-span-8 flex flex-col gap-6'>
            {/* Select All Bar */}
            <div className='flex items-center justify-between p-4 bg-white rounded-2xl border border-neutral-200/60 shadow-sm'>
              <div className='flex items-center gap-3'>
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleToggleSelectAll}
                  className='rounded-[4px] border-neutral-300 text-white data-[state=checked]:bg-brand-green data-[state=checked]:border-brand-green'
                />
                <span className='text-sm font-medium text-zinc-900'>
                  {safeTranslate('cart.selectAll')}
                </span>
              </div>
              <span className='text-sm text-neutral-500'>
                {items.length} {safeTranslate('cart.items')}
              </span>
            </div>

            {/* Items List */}
            <div className='flex flex-col gap-4'>
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemove}
                  onToggleSelect={handleToggleSelect}
                  formatCurrency={formatVND}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Summary */}
          <div className='lg:col-span-5 xl:col-span-4'>
            <CartSummary
              subtotal={subtotal}
              totalItems={totalSelectedItems}
              formatCurrency={formatVND}
              onCheckout={handleCheckout}
              isCheckingOut={isCheckingOut}
              t={safeTranslate} // FIX LỖI Ở ĐÂY: Truyền hàm t vào component con
            />
          </div>
        </div>
      </div>
    </main>
  )
}
