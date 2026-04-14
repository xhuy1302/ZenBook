export const DiscountType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT'
} as const

export const PromotionStatus = {
  SCHEDULED: 'SCHEDULED',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  EXPIRED: 'EXPIRED'
} as const

export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType]
export type PromotionStatus = (typeof PromotionStatus)[keyof typeof PromotionStatus]
