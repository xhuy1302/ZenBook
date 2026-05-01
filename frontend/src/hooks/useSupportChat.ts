import { useEffect, useRef, useState, useCallback } from 'react'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import type {
  ChatMessageResponse,
  ChatMessageRequest,
  RoomStatus,
  MessageType
} from '@/services/chat/chat.type'
export const useSupportChat = (userId: string) => {
  const [messages, setMessages] = useState<ChatMessageResponse[]>([])
  const [roomStatusLive, setRoomStatusLive] = useState<RoomStatus | null>(null)
  const stompClient = useRef<Stomp.Client | null>(null)

  // ─── KẾT NỐI WEBSOCKET ──────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return

    const socket = new SockJS('http://localhost:8080/ws-support')
    const client = Stomp.over(socket)
    client.debug = () => {}

    client.connect({}, () => {
      // 1. Nhận tin nhắn mới (Cả TEXT, IMAGE, PRODUCT, ORDER...)
      client.subscribe(`/topic/messages.${userId}`, (payload) => {
        const newMessage: ChatMessageResponse = JSON.parse(payload.body)
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev
          return [...prev, newMessage]
        })
      })

      // 2. Lắng nghe sự kiện "Đã xem"
      client.subscribe(`/topic/messages.${userId}.seen`, (payload) => {
        const roomId = payload.body
        setMessages((prev) =>
          prev.map((msg) =>
            msg.roomId === roomId && msg.senderId === userId ? { ...msg, status: 'SEEN' } : msg
          )
        )
      })

      // 3. Lắng nghe cập nhật trạng thái phòng (OPEN -> CLOSED...)
      client.subscribe(`/topic/messages.${userId}.status`, (payload) => {
        const newStatus = payload.body as RoomStatus
        setRoomStatusLive(newStatus)
      })
    })

    stompClient.current = client

    return () => {
      if (stompClient.current?.connected) {
        stompClient.current.disconnect(() => {})
      }
    }
  }, [userId])

  // ─── HÀM GỬI TIN NHẮN DÙNG CHUNG ──────────────────────────────────────────
  const sendMessage = useCallback(
    (content: string, receiverId: string, isAdmin: boolean, type: MessageType = 'TEXT') => {
      if (stompClient.current?.connected) {
        const request: ChatMessageRequest = {
          senderId: userId,
          receiverId,
          content,
          messageType: type,
          isAdmin
        }
        stompClient.current.send('/app/support.sendMessage', {}, JSON.stringify(request))
      }
    },
    [userId]
  )

  // ─── CÁC HÀM TIỆN ÍCH RIÊNG ────────────────────────────────────────────────

  // Gửi tin nhắn văn bản bình thường
  const sendTextMessage = (content: string, receiverId: string, isAdmin: boolean) => {
    sendMessage(content, receiverId, isAdmin, 'TEXT')
  }

  type ChatProduct = {
    id: string
    title: string
    price: number
    cover?: string
    slug?: string
    stock?: number
  }
  const sendProductMessage = (productObj: ChatProduct, receiverId: string, isAdmin: boolean) => {
    const productJson = JSON.stringify(productObj)
    sendMessage(productJson, receiverId, isAdmin, 'PRODUCT')
  }

  return {
    messages,
    setMessages,
    sendTextMessage,
    sendProductMessage, // Trả ra hàm này để AdminChatPage sử dụng
    roomStatusLive
  }
}
