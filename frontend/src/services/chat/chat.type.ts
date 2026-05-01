// ─── LOẠI TIN NHẮN ──────────────────────────────────────────────────────────
// Bổ sung PRODUCT (Admin gửi thẻ sách) và ORDER (Hệ thống tự động báo đơn)
export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'PRODUCT' | 'ORDER'

// 👉 RECEIVED -> DELIVERED để khớp 100% với Enum phía Spring Boot của bạn
export type MessageStatus = 'SENT' | 'DELIVERED' | 'SEEN'

// ─── TRẠNG THÁI PHÒNG CHAT ───────────────────────────────────────────────────
export type RoomStatus = 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED'

// ─── DATA RESPONSE ───────────────────────────────────────────────────────────
export interface ChatMessageResponse {
  id: string
  roomId: string
  senderId: string
  receiverId: string
  content: string // Lưu ý: Với PRODUCT/ORDER, content sẽ là chuỗi JSON
  messageType: MessageType
  status: MessageStatus
  createdAt: string
}

export interface ChatRoomResponse {
  id: string
  userId: string
  adminId: string | null
  createdAt: string
  updatedAt: string

  // Thông tin Khách hàng & SaaS
  customerName?: string
  customerEmail?: string
  customerAvatar?: string
  customerTier?: string
  unreadCount: number
  priority?: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'

  status: RoomStatus
}

// ─── DATA REQUEST ────────────────────────────────────────────────────────────
export interface ChatMessageRequest {
  senderId: string
  receiverId?: string
  content: string // Khi gửi PRODUCT, bạn sẽ JSON.stringify(productObj) vào đây
  messageType: MessageType
  isAdmin: boolean
}
