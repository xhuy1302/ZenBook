import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type { ShippingFeeRequest, ShippingFeeResponse } from './shipping.type'

export const calculateShippingFeeApi = async (payload: ShippingFeeRequest) => {
  const res = await api.post<ApiResponse<ShippingFeeResponse>>('/shipping/calculate', payload)
  return res.data
}
