import type { DiscountType, PromotionStatus } from '@/defines/promotion.enum'

/**
 * DTO Tác giả (Khớp với AuthorDto trong Java)
 */
export interface AuthorDto {
  id: string
  name: string
}

/**
 * DTO Danh mục (Sử dụng CategoryFilterResponse từ Backend)
 */
export interface CategoryFilterResponse {
  id: string
  name: string // 👉 Đã sửa thành name thay vì categoryName
  count: number
}

/**
 * DTO Sách trong chương trình khuyến mãi
 */
export interface PromotionBookDto {
  id: string
  title: string
  slug: string
  thumbnail: string
  originalPrice: number
  salePrice: number
  soldQuantity: number
  stockQuantity: number
  rating: number
  reviews: number
  authors: AuthorDto[]
  categories: CategoryFilterResponse[] // 👉 Đã trỏ tới DTO mới
}

/**
 * DTO Phản hồi từ API Promotion (Khớp với PromotionResponse.java)
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
  books: PromotionBookDto[]
}

/**
 * DTO Gửi dữ liệu lên Server (Payload)
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
