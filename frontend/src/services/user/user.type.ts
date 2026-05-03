import type { UserStatus } from '@/defines/user.enum'

// 👉 THÊM INTERFACE NÀY ĐỂ HỨNG DỮ LIỆU TỪ BACKEND
export interface MemberInfoResponse {
  tier: string
  availablePoints: number
  totalSpending: number
}

export interface UserResponse {
  id: string
  username: string
  email: string
  fullName?: string | null
  phone?: string | null
  avatar?: string | null
  status: UserStatus
  roles: string[]
  createdAt: string
  updatedAt: string
  deletedAt?: string | null

  // 👉 THÊM TRƯỜNG MEMBERSHIP VÀO ĐÂY
  // Để dấu ? vì có thể có trường hợp User chưa có thông tin membership (null)
  membership?: MemberInfoResponse | null
}

export type UpdateUserRequest = {
  username: string
  fullName?: string | null
  phone?: string | null
  avatar?: string | null
  status: UserStatus
  roles?: string[]
}

export type UpdateUserResponse = {
  id: string
  username: string
  email: string
  fullName?: string | null
  phone?: string | null
  avatar?: string | null
  status: UserStatus
}

export type SignUpRequest = {
  username: string
  email: string
  password: string
}
