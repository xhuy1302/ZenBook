export const DiscountType = {
  PERCENTAGE: 'PERCENTAGE', // Giảm theo %
  FIXED_AMOUNT: 'FIXED_AMOUNT' // Giảm tiền mặt
} as const

export const CouponStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED'
} as const

export const CouponType = {
  ORDER: 'ORDER',
  SHIPPING: 'SHIPPING'
} as const

export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType]
export type CouponStatus = (typeof CouponStatus)[keyof typeof CouponStatus]
export type CouponType = (typeof CouponType)[keyof typeof CouponType]
