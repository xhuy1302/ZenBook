import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type { NewsRequest, NewsResponse } from './news.type'

// ─────────────────────────────────────────────────────────────────────────────
// 1. Helper Function
// ─────────────────────────────────────────────────────────────────────────────

// Đóng gói JSON thành FormData để gửi kèm File ảnh
const buildNewsFormData = (payload: NewsRequest) => {
  const formData = new FormData()

  formData.append('title', payload.title)
  formData.append('content', payload.content)
  if (payload.summary) formData.append('summary', payload.summary)
  if (payload.status) formData.append('status', payload.status)
  if (payload.categoryId) formData.append('categoryId', payload.categoryId)
  if (payload.metaTitle) formData.append('metaTitle', payload.metaTitle)
  if (payload.metaDescription) formData.append('metaDescription', payload.metaDescription)

  if (payload.tagIds && payload.tagIds.length > 0) {
    payload.tagIds.forEach((id) => formData.append('tagIds', id))
  }
  if (payload.bookIds && payload.bookIds.length > 0) {
    payload.bookIds.forEach((id) => formData.append('bookIds', id))
  }

  if (payload.thumbnailFile) {
    formData.append('thumbnailFile', payload.thumbnailFile)
  }

  return formData
}

// Helper bóc tách dữ liệu thông minh, thỏa mãn ESLint (không dùng any)
const extractData = <T>(res: unknown): T => {
  const response = res as { data?: T | { data?: T } }
  const inner = response.data as { data?: T }
  return (inner?.data !== undefined ? inner.data : response.data) as T
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. API Endpoints
// ─────────────────────────────────────────────────────────────────────────────

// 1. LẤY DANH SÁCH BÀI VIẾT
export const getAllNewsApi = async (): Promise<NewsResponse[]> => {
  const res = await api.get<unknown, unknown>('/news')
  const result = extractData<NewsResponse[]>(res)
  return Array.isArray(result) ? result : []
}

// 2. LẤY CHI TIẾT
export const getNewsByIdApi = async (id: string): Promise<NewsResponse> => {
  const res = await api.get<unknown, unknown>(`/news/${id}`)
  return extractData<NewsResponse>(res)
}

// 3. TẠO MỚI
export const createNewsApi = async (payload: NewsRequest): Promise<NewsResponse> => {
  const formData = buildNewsFormData(payload)
  const res = await api.post<unknown, unknown>('/news', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return extractData<NewsResponse>(res)
}

// 4. CẬP NHẬT
export const updateNewsApi = async (id: string, payload: NewsRequest): Promise<NewsResponse> => {
  const formData = buildNewsFormData(payload)

  if (payload.deleteThumbnail) {
    formData.append('deleteThumbnail', 'true')
  }

  const res = await api.put<unknown, unknown>(`/news/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return extractData<NewsResponse>(res)
}

// 5. XÓA MỀM
export const softDeleteNewsApi = async (id: string): Promise<ApiResponse<void>> => {
  const res = await api.delete<unknown, unknown>(`/news/soft-delete/${id}`)
  return res as ApiResponse<void>
}

// 6. XÓA VĨNH VIỄN
export const hardDeleteNewsApi = async (id: string): Promise<ApiResponse<void>> => {
  const res = await api.delete<unknown, unknown>(`/news/${id}`)
  return res as ApiResponse<void>
}

// 7. KHÔI PHỤC
export const restoreNewsApi = async (id: string): Promise<ApiResponse<void>> => {
  const res = await api.patch<unknown, unknown>(`/news/restore/${id}`)
  return res as ApiResponse<void>
}

// 8. LẤY DANH SÁCH TRONG THÙNG RÁC
export const getNewsInTrashApi = async (): Promise<NewsResponse[]> => {
  const res = await api.get<unknown, unknown>('/news/trash')
  const result = extractData<NewsResponse[]>(res)
  return Array.isArray(result) ? result : []
}
