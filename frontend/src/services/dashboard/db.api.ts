import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type { DashboardData } from '../dashboard/db.type' // Điều chỉnh đường dẫn file type nếu cần

export const getDashboardOverviewApi = async (period: string = 'month') => {
  // Thêm params vào config của axios
  const res = await api.get<ApiResponse<DashboardData>>('/admin/dashboard/overview', {
    params: { period }
  })
  return res.data.data
}
export const exportDashboardExcelApi = async (period: string = 'month') => {
  const res = await api.get('/admin/dashboard/export', {
    params: { period }, // 👉 Gửi period lên backend
    responseType: 'blob'
  })
  return res.data
}
