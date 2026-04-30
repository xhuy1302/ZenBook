import { CouponStatus, CouponType, DiscountType } from '@/defines/coupon.enum'

export interface CouponResponse {
  id: string
  code: string
  discountType: DiscountType
  discountValue: number
  maxDiscountAmount: number | null
  minOrderValue: number
  usageLimit: number | null
  usedCount: number
  maxUsagePerUser: number

  userId: string | null
  categoryId: string | null

  startDate: string
  endDate: string
  status: CouponStatus
  couponType: CouponType

  calculatedDiscount?: number // Trường này chỉ có giá trị khi gọi API Validate ở giỏ hàng

  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface CouponRequest {
  code: string
  discountType: DiscountType
  discountValue: number
  maxDiscountAmount?: number | null
  minOrderValue: number
  usageLimit?: number | null
  maxUsagePerUser: number
  couponType: CouponType
  userId?: string | null
  categoryId?: string | null

  startDate: string
  endDate: string
  status: CouponStatus
}

export interface CouponValidateRequest {
  code: string
  orderTotal: number
  couponType: CouponType
  categoryIdsInCart?: string[]
  currentUserId?: string
}
