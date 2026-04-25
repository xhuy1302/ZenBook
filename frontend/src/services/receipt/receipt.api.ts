import { api } from '@/utils/axiosCustomize'
import type { PreviewReceiptResponse, ReceiptRequest, ReceiptResponse } from './receipt.type'

// 👉 TẤT CẢ API đều phải có tiền tố /admin/receipts để khớp với Controller và SecurityConfig
const BASE_PATH = '/admin/receipts'

export const getAllReceiptsApi = async (fromDate?: string, toDate?: string) => {
  const params: Record<string, string> = {}

  // Chỉ thêm vào params nếu có giá trị thực
  if (fromDate) params.startDate = fromDate
  if (toDate) params.endDate = toDate

  const res = await api.get<ReceiptResponse[]>('/admin/receipts', { params }) // Nhớ thêm /admin nếu bạn đã đổi ở Security
  return res.data || []
}

export const importReceiptExcelApi = async (file: File, supplierId: string, note?: string) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('supplierId', supplierId)

  if (note?.trim()) {
    formData.append('note', note.trim())
  }

  const res = await api.post<void>(`${BASE_PATH}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export const getReceiptByIdApi = async (id: string) => {
  const res = await api.get<ReceiptResponse>(`${BASE_PATH}/${id}`)
  return res.data
}

export const createReceiptApi = async (payload: ReceiptRequest) => {
  const res = await api.post<ReceiptResponse>(BASE_PATH, payload)
  return res.data
}

export const completeReceiptApi = async (id: string) => {
  const res = await api.put<ReceiptResponse>(`${BASE_PATH}/${id}/complete`)
  return res.data
}

export const cancelReceiptApi = async (id: string) => {
  const res = await api.put<ReceiptResponse>(`${BASE_PATH}/${id}/cancel`)
  return res.data
}

export const previewImportReceiptExcelApi = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await api.post<PreviewReceiptResponse>(`${BASE_PATH}/import-preview`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}
