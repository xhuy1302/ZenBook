import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type {
  WishlistRequest,
  WishlistResponse,
  WishlistCheckResponse,
  WishlistCountResponse,
  WishlistToggleResponse
} from '@/services/wishlist/wishlist.type'

const BASE_URL = '/wishlist'

// 1. Thêm vào wishlist
export const addToWishlistApi = async (payload: WishlistRequest) => {
  const res = await api.post<ApiResponse<void>>(BASE_URL, payload)
  return res.data
}

// 2. Xoá khỏi wishlist
export const removeFromWishlistApi = async (bookId: string) => {
  const res = await api.delete<ApiResponse<void>>(`${BASE_URL}/${bookId}`)
  return res.data
}

// 3. Lấy danh sách wishlist của user hiện tại
export const getMyWishlistApi = async (params?: { keyword?: string; sortBy?: string }) => {
  const res = await api.get<ApiResponse<WishlistResponse[]>>(BASE_URL, { params })
  return res.data.data
}

// 4. Check 1 sản phẩm có trong wishlist không
export const checkInWishlistApi = async (bookId: string) => {
  const res = await api.get<ApiResponse<WishlistCheckResponse>>(`${BASE_URL}/check/${bookId}`)
  return res.data.data // Trả về { inWishlist: boolean }
}

// 5. Đếm số lượng item trong wishlist
export const getWishlistCountApi = async () => {
  const res = await api.get<ApiResponse<WishlistCountResponse>>(`${BASE_URL}/count`)
  return res.data.data // Trả về { count: number }
}

// 6. Toggle wishlist
export const toggleWishlistApi = async (bookId: string) => {
  const res = await api.post<ApiResponse<WishlistToggleResponse>>(`${BASE_URL}/toggle/${bookId}`)
  return res.data // Trả về cả ApiResponse để lấy được message "added" hoặc "removed"
}
