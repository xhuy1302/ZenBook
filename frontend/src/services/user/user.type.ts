import type { UserStatus } from '@/defines/user.enum'

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
