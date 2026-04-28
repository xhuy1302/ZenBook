import { api } from '@/utils/axiosCustomize'
import type {
  PromotionRequest,
  PromotionResponse,
  CategoryFilterResponse
} from '@/services/promotion/promotion.type'

/**
 * ⚡ NHÓM API DÀNH CHO KHÁCH HÀNG (CUSTOMER)
 */

// Lấy 1 chương trình Flash Sale đang ACTIVE duy nhất
export const getActiveFlashSaleApi = async () => {
  const res = await api.get('/promotions/flash-sale/active')
  return (res.data.data as PromotionResponse) || null
}

// Lấy danh sách tất cả các khung giờ Flash Sale trong ngày (Thanh SESSIONS)
export const getTodayFlashSalesApi = async () => {
  const res = await api.get('/promotions/flash-sale/today')
  return (res.data.data as PromotionResponse[]) || []
}

// Lấy danh sách danh mục có trong 1 khung giờ cụ thể (Thanh CATEGORIES)
export const getCategoriesByPromotionApi = async (promotionId: string) => {
  const res = await api.get(`/promotions/flash-sale/${promotionId}/categories`)
  return (res.data.data as CategoryFilterResponse[]) || []
}

/**
 * 🛠️ NHÓM API QUẢN LÝ CHUNG (ADMIN & COMMON)
 */

// Lấy tất cả chương trình khuyến mãi (Chưa xóa)
export const getAllPromotionsApi = async () => {
  const res = await api.get('/promotions')
  return (res.data.data as PromotionResponse[]) || []
}

// Lấy chi tiết 1 chương trình theo ID
export const getPromotionByIdApi = async (id: string) => {
  const res = await api.get(`/promotions/${id}`)
  return (res.data.data as PromotionResponse) || null
}

// Tạo mới chương trình khuyến mãi
export const createPromotionApi = async (data: PromotionRequest) => {
  const res = await api.post('/promotions', data)
  return res.data // Trả về res.data để component lấy được trường 'message' hiển thị Toast
}

// Cập nhật chương trình khuyến mãi
export const updatePromotionApi = async (id: string, data: PromotionRequest) => {
  const res = await api.put(`/promotions/${id}`, data)
  return res.data
}

// Tạm dừng chương trình
export const stopPromotionApi = async (id: string) => {
  const res = await api.patch(`/promotions/${id}/stop`)
  return res.data
}

// Tiếp tục chương trình đang tạm dừng
export const resumePromotionApi = async (id: string) => {
  const res = await api.patch(`/promotions/${id}/resume`)
  return res.data
}

/**
 * 🗑️ NHÓM API THÙNG RÁC & XÓA
 */

// Lấy danh sách đã xóa mềm
export const getAllPromotionsInTrashApi = async () => {
  const res = await api.get('/promotions/trash')
  return (res.data.data as PromotionResponse[]) || []
}

// Xóa mềm (Đưa vào thùng rác)
export const softDeletePromotionApi = async (id: string) => {
  const res = await api.delete(`/promotions/${id}`)
  return res.data
}

// Khôi phục từ thùng rác
export const restorePromotionApi = async (id: string) => {
  const res = await api.patch(`/promotions/${id}/restore`)
  return res.data
}

// Xóa vĩnh viễn khỏi Database
export const hardDeletePromotionApi = async (id: string) => {
  const res = await api.delete(`/promotions/${id}/hard`)
  return res.data
}
