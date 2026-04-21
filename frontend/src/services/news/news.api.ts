import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type { NewsRequest, NewsResponse } from './news.type'

// Helper đóng gói JSON thành FormData để gửi kèm File ảnh
const buildNewsFormData = (payload: NewsRequest) => {
  const formData = new FormData()

  // Nạp các trường text cơ bản
  formData.append('title', payload.title)
  formData.append('content', payload.content)
  if (payload.summary) formData.append('summary', payload.summary)
  if (payload.status) formData.append('status', payload.status)
  if (payload.categoryId) formData.append('categoryId', payload.categoryId)
  if (payload.metaTitle) formData.append('metaTitle', payload.metaTitle)
  if (payload.metaDescription) formData.append('metaDescription', payload.metaDescription)

  // Xử lý mảng ID (Gửi lên Spring Boot theo dạng mảng)
  if (payload.tagIds && payload.tagIds.length > 0) {
    payload.tagIds.forEach((id) => formData.append('tagIds', id))
  }
  if (payload.bookIds && payload.bookIds.length > 0) {
    payload.bookIds.forEach((id) => formData.append('bookIds', id))
  }

  // File ảnh bìa
  if (payload.thumbnailFile) {
    formData.append('thumbnailFile', payload.thumbnailFile)
  }

  return formData
}

export const getAllNewsApi = async () => {
  const res = await api.get<ApiResponse<NewsResponse[]>>('/news')
  return res.data.data
}

export const getNewsByIdApi = async (id: string) => {
  const res = await api.get<ApiResponse<NewsResponse>>(`/news/${id}`)
  return res.data.data
}

export const createNewsApi = async (payload: NewsRequest) => {
  const formData = buildNewsFormData(payload)
  const res = await api.post<ApiResponse<NewsResponse>>('/news', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data.data
}

export const updateNewsApi = async (id: string, payload: NewsRequest) => {
  const formData = buildNewsFormData(payload)

  // Cờ báo Backend xóa ảnh cũ nếu Admin yêu cầu
  if (payload.deleteThumbnail) {
    formData.append('deleteThumbnail', 'true')
  }

  const res = await api.put<ApiResponse<NewsResponse>>(`/news/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data.data
}

export const softDeleteNewsApi = async (id: string) => {
  const res = await api.delete<ApiResponse<void>>(`/news/soft-delete/${id}`)
  return res.data
}

export const hardDeleteNewsApi = async (id: string) => {
  const res = await api.delete<ApiResponse<void>>(`/news/${id}`)
  return res.data
}

export const restoreNewsApi = async (id: string) => {
  const res = await api.patch<ApiResponse<void>>(`/news/restore/${id}`)
  return res.data
}

export const getNewsInTrashApi = async () => {
  const res = await api.get<ApiResponse<NewsResponse[]>>('/news/trash')
  return res.data.data
}
