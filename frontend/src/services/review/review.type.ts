import type { ReviewStatus } from '@/defines/review.enum'

// ==========================================
// REQUEST TYPES
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

// ==========================================
// RESPONSE TYPES
// ==========================================

// Đại diện cho Page<T> của Spring Boot trả về
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number // Trang hiện tại (Bắt đầu từ 0)
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
