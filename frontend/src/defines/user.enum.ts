export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  STAFF: 'STAFF'
} as const

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED'
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]
