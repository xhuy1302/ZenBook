import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react'
import { toast } from 'sonner'
import type { CartItemType } from '@/services/cart/cart.type'
import { useAuth } from '@/context/AuthContext'
import {
  addToCartApi,
  clearCartApi,
  getMyCartApi,
  removeCartItemApi,
  syncCartApi,
  updateQuantityApi
} from '@/services/cart/cart.api'

interface CartContextValue {
  items: CartItemType[]
  totalItems: number
  totalPrice: number
  isLoading: boolean
  addItem: (item: Omit<CartItemType, 'quantity' | 'selected'>, quantity?: number) => Promise<void>
  removeItem: (id: string) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  isInCart: (id: string) => boolean
  toggleSelect: (id: string) => void
  toggleSelectAll: (selected: boolean) => void
}

const CartContext = createContext<CartContextValue | null>(null)
const CART_KEY = 'zenbook_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState<CartItemType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshCartFromServer = useCallback(async () => {
    try {
      const serverCart = await getMyCartApi()

      // SỬA Ở ĐÂY: Dùng functional update của state để so sánh với danh sách cũ
      setItems((prevItems) => {
        return serverCart.details.map((d) => {
          // Tìm xem sản phẩm này đã có trong giỏ hàng hiện tại chưa
          const existingItem = prevItems.find((i) => i.id === d.bookId)

          return {
            id: d.bookId,
            slug: d.bookSlug,
            title: d.bookTitle,
            thumbnail: d.bookThumbnail,
            price: d.price,
            originalPrice: d.originalPrice,
            author: d.author,
            quantity: d.quantity,
            stock: d.stock,
            // Nếu đã tồn tại, giữ nguyên trạng thái chọn cũ. Nếu là mới thêm vào, mặc định chọn (true)
            selected: existingItem ? existingItem.selected : true
          }
        })
      })
    } catch {
      toast.error('Không thể tải giỏ hàng từ máy chủ')
    }
  }, [])

  // ── KHỞI TẠO GIỎ HÀNG ──
  useEffect(() => {
    const initCart = async () => {
      setIsLoading(true)
      if (isAuthenticated) {
        // 1. Kiểm tra xem có hàng ở LocalStorage để sync không
        const localData = localStorage.getItem(CART_KEY)
        const localItems: CartItemType[] = localData ? JSON.parse(localData) : []

        if (localItems.length > 0) {
          try {
            await syncCartApi(localItems.map((i) => ({ bookId: i.id, quantity: i.quantity })))
            localStorage.removeItem(CART_KEY) // Sync xong thì xóa local
          } catch {
            // Error handled by interceptor or silent fail
          }
        }
        await refreshCartFromServer()
      } else {
        // 2. Khách vãng lai: Đọc từ localStorage
        const stored = localStorage.getItem(CART_KEY)
        setItems(stored ? JSON.parse(stored) : [])
      }
      setIsLoading(false)
    }

    initCart()
  }, [isAuthenticated, refreshCartFromServer])

  // ── LƯU LOCALSTORAGE (Chỉ dành cho khách vãng lai) ──
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    }
  }, [items, isAuthenticated])

  const addItem = async (newItem: Omit<CartItemType, 'quantity' | 'selected'>, quantity = 1) => {
    if (isAuthenticated) {
      try {
        await addToCartApi({ bookId: newItem.id, quantity })
        await refreshCartFromServer()
      } catch {
        // Error toast handled inside service/interceptor
      }
    } else {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === newItem.id)
        if (existing) {
          const newQuantity = existing.quantity + quantity
          if (newItem.stock !== undefined && newQuantity > newItem.stock) {
            toast.error(`Chỉ còn ${newItem.stock} sản phẩm trong kho!`)
            return prev
          }
          return prev.map((i) => (i.id === newItem.id ? { ...i, quantity: newQuantity } : i))
        }
        return [...prev, { ...newItem, quantity, selected: true }]
      })
    }
  }

  const removeItem = async (id: string) => {
    if (isAuthenticated) {
      try {
        await removeCartItemApi(id)
        await refreshCartFromServer()
      } catch {
        /* error */
      }
    } else {
      setItems((prev) => prev.filter((i) => i.id !== id))
    }
  }

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return

    if (isAuthenticated) {
      try {
        await updateQuantityApi(id, quantity)
        await refreshCartFromServer()
      } catch {
        /* error */
      }
    } else {
      setItems((prev) =>
        prev.map((i) => {
          if (i.id === id) {
            if (i.stock !== undefined && quantity > i.stock) {
              toast.error(`Chỉ còn ${i.stock} sản phẩm!`)
              return i
            }
            return { ...i, quantity }
          }
          return i
        })
      )
    }
  }

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await clearCartApi()
        setItems([])
      } catch {
        /* error */
      }
    } else {
      setItems([])
    }
  }

  const toggleSelect = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)))
  }

  const toggleSelectAll = (selected: boolean) => {
    setItems((prev) => prev.map((i) => ({ ...i, selected })))
  }

  const isInCart = (id: string) => items.some((i) => i.id === id)

  const totalItems = items.length
  const totalPrice = items
    .filter((i) => i.selected)
    .reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        toggleSelect,
        toggleSelectAll
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart phải được dùng bên trong CartProvider')
  return ctx
}
