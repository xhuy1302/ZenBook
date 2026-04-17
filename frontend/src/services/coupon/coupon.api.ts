import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type { CouponRequest, CouponResponse } from './coupon.type'

// 1. LẤY DANH SÁCH (ACTIVE)
export const getAllCouponsApi = async () => {
  const res = await api.get<ApiResponse<CouponResponse[]>>('/coupons')
  return res.data.data
}

// 2. LẤY CHI TIẾT 1 MÃ
export const getCouponByIdApi = async (id: string) => {
  const res = await api.get<ApiResponse<CouponResponse>>(`/coupons/${id}`)
  return res.data.data
}

// 3. THÊM MỚI (Vì không có file ảnh nên truyền thẳng JSON payload)
export const createCouponApi = async (payload: CouponRequest) => {
  const res = await api.post<ApiResponse<CouponResponse>>('/coupons', payload)
  return res.data
}

// 4. CẬP NHẬT
export const updateCouponApi = async (id: string, payload: CouponRequest) => {
  const res = await api.put<ApiResponse<CouponResponse>>(`/coupons/${id}`, payload)
  return res.data
}

// 5. XÓA MỀM
export const softDeleteCouponApi = async (id: string) => {
  const res = await api.delete<ApiResponse<void>>(`/coupons/soft-delete/${id}`)
  return res.data
}

// ================= API CHO THÙNG RÁC =================

// 6. LẤY DANH SÁCH TRONG THÙNG RÁC
export const getCouponsInTrashApi = async () => {
  const res = await api.get<ApiResponse<CouponResponse[]>>('/coupons/trash')
  return res.data.data
}

// 7. KHÔI PHỤC
export const restoreCouponApi = async (id: string) => {
  const res = await api.patch<ApiResponse<void>>(`/coupons/restore/${id}`)
  return res.data
}

// 8. XÓA VĨNH VIỄN
export const hardDeleteCouponApi = async (id: string) => {
  const res = await api.delete<ApiResponse<void>>(`/coupons/${id}`)
  return res.data
}

// ================= API CHO CLIENT (TRANG GIỎ HÀNG) =================

// 9. VALIDATE MÃ GIẢM GIÁ
export const validateCouponApi = async (params: {
  code: string
  orderTotal: number
  currentUserId?: string
  categoryIdsInCart?: string[]
}) => {
  // Vì backend dùng @GetMapping và @RequestParam, nên ta nhét object vào thuộc tính "params"
  // Axios sẽ tự động parse thành URL: /coupons/validate?code=xxx&orderTotal=yyy
  const res = await api.get<ApiResponse<CouponResponse>>('/coupons/validate', { params })
  return res.data.data
}
