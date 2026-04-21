import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type {
  UserProfile,
  CustomerProfileUpdateRequest,
  ChangePasswordRequest,
  PhoneUpdateRequest,
  Order,
  Address,
  AddressPayload
} from '@/services/customer/customer.type'

// ── AUTH & ME ────────────────────────────────────────────────────────────────

export const getMeApi = async () => {
  const res = await api.get<ApiResponse<UserProfile>>('/auth/me')
  return res.data.data
}

export const loginApi = async (email: string, password: string) => {
  const res = await api.post<ApiResponse<UserProfile>>('/auth/login', { email, password })
  return res.data.data
}

export const logoutApi = async () => {
  const res = await api.post<ApiResponse<void>>('/auth/logout')
  return res.data
}

// ── PROFILE & SECURITY ───────────────────────────────────────────────────────

export const updateCustomerProfileApi = async (payload: CustomerProfileUpdateRequest) => {
  const res = await api.put<ApiResponse<UserProfile>>('/users/update', payload)
  return res.data.data
}

export const updateCustomerPhoneApi = async (payload: PhoneUpdateRequest) => {
  const res = await api.put<ApiResponse<void>>('/users/phone', payload)
  return res.data
}

export const changeCustomerPasswordApi = async (payload: ChangePasswordRequest) => {
  const res = await api.put<ApiResponse<void>>('/users/change-password', payload)
  return res.data
}

export const uploadCustomerAvatarApi = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post<ApiResponse<{ avatarUrl: string }>>('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return res.data.data
}

// ── ORDERS ───────────────────────────────────────────────────────────────────

export const getMyOrdersApi = async () => {
  const res = await api.get<ApiResponse<Order[]>>('/orders/my')
  return res.data.data
}

// ── ADDRESSES ────────────────────────────────────────────────────────────────

export const getAddressesApi = async () => {
  const res = await api.get<ApiResponse<Address[]>>('/users/addresses')
  return res.data.data
}

export const createAddressApi = async (payload: AddressPayload) => {
  const res = await api.post<ApiResponse<Address>>('/users/addresses', payload)
  return res.data.data
}

export const updateAddressApi = async (id: string, payload: AddressPayload) => {
  const res = await api.put<ApiResponse<Address>>(`/users/addresses/${id}`, payload)
  return res.data.data
}

export const deleteAddressApi = async (id: string) => {
  const res = await api.delete<ApiResponse<void>>(`/users/addresses/${id}`)
  return res.data
}

export const setDefaultAddressApi = async (id: string) => {
  const res = await api.put<ApiResponse<void>>(`/users/addresses/${id}/default`)
  return res.data
}
