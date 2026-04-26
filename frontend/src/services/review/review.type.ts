import type { ReviewStatus } from '@/defines/review.enum'

// ==========================================
// COMMON TYPES
// ==========================================

// Đại diện cho Page<T> của Spring Boot trả về
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number // Trang hiện tại (Bắt đầu từ 0)
}

// ==========================================
// 1. ADMIN - REQUEST & RESPONSE TYPES
// ==========================================

export type ReviewFilterRequest = {
  bookId?: string
  rating?: number
  status?: ReviewStatus
  fromDate?: string // Format: YYYY-MM-DD
  toDate?: string // Format: YYYY-MM-DD
  page?: number
  size?: number
}

export type UpdateReviewStatusRequest = {
  status: ReviewStatus
}

export type ReviewReplyRequest = {
  content: string
}

export interface ReviewSummaryResponse {
  id: string
  rating: number
  title: string
  contentSnippet: string
  status: ReviewStatus
  createdAt: string
  bookId: string
  bookTitle: string
  bookThumbnail: string
  userId: string
  userFullName: string
  userAvatar: string
  hasImages: boolean
  isReplied: boolean
}

export interface ReviewDetailResponse {
  id: string
  rating: number
  title: string
  content: string
  status: ReviewStatus
  isVerifiedPurchase: boolean
  createdAt: string
  updatedAt: string
  helpfulVotesCount: number
  user: {
    id: string
    fullName: string
    email: string
    avatar: string
  }
  book: {
    id: string
    title: string
    slug: string
    thumbnail: string
  }
  images: {
    id: string
    imageUrl: string
  }[]
  reply?: {
    id: string
    content: string
    createdAt: string
    updatedAt: string
    repliedBy: {
      id: string
      fullName: string
    }
  } | null
}

export interface ReviewReplyResponse {
  id: string
  reviewId: string
  content: string
  createdAt: string
  updatedAt: string
  repliedById: string
  repliedByFullName: string
}

// ==========================================
// 2. CUSTOMER - REQUEST & RESPONSE TYPES
// ==========================================

export interface ReviewCustomerFilter {
  rating?: number
  hasImage?: boolean
  sortBy?: 'newest' | 'helpful'
}

export interface CreateReviewRequest {
  rating: number
  content?: string
  imageUrls?: string[]
  orderDetailId: string
}

export interface UpdateReviewRequest {
  rating: number
  content?: string
}

export interface HelpfulVoteResponse {
  helpfulVotes: number
  isHelpful: boolean
}

export interface RatingStatsResponse {
  average: number
  count: number
  breakdown: Record<number, number> // Record map từ 1-5 tương ứng với số lượng
}

export interface ReviewImageResponse {
  id: string
  imageUrl: string
}

export interface ReviewResponse {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  content?: string
  images: ReviewImageResponse[]
  reply?: ReviewReplyResponse | null
  helpfulVotes: number
  isHelpfulByMe: boolean // Trạng thái user hiện tại đã vote hữu ích chưa
  createdAt: string
}

export interface PagedReviewResponse {
  reviews: PageResponse<ReviewResponse>
  stats: RatingStatsResponse
}

export interface MyReviewResponse {
  id: string
  rating: number
  content: string
  status: ReviewStatus // 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  helpfulVotes: number
  images: ReviewImageResponse[]

  reply?: ReviewReplyResponse | null
  // Cần thêm thông tin sách và đơn hàng
  bookId: string
  bookTitle: string
  bookSlug: string
  bookThumbnail: string
  orderCode: string // Ví dụ: '#DH-00123'
}

export type MyReviewFilter = {
  status?: ReviewStatus | 'all' // Để lọc tab "Đã duyệt", "Chờ duyệt"
  page?: number
  size?: number
}
