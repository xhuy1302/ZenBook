import { api } from '@/utils/axiosCustomize'
import type { ReceiptRequest, ReceiptResponse } from './receipt.type'

export const getAllReceiptsApi = async (fromDate?: string, toDate?: string) => {
  // Định nghĩa params là một object có key là string và value là string
  const params: Record<string, string> = {}

  if (fromDate?.trim()) {
    params.startDate = fromDate
  }
  if (toDate?.trim()) {
    params.endDate = toDate
  }

  const res = await api.get<ReceiptResponse[]>('/receipts', { params })
  return res.data || []
}

export const importReceiptExcelApi = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  // Lưu ý: Backend trả về ResponseEntity<Void> (200 OK không body)
  // nên res.data ở đây sẽ rỗng
  const res = await api.post<void>('/receipts/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export const getReceiptByIdApi = async (id: string) => {
  const res = await api.get<ReceiptResponse>(`/receipts/${id}`)
  return res.data
}

export const createReceiptApi = async (payload: ReceiptRequest) => {
  const res = await api.post<ReceiptResponse>('/receipts', payload)
  return res.data
}

export const completeReceiptApi = async (id: string) => {
  const res = await api.put<ReceiptResponse>(`/receipts/${id}/complete`)
  return res.data
}

export const cancelReceiptApi = async (id: string) => {
  const res = await api.put<ReceiptResponse>(`/receipts/${id}/cancel`)
  return res.data
}
