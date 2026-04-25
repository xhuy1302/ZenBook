import { useMemo, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingBag, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CartItem } from '@/components/zenbook/cart/CartItem'
import { CartSummary } from '@/components/zenbook/cart/CartSummary'
import { useCart } from '@/context/CartContext'

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

export default function CartPage() {
  const { t } = useTranslation('common')
  const safeT = t as unknown as (key: string) => string
  const navigate = useNavigate()
  const location = useLocation()

  const buyNowId = location.state?.buyNowId
  const initialized = useRef(false)

  const {
    items,
    isLoading,
    totalPrice,
    totalItems,
    updateQuantity,
    removeItem,
    toggleSelect,
    toggleSelectAll
  } = useCart()

  useEffect(() => {
    if (!isLoading && items.length > 0 && !initialized.current) {
      if (buyNowId) {
        // SỬA Ở ĐÂY: Kiểm tra xem item Mua Ngay đã được fetch về state items chưa
        const hasBuyNowItem = items.some((item) => item.id === buyNowId)

        // Nếu chưa có (vì addItem gọi API chậm), ta return để đợi lần render tiếp theo
        if (!hasBuyNowItem) return

        // Nếu đã có rồi thì mới tiến hành bỏ chọn các cái khác và chọn cái này
        items.forEach((item) => {
          if (item.id === buyNowId && !item.selected) toggleSelect(item.id)
          if (item.id !== buyNowId && item.selected) toggleSelect(item.id)
        })

        initialized.current = true
        window.history.replaceState({}, document.title)
      } else {
        toggleSelectAll(false)
        initialized.current = true
        window.history.replaceState({}, document.title)
      }
    }
  }, [isLoading, items, buyNowId, toggleSelect, toggleSelectAll])

  const selectedItems = useMemo(() => items.filter((i) => i.selected), [items])
  const isAllSelected = items.length > 0 && selectedItems.length === items.length

  const handleUpdateQuantity = async (id: string, delta: number) => {
    const item = items.find((i) => i.id === id)
    if (item) {
      const newQty = item.quantity + delta
      if (newQty >= 1) {
        await updateQuantity(id, newQty)
      }
    }
  }

  const handleRemove = async (id: string) => {
    await removeItem(id)
    toast.success(safeT('cart.removed'))
  }

  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) return

    const promise = Promise.all(selectedItems.map((item) => removeItem(item.id)))

    toast.promise(promise, {
      loading: 'Đang xóa các sản phẩm...',
      success: 'Đã xóa các sản phẩm thành công',
      error: 'Có lỗi xảy ra khi xóa'
    })
  }

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán')
      return
    }
    sessionStorage.setItem('zenbook_checkout_items', JSON.stringify(selectedItems))
    navigate('/checkout')
  }

  if (isLoading) {
    return (
      <div className='min-h-[60vh] flex flex-col items-center justify-center gap-4'>
        <Loader2 className='w-10 h-10 animate-spin text-brand-green' />
        <p className='text-zinc-500 animate-pulse'>Đang tải giỏ hàng của bạn...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className='min-h-[calc(100vh-200px)] bg-[#f5f5fa] flex flex-col'>
        <div className='flex-1 flex items-center justify-center p-4'>
          <div className='max-w-md w-full bg-white p-8 rounded-lg shadow-sm text-center space-y-6'>
            <div className='mx-auto'>
              <img
                src='/images/empty-cart.png'
                alt='Giỏ hàng trống'
                className='w-40 mx-auto opacity-80'
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                  ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
                }}
              />
              <div className='hidden w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mx-auto'>
                <ShoppingBag className='w-10 h-10 text-neutral-300' />
              </div>
            </div>
            <div>
              <p className='text-zinc-600 font-medium'>{safeT('cart.emptyDesc')}</p>
            </div>
            <Button
              className='w-full max-w-[200px] h-10 bg-brand-green hover:bg-brand-green-dark text-white font-medium'
              onClick={() => navigate('/products')}
            >
              {safeT('cart.continueShopping')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className='min-h-screen bg-[#f5f5fa] pb-24'>
      <div className='max-w-[1200px] w-full mx-auto px-4 py-6'>
        <h1 className='text-xl font-medium uppercase text-zinc-900 mb-4'>{safeT('cart.title')}</h1>

        <div className='grid lg:grid-cols-12 gap-5'>
          <div className='lg:col-span-8 xl:col-span-9 flex flex-col gap-4'>
            <div className='hidden sm:flex items-center bg-white rounded-lg p-4 text-sm text-zinc-500 font-medium border border-neutral-100'>
              <div className='flex items-center gap-3 w-[50%]'>
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                  className='rounded w-5 h-5 border-neutral-300 text-white data-[state=checked]:bg-brand-green data-[state=checked]:border-brand-green'
                />
                <span className='text-zinc-800'>
                  {safeT('cart.selectAll')} ({items.length} sản phẩm)
                </span>
              </div>
              <div className='flex items-center justify-between w-[50%]'>
                <div className='w-[25%] text-center'>Đơn giá</div>
                <div className='w-[30%] text-center'>Số lượng</div>
                <div className='w-[30%] text-center'>Thành tiền</div>
                <div className='w-[15%] flex justify-end'>
                  <button
                    onClick={handleRemoveSelected}
                    disabled={selectedItems.length === 0}
                    className='hover:text-brand-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    title='Xóa đã chọn'
                  >
                    <Trash2 className='w-5 h-5' />
                  </button>
                </div>
              </div>
            </div>

            <div className='sm:hidden flex items-center justify-between bg-white rounded-lg p-4 text-sm font-medium'>
              <div className='flex items-center gap-3'>
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                  className='rounded w-5 h-5 border-neutral-300 data-[state=checked]:bg-brand-green data-[state=checked]:border-brand-green text-white'
                />
                <span>Chọn tất cả ({items.length})</span>
              </div>
              <button
                onClick={handleRemoveSelected}
                disabled={selectedItems.length === 0}
                className='text-brand-red disabled:opacity-50 text-sm'
              >
                Xóa
              </button>
            </div>

            <div className='bg-white rounded-lg flex flex-col border border-neutral-100 overflow-hidden'>
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemove}
                  onToggleSelect={toggleSelect}
                  formatCurrency={formatVND}
                />
              ))}
            </div>
          </div>

          <div className='lg:col-span-4 xl:col-span-3'>
            <CartSummary
              subtotal={totalPrice}
              totalItems={totalItems}
              formatCurrency={formatVND}
              onCheckout={handleCheckout}
              isCheckingOut={false}
              t={safeT}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
