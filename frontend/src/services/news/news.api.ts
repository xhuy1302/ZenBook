import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type {
  NewsPageResponse,
  NewsQueryParams,
  NewsRequest,
  NewsResponse,
  NewsStatsResponse
} from './news.type'
import type { CategoryResponse } from '../category/category.type'

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────
const buildNewsFormData = (payload: NewsRequest) => {
  const formData = new FormData()

  formData.append('title', payload.title)
  formData.append('content', payload.content)

  if (payload.summary) formData.append('summary', payload.summary)
  if (payload.status) formData.append('status', payload.status)
  if (payload.categoryId) formData.append('categoryId', payload.categoryId)
  if (payload.metaTitle) formData.append('metaTitle', payload.metaTitle)
  if (payload.metaDescription) formData.append('metaDescription', payload.metaDescription)

  payload.tagIds?.forEach((id) => formData.append('tagIds', id))
  payload.bookIds?.forEach((id) => formData.append('bookIds', id))

  if (payload.thumbnailFile) {
    formData.append('thumbnailFile', payload.thumbnailFile)
  }

  return formData
}

const extractData = <T>(res: unknown): T => {
  const response = res as { data?: T | { data?: T } }
  const inner = response.data as { data?: T }

  return (inner?.data !== undefined ? inner.data : response.data) as T
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin APIs
// ─────────────────────────────────────────────────────────────────────────────
export const getAllNewsApi = async (): Promise<NewsResponse[]> => {
  const res = await api.get('/news')
  const result = extractData<NewsResponse[]>(res)
  return Array.isArray(result) ? result : []
}

export const getNewsByIdApi = async (id: string): Promise<NewsResponse> => {
  const res = await api.get(`/news/${id}`)
  return extractData<NewsResponse>(res)
}

export const createNewsApi = async (payload: NewsRequest): Promise<NewsResponse> => {
  const formData = buildNewsFormData(payload)

  const res = await api.post('/news', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

  return extractData<NewsResponse>(res)
}

export const updateNewsApi = async (id: string, payload: NewsRequest): Promise<NewsResponse> => {
  const formData = buildNewsFormData(payload)

  if (payload.deleteThumbnail) {
    formData.append('deleteThumbnail', 'true')
  }

  const res = await api.put(`/news/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

  return extractData<NewsResponse>(res)
}

export const softDeleteNewsApi = async (id: string): Promise<ApiResponse<void>> => {
  return api.delete(`/news/soft-delete/${id}`)
}

export const hardDeleteNewsApi = async (id: string): Promise<ApiResponse<void>> => {
  return api.delete(`/news/${id}`)
}

export const restoreNewsApi = async (id: string): Promise<ApiResponse<void>> => {
  return api.patch(`/news/restore/${id}`)
}

export const getNewsInTrashApi = async (): Promise<NewsResponse[]> => {
  const res = await api.get('/news/trash')
  const result = extractData<NewsResponse[]>(res)
  return Array.isArray(result) ? result : []
}

// ─────────────────────────────────────────────────────────────────────────────
// Public APIs
// ─────────────────────────────────────────────────────────────────────────────
export const getPublicNewsApi = async (params: NewsQueryParams): Promise<NewsPageResponse> => {
  const res = await api.get('/public/news', { params })
  return extractData<NewsPageResponse>(res)
}

// ⭐ NEW: lấy bài theo slug
export const getPublicNewsBySlugApi = async (slug: string): Promise<NewsResponse> => {
  const res = await api.get(`/public/news/slug/${slug}`)
  return extractData<NewsResponse>(res)
}

export const getNewsStatsApi = async (): Promise<NewsStatsResponse> => {
  const res = await api.get('/public/news/stats')
  return extractData<NewsStatsResponse>(res)
}

// ❌ bỏ endpoint view vì backend tự tăng khi getBySlug
// export const incrementViewCountApi = ...

export const getPublicCategoriesApi = async (): Promise<CategoryResponse[]> => {
  const res = await api.get('/categories')
  const result = extractData<CategoryResponse[]>(res)
  return Array.isArray(result) ? result : []
}
