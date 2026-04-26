import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type {
  // Admin Types
  ReviewFilterRequest,
  UpdateReviewStatusRequest,
  ReviewReplyRequest,
  ReviewSummaryResponse,
  ReviewDetailResponse,
  ReviewReplyResponse,
  PageResponse,
  // Customer Types
  ReviewCustomerFilter,
  ReviewResponse,
  CreateReviewRequest,
  UpdateReviewRequest,
  HelpfulVoteResponse,
  RatingStatsResponse,
  MyReviewFilter,
  MyReviewResponse
} from '@/services/review/review.type'

// =========================================================================
// 1. ADMIN APIs
// =========================================================================

// Lấy danh sách đánh giá (Có phân trang & bộ lọc)
export const getAdminReviewsApi = async (params: ReviewFilterRequest) => {
  const res = await api.get<ApiResponse<PageResponse<ReviewSummaryResponse>>>('/admin/reviews', {
    params
  })
  return res.data.data
}

// Xem chi tiết đánh giá
export const getReviewDetailApi = async (reviewId: string) => {
  const res = await api.get<ApiResponse<ReviewDetailResponse>>(`/admin/reviews/${reviewId}`)
  return res.data.data
}

// Cập nhật trạng thái (Duyệt / Ẩn / Từ chối)
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

// Admin/Staff trả lời đánh giá
export const replyToReviewApi = async (reviewId: string, payload: ReviewReplyRequest) => {
  const res = await api.post<ApiResponse<ReviewReplyResponse>>(
    `/admin/reviews/${reviewId}/replies`,
    payload
  )
  return res.data.data
}

// Cập nhật câu trả lời
export const updateReplyApi = async (replyId: string, payload: ReviewReplyRequest) => {
  const res = await api.put<ApiResponse<ReviewReplyResponse>>(
    `/admin/reviews/replies/${replyId}`,
    payload
  )
  return res.data.data
}

// Xóa câu trả lời
export const deleteReplyApi = async (replyId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/admin/reviews/replies/${replyId}`)
  return res.data
}

// =========================================================================
// 2. CUSTOMER APIs (Giao diện mua hàng)
// =========================================================================

// Lấy danh sách Review của sách (Public/Có đăng nhập đều gọi được)
export const getCustomerReviewsApi = async (bookId: string, params?: ReviewCustomerFilter) => {
  const res = await api.get<ApiResponse<PageResponse<ReviewResponse>>>(`/books/${bookId}/reviews`, {
    params
  })
  return res.data.data
}

// Lấy thống kê số sao của sách (cho thanh Breakdown)
export const getReviewStatsApi = async (bookId: string) => {
  const res = await api.get<ApiResponse<RatingStatsResponse>>(`/books/${bookId}/reviews/stats`)
  return res.data.data
}

// Kiểm tra khách hàng hiện tại đã đánh giá sách này chưa (Dùng để quyết định có hiện nút Đánh giá hay không)
export const checkUserReviewedApi = async (bookId: string) => {
  const res = await api.get<ApiResponse<boolean>>(`/books/${bookId}/reviews/me`)
  return res.data.data
}

// Gửi bài đánh giá mới
export const createCustomerReviewApi = async (bookId: string, payload: CreateReviewRequest) => {
  const res = await api.post<ApiResponse<ReviewDetailResponse>>(`/books/${bookId}/reviews`, payload)
  return res.data.data
}

// Sửa bài đánh giá (Khách hàng tự sửa)
export const updateCustomerReviewApi = async (reviewId: string, payload: UpdateReviewRequest) => {
  const res = await api.put<ApiResponse<ReviewDetailResponse>>(`/reviews/${reviewId}`, payload)
  return res.data.data
}

// Xóa bài đánh giá (Khách hàng tự xóa)
export const deleteCustomerReviewApi = async (reviewId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/reviews/${reviewId}`)
  return res.data
}

// Nhấn/Bỏ nhấn "Hữu ích"
export const toggleHelpfulVoteApi = async (reviewId: string) => {
  const res = await api.post<ApiResponse<HelpfulVoteResponse>>(`/reviews/${reviewId}/helpful`)
  return res.data.data
}

// Upload ảnh Media lên S3 cho đánh giá
export const uploadReviewMediaApi = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await api.post<ApiResponse<string>>('/reviews/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return res.data.data // Trả về url dạng string từ S3
}

// Lấy lịch sử đánh giá cá nhân của user đang đăng nhập
export const getMyReviewsApi = async (params?: MyReviewFilter) => {
  const res = await api.get<ApiResponse<PageResponse<MyReviewResponse>>>('/reviews/me', {
    params
  })
  return res.data.data
}
