// ─── enum.membership.ts ───────────────────────────────────────────────────────

export const MemberTier = {
  MEMBER: 'MEMBER',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM',
  DIAMOND: 'DIAMOND'
} as const

export type MemberTier = (typeof MemberTier)[keyof typeof MemberTier]

export const PointTransactionType = {
  EARN: 'EARN',
  REDEEM: 'REDEEM',
  REFUND: 'REFUND',
  BONUS: 'BONUS'
} as const

export type PointTransactionType = (typeof PointTransactionType)[keyof typeof PointTransactionType]

export const RewardPackage = {
  VOUCHER_20K: 'VOUCHER_20K',
  VOUCHER_50K: 'VOUCHER_50K',
  VOUCHER_120K: 'VOUCHER_120K',
  FREESHIP_VIP: 'FREESHIP_VIP'
} as const

export type RewardPackage = (typeof RewardPackage)[keyof typeof RewardPackage]
