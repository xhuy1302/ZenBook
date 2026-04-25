// src/services/order/cart.api.ts
import { api } from '@/utils/axiosCustomize'
import type { CartResponse, CartItemRequest } from './cart.type'

// Interface chung của Backend trả về
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

const URL = '/cart'

// 1. Lấy thông tin giỏ hàng
export const getMyCartApi = async () => {
  const response = await api.get<ApiResponse<CartResponse>>(URL)
  return response.data.data
}

// 2. Thêm sản phẩm vào giỏ
export const addToCartApi = async (body: CartItemRequest) => {
  const response = await api.post<ApiResponse<CartResponse>>(`${URL}/items`, body)
  return response.data.data
}

// 3. Cập nhật số lượng
export const updateQuantityApi = async (bookId: string, quantity: number) => {
  const response = await api.put<ApiResponse<CartResponse>>(`${URL}/items/${bookId}`, { quantity })
  return response.data.data
}

// 4. Xóa 1 sản phẩm
export const removeCartItemApi = async (bookId: string) => {
  const response = await api.delete<ApiResponse<CartResponse>>(`${URL}/items/${bookId}`)
  return response.data.data
}

// 5. Xóa nhiều sản phẩm cùng lúc
export const removeMultipleCartItemsApi = async (bookIds: string[]) => {
  const response = await api.delete<ApiResponse<CartResponse>>(`${URL}/items/bulk`, {
    data: { bookIds } // Axios yêu cầu gửi body của method DELETE vào trong object data
  })
  return response.data.data
}

// 6. Xóa sạch giỏ hàng (Clear)
export const clearCartApi = async () => {
  const response = await api.delete<ApiResponse<void>>(`${URL}/clear`)
  return response.data
}

// 7. Đồng bộ giỏ hàng (Sync) từ LocalStorage
export const syncCartApi = async (localItems: CartItemRequest[]) => {
  const response = await api.post<ApiResponse<CartResponse>>(`${URL}/sync`, localItems)
  return response.data.data
}
