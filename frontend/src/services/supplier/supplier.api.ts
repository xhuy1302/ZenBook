import { api } from '@/utils/axiosCustomize'
import type {
  SupplierResponse,
  SupplierCreationRequest,
  SupplierUpdateRequest,
  SupplierFilterResponse
} from './supplier.type'

// Base URL khớp với @RequestMapping("/api/v1/admin/suppliers") ở Backend
const BASE_URL = '/admin/suppliers'

// 1. LẤY DANH SÁCH (Backend trả về thẳng mảng [{}, {}])
export const getAllSuppliersApi = async () => {
  const res = await api.get<SupplierResponse[]>(BASE_URL)
  return res.data ?? [] // res.data chính là mảng JSON bạn đã gửi
}

// 2. LẤY CHI TIẾT
export const getSupplierByIdApi = async (id: string) => {
  const res = await api.get<SupplierResponse>(`${BASE_URL}/${id}`)
  return res.data
}

// 3. TẠO MỚI
export const createSupplierApi = async (payload: SupplierCreationRequest) => {
  const res = await api.post<SupplierResponse>(BASE_URL, payload)
  return res.data
}

// 4. CẬP NHẬT
export const updateSupplierApi = async (id: string, payload: SupplierUpdateRequest) => {
  const res = await api.put<SupplierResponse>(`${BASE_URL}/${id}`, payload)
  return res.data
}

// 5. XÓA MỀM
export const softDeleteSupplierApi = async (id: string) => {
  const res = await api.delete<void>(`${BASE_URL}/${id}`)
  return res.data
}

// 6. LẤY DANH SÁCH TRONG THÙNG RÁC
export const getSuppliersInTrashApi = async () => {
  const res = await api.get<SupplierResponse[]>(`${BASE_URL}/trash`)
  return res.data ?? []
}

// 7. KHÔI PHỤC TỪ THÙNG RÁC
export const restoreSupplierApi = async (id: string) => {
  const res = await api.patch<void>(`${BASE_URL}/${id}/restore`)
  return res.data
}

// 8. XÓA VĨNH VIỄN
export const hardDeleteSupplierApi = async (id: string) => {
  const res = await api.delete<void>(`${BASE_URL}/${id}/hard-delete`)
  return res.data
}

// 9. LẤY DATA BỘ LỌC
export const getSuppliersForFilterApi = async () => {
  const res = await api.get<SupplierFilterResponse[]>(`${BASE_URL}/filter`)
  return res.data ?? []
}
