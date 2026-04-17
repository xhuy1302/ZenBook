export const PublisherStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED'
} as const

export type PublisherStatus = (typeof PublisherStatus)[keyof typeof PublisherStatus]
