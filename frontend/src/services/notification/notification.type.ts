export type NotificationType =
  | 'ORDER'
  | 'PROMOTION'
  | 'MEMBERSHIP'
  | 'SYSTEM'
  | 'INTERACTION'
  | 'WISHLIST'

export interface NotificationResponse {
  id: string
  type: NotificationType
  title: string
  content: string
  link: string
  read: boolean
  createdAt: string
}
