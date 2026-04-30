import { api } from '@/utils/axiosCustomize'
import type { MemberInfoResponse, PointHistoryResponse } from './member.type'

// 1. Lấy thông tin thẻ
export const getMyMembershipApi = async () => {
  const res = await api.get<MemberInfoResponse>('/memberships/me')
  return res.data
}

// 2. Lấy lịch sử
export const getPointHistoriesApi = async () => {
  const res = await api.get<PointHistoryResponse[]>('/memberships/me/histories')
  return res.data
}

// 3. Điểm danh - Backend trả về String thông báo thành công
export const checkInApi = async () => {
  const res = await api.post<string>('/memberships/check-in')
  return res.data
}

// 4. Đổi quà
export const exchangeVoucherApi = async (packageCode: string) => {
  const res = await api.post<string>('/memberships/exchange', null, {
    params: { packageCode }
  })
  return res.data
}
