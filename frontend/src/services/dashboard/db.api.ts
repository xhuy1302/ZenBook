import { api } from '@/utils/axiosCustomize'
import type { DashboardSummary } from './db.type'

export const getDashboardSummaryApi = async (): Promise<DashboardSummary> => {
  // 1. Dùng <unknown> thay vì <any> để ESLint không báo lỗi gạch đỏ
  const res = await api.get<unknown>('/admin/dashboard/summary')

  // 2. Ép kiểu tạm sang một Object chung (Record) để TypeScript cho phép chấm (dot) vào các thuộc tính
  const responseObj = res as unknown as Record<string, unknown>

  // TRƯỜNG HỢP 1: Axios interceptor đã tự bóc vỏ (responseObj chính là data)
  if (responseObj && responseObj.totalRevenue !== undefined) {
    // Ép vòng qua unknown để xóa lỗi "Conversion of type..."
    return responseObj as unknown as DashboardSummary
  }

  // Nếu res có chứa thuộc tính 'data' (Axios chuẩn)
  if (responseObj && responseObj.data) {
    const innerData = responseObj.data as Record<string, unknown>

    // TRƯỜNG HỢP 2: Axios nguyên bản chưa bóc vỏ
    if (innerData && innerData.totalRevenue !== undefined) {
      return innerData as unknown as DashboardSummary
    }

    // TRƯỜNG HỢP 3: Bị bọc 2 lớp (res.data.data) kiểu ApiResponse
    if (innerData && innerData.data) {
      return innerData.data as unknown as DashboardSummary
    }
  }

  // Phương án cuối cùng, luôn ép qua unknown trước
  return responseObj as unknown as DashboardSummary
}
