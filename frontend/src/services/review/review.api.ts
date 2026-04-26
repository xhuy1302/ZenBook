import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type {
  ReviewFilterRequest,
  UpdateReviewStatusRequest,
  ReviewReplyRequest,
  ReviewSummaryResponse,
  ReviewDetailResponse,
  ReviewReplyResponse,
  PageResponse
} from '@/services/review/review.type'

// 1. Lấy danh sách đánh giá (Có phân trang & bộ lọc)
export const getAdminReviewsApi = async (params: ReviewFilterRequest) => {
  const res = await api.get<ApiResponse<PageResponse<ReviewSummaryResponse>>>('/admin/reviews', {
    params
  })
  return res.data.data
}

// 2. Xem chi tiết đánh giá
export const getReviewDetailApi = async (reviewId: string) => {
  const res = await api.get<ApiResponse<ReviewDetailResponse>>(`/admin/reviews/${reviewId}`)
  return res.data.data
}

// 3. Cập nhật trạng thái (Duyệt / Ẩn / Từ chối)
export const updateReviewStatusApi = async (
  reviewId: string,
  payload: UpdateReviewStatusRequest
) => {
  const res = await api.patch<ApiResponse<ReviewDetailResponse>>(
    `/admin/reviews/${reviewId}/status`,
    payload
  )
  return res.data.data
}

// 4. Admin/Staff trả lời đánh giá
export const replyToReviewApi = async (reviewId: string, payload: ReviewReplyRequest) => {
  const res = await api.post<ApiResponse<ReviewReplyResponse>>(
    `/admin/reviews/${reviewId}/replies`,
    payload
  )
  return res.data.data
}

// 5. Cập nhật câu trả lời
export const updateReplyApi = async (replyId: string, payload: ReviewReplyRequest) => {
  const res = await api.put<ApiResponse<ReviewReplyResponse>>(
    `/admin/reviews/replies/${replyId}`,
    payload
  )
  return res.data.data
}

// 6. Xóa câu trả lời
export const deleteReplyApi = async (replyId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/admin/reviews/replies/${replyId}`)
  return res.data
}
