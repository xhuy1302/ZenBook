import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type {
  SupplierCreationRequest,
  SupplierResponse,
  SupplierUpdateRequest
} from '@/services/supplier/supplier.type'

export const getAllSuppliersApi = async () => {
  const res = await api.get<ApiResponse<SupplierResponse[]>>('/suppliers')
  return res.data.data
}

export const getSupplierByIdApi = async (id: string) => {
  const res = await api.get<ApiResponse<SupplierResponse>>(`/suppliers/${id}`)
  return res.data.data
}

export const createSupplierApi = async (payload: SupplierCreationRequest) => {
  const res = await api.post<ApiResponse<SupplierResponse>>('/suppliers', payload)
  return res.data.data
}

export const updateSupplierApi = async (id: string, payload: SupplierUpdateRequest) => {
  const res = await api.put<ApiResponse<SupplierResponse>>(`/suppliers/${id}`, payload)
  return res.data.data
}

export const deleteSoftSupplierApi = async (id: string) => {
  const res = await api.delete<ApiResponse<void>>(`/suppliers/soft-delete/${id}`)
  return res.data
}

export const getAllSupplierInTrashApi = async () => {
  const res = await api.get<ApiResponse<SupplierResponse[]>>('/suppliers/trash')
  return res.data.data
}

export const restoreSupplierApi = async (id: string) => {
  const res = await api.patch<ApiResponse<void>>(`/suppliers/restore/${id}`)
  return res.data
}

export const deleteHardSupplierApi = async (id: string) => {
  const res = await api.delete<ApiResponse<void>>(`/suppliers/${id}`)
  return res.data
}
