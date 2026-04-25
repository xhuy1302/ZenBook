import { api } from '@/utils/axiosCustomize'
import type { PromotionRequest, PromotionResponse } from '@/services/promotion/promotion.type'

export const getActiveFlashSaleApi = async () => {
  const res = await api.get('/promotions/flash-sale/active')
  return res.data.data ?? null
}

// ==========================================
// 📚 QUẢN LÝ CHUNG
// ==========================================

export const getAllPromotionsApi = async () => {
  const res = await api.get<PromotionResponse[]>('/promotions')
  return res.data || []
}

export const getPromotionByIdApi = async (id: string) => {
  const res = await api.get<PromotionResponse>(`/promotions/${id}`)
  return res.data || null
}

export const createPromotionApi = async (data: PromotionRequest) => {
  const res = await api.post<PromotionResponse>('/promotions', data)
  return res.data
}

export const updatePromotionApi = async (id: string, data: PromotionRequest) => {
  const res = await api.put<PromotionResponse>(`/promotions/${id}`, data)
  return res.data
}

// ==========================================
// 🛑 DỪNG & BẬT LẠI KHUYẾN MÃI
// ==========================================

export const stopPromotionApi = async (id: string) => {
  const res = await api.patch<PromotionResponse>(`/promotions/${id}/stop`)
  return res.data
}

export const resumePromotionApi = async (id: string) => {
  const res = await api.patch<PromotionResponse>(`/promotions/${id}/resume`)
  return res.data
}

// ==========================================
// 🗑️ THÙNG RÁC, XÓA & KHÔI PHỤC
// ==========================================

// Lấy danh sách khuyến mãi đã xóa (trong thùng rác)
export const getAllPromotionsInTrashApi = async () => {
  const res = await api.get<PromotionResponse[]>('/promotions/trash')
  return res.data || []
}

// Xóa mềm (Đưa vào thùng rác) - Tương đương hàm delete cũ
export const softDeletePromotionApi = async (id: string) => {
  const res = await api.delete(`/promotions/${id}`)
  return res.data
}

// Khôi phục từ thùng rác
export const restorePromotionApi = async (id: string) => {
  const res = await api.patch<PromotionResponse>(`/promotions/${id}/restore`)
  return res.data
}

// Xóa vĩnh viễn (Khỏi Database)
export const hardDeletePromotionApi = async (id: string) => {
  const res = await api.delete(`/promotions/${id}/hard`)
  return res.data
}
