import type { SupplierStatus } from '@/defines/supplier.enum'

export interface SupplierResponse {
  id: string
  name: string
  contactName?: string | null
  taxCode?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  description?: string | null
  status: SupplierStatus
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type SupplierCreationRequest = {
  name: string
  contactName?: string | null
  taxCode?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  description?: string | null
}

export type SupplierUpdateRequest = SupplierCreationRequest & {
  status: SupplierStatus
}

export interface SupplierFilterResponse {
  id: string
  name: string
  count: number // Dùng để đếm số lượng Phiếu nhập (Receipts) của Nhà cung cấp này
}
