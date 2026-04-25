import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type {
  PublisherCreationRequest,
  PublisherFilterResponse,
  PublisherResponse,
  PublisherUpdateRequest
} from '@/services/publisher/publisher.type' // Đảm bảo import đúng đường dẫn mới

export const getAllPublishersApi = async () => {
  const res = await api.get<ApiResponse<PublisherResponse[]>>('/publishers')
  return res.data.data
}

export const getPublisherByIdApi = async (id: string) => {
  const res = await api.get<ApiResponse<PublisherResponse>>(`/publishers/${id}`)
  return res.data.data
}

export const createPublisherApi = async (payload: PublisherCreationRequest) => {
  const res = await api.post<ApiResponse<PublisherResponse>>('/publishers', payload)
  return res.data.data
}

export const updatePublisherApi = async (id: string, payload: PublisherUpdateRequest) => {
  const res = await api.put<ApiResponse<PublisherResponse>>(`/publishers/${id}`, payload)
  return res.data.data
}

export const deleteSoftPublisherApi = async (id: string) => {
  const res = await api.delete<ApiResponse<void>>(`/publishers/soft-delete/${id}`)
  return res.data
}

export const getAllPublishersInTrashApi = async () => {
  const res = await api.get<ApiResponse<PublisherResponse[]>>('/publishers/trash')
  return res.data.data
}

export const restorePublisherApi = async (id: string) => {
  const res = await api.patch<ApiResponse<void>>(`/publishers/restore/${id}`)
  return res.data
}

export const deleteHardPublisherApi = async (id: string) => {
  const res = await api.delete<ApiResponse<void>>(`/publishers/${id}`)
  return res.data
}

export const getPublishersForFilterApi = async () => {
  const res = await api.get<ApiResponse<PublisherFilterResponse[]>>('/customer/publishers/filter')
  return res.data.data
}
