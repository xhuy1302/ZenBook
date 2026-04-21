export const NewsStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  HIDDEN: 'HIDDEN'
} as const

export type NewsStatus = (typeof NewsStatus)[keyof typeof NewsStatus]
