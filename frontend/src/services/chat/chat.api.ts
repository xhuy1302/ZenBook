import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type { ChatMessageResponse, ChatRoomResponse, MessageType, RoomStatus } from './chat.type'

/**
 * Lấy lịch sử tin nhắn (Bóc lớp .data.data)
 */
export const getChatHistoryApi = async (roomId: string, page = 0, size = 50) => {
  const res = await api.get<ApiResponse<ChatMessageResponse[]>>(
    `/support-chat/rooms/${roomId}/history`,
    { params: { page, size } }
  )
  return res.data.data // ✅ Chuẩn bài: Trả về mảng tin nhắn
}

/**
 * Lấy thông tin phòng chat dựa trên UserId
 */
export const getRoomByUserIdApi = async (userId: string) => {
  const res = await api.get<ApiResponse<ChatRoomResponse>>(`/support-chat/rooms/user/${userId}`)
  return res.data.data // ✅ Chuẩn bài: Trả về Object ChatRoom hoặc null
}

/**
 * Lấy toàn bộ danh sách phòng chat cho Admin
 */
export const getAdminRoomsApi = async () => {
  const res = await api.get<ApiResponse<ChatRoomResponse[]>>('/support-chat/rooms/admin/all')
  return res.data.data // ✅ Chuẩn bài: Trả về mảng phòng chat cho Admin map()
}

/**
 * Upload Media (Ảnh/Video)
 */
export const uploadChatMediaApi = (
  file: File,
  senderId: string,
  receiverId: string | undefined,
  isAdmin: boolean,
  messageType: MessageType
) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('senderId', senderId)
  formData.append('receiverId', receiverId || '')
  formData.append('isAdmin', String(isAdmin))
  formData.append('messageType', messageType)

  // Trả về cả bọc để component tự xử lý logic loading/toast
  return api.post<ApiResponse<string>>('/support-chat/files/upload-media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 👉 THÊM MỚI: Đánh dấu tin nhắn đã đọc (Seen)
 */
export const markMessagesAsSeenApi = async (roomId: string, userId: string) => {
  const res = await api.put<ApiResponse<void>>(`/support-chat/rooms/${roomId}/seen`, null, {
    params: { userId }
  })
  return res.data
}

export const updateRoomStatusApi = async (roomId: string, status: RoomStatus) => {
  const res = await api.put<ApiResponse<void>>(`/support-chat/rooms/${roomId}/status`, null, {
    params: { status }
  })
  return res.data
}
