import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type { CouponRequest, CouponResponse, CouponValidateRequest } from './coupon.type'

export const getAllCouponsApi = async (userId?: string) => {
  const res = await api.get<ApiResponse<CouponResponse[]>>('/coupons', {
    params: { userId } // 👉 Truyền userId xuống dưới dạng query param
  })
  return res.data.data
}

// 2. LẤY CHI TIẾT 1 MÃ
export const getCouponByIdApi = async (id: string) => {
  const res = await api.get<ApiResponse<CouponResponse>>(`/coupons/${id}`)
  return res.data.data
}

// 3. THÊM MỚI
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

// ================= API CHO CLIENT (TRANG GIỎ HÀNG / CHECKOUT) =================

// 9. VALIDATE MÃ GIẢM GIÁ
// Ví dụ trong coupon.api.ts (chỉ để kiểm tra, nếu có rồi thì bỏ qua)
export const validateCouponApi = async (payload: CouponValidateRequest) => {
  const res = await api.get<ApiResponse<CouponResponse>>('/coupons/validate', {
    params: payload // Truyền toàn bộ payload xuống làm query params
  })
  return res.data.data
}
