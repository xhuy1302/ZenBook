import type { DiscountType, PromotionStatus } from '@/defines/promotion.enum'

/**
 * Khớp với static class AuthorDto trong Java
 */
export interface AuthorDto {
  id: string
  name: string
}

/**
 * Khớp với static class PromotionBookDto trong Java
 */
export interface PromotionBookDto {
  id: string
  title: string
  thumbnail: string
  originalPrice: number
  salePrice: number

  // 👉 THÊM MỚI 4 TRƯỜNG NÀY ĐỂ KHỚP VỚI BACKEND
  stockQuantity: number
  rating: number
  reviews: number
  authors: AuthorDto[]
}

/**
 * Khớp với PromotionResponse.java
 */
export interface PromotionResponse {
  id: string
  name: string
  description: string | null
  discountType: DiscountType
  discountValue: number
  startDate: string
  endDate: string
  status: PromotionStatus
  createdAt: string
  updatedAt?: string | null
  // Backend trả về danh sách sách rút gọn
  books: PromotionBookDto[]
}

/**
 * Dùng cho Payload gửi lên API POST/PUT
 */
export type PromotionRequest = {
  name: string
  description?: string | null
  discountType: DiscountType
  discountValue: number
  startDate: string
  endDate: string
  bookIds: string[]
}
