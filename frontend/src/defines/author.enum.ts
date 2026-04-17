export const AuthorStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED'
} as const

export type AuthorStatus = (typeof AuthorStatus)[keyof typeof AuthorStatus]
