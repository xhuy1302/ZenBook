import { MemberTier, RewardPackage } from '@defines/enum.membership'

export type BackendTier = 'member' | 'silver' | 'gold' | 'platinum' | 'diamond'

export interface MemberInfoResponse {
  name: string
  memberId: string
  points: number
  tier: BackendTier
  totalOrders: number
  memberSince: string
  yearPoints: number
  totalSaved: number
  totalSpending: number
  currentStreak: number
  checkedInToday: boolean // 👉 Đã sửa thành checkedInToday
}

export interface PointHistoryResponse {
  id: string
  title: string
  date: string
  points: number
  type: 'earn' | 'redeem' | 'refund' | 'bonus'
}

export const MemberTierConfig: Record<
  MemberTier,
  {
    minSpending: number
    pointMultiplier: number
    displayName: string
  }
> = {
  MEMBER: { minSpending: 0, pointMultiplier: 1.0, displayName: 'Đồng' },
  SILVER: { minSpending: 2000000, pointMultiplier: 1.05, displayName: 'Bạc' },
  GOLD: { minSpending: 5000000, pointMultiplier: 1.1, displayName: 'Vàng' },
  PLATINUM: { minSpending: 10000000, pointMultiplier: 1.2, displayName: 'Bạch Kim' },
  DIAMOND: { minSpending: 20000000, pointMultiplier: 1.3, displayName: 'Kim Cương' }
}

export const RewardPackageConfig: Record<
  RewardPackage,
  {
    requiredPoints: number
    discountValue: number
    description: string
  }
> = {
  VOUCHER_20K: { requiredPoints: 500, discountValue: 20000, description: 'Voucher giảm 20k' },
  VOUCHER_50K: { requiredPoints: 1000, discountValue: 50000, description: 'Voucher giảm 50k' },
  VOUCHER_120K: { requiredPoints: 2500, discountValue: 120000, description: 'Voucher giảm 120k' },
  FREESHIP_VIP: { requiredPoints: 5000, discountValue: 35000, description: 'Miễn phí vận chuyển' }
}
