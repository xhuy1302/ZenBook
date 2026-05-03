// File: src/hooks/useSupportChat.ts
import { useEffect, useRef, useState, useCallback } from 'react'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import type {
  ChatMessageResponse,
  ChatMessageRequest,
  RoomStatus,
  MessageType
} from '@/services/chat/chat.type'

export type ChatProduct = {
  id: string
  title: string
  price: number
  cover?: string
  slug?: string
  stock?: number
}

export const useSupportChat = (userId: string) => {
  const [messages, setMessages] = useState<ChatMessageResponse[]>([])
  const [roomStatusLive, setRoomStatusLive] = useState<RoomStatus | null>(null)
  const stompClient = useRef<Stomp.Client | null>(null)

  // Hàm phát âm thanh khi có tin nhắn
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3')
      audio.play().catch((e) => console.warn('Lỗi phát âm thanh:', e))
    } catch (error) {
      console.warn('Lỗi khởi tạo Audio:', error)
    }
  }, [])

  // ─── KẾT NỐI WEBSOCKET ──────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return

    const socket = new SockJS('http://localhost:8080/ws-support')
    const client = Stomp.over(socket)
    client.debug = () => {}

    client.connect({}, () => {
      // Nhận tin nhắn mới
      client.subscribe(`/topic/messages.${userId}`, (payload) => {
        const newMessage: ChatMessageResponse = JSON.parse(payload.body)

        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev

          // Phát tiếng kêu ngay khi có tin nhắn từ người khác
          if (newMessage.senderId !== userId) {
            playNotificationSound()
          }

          return [...prev, newMessage]
        })
      })

      // Lắng nghe sự kiện "Đã xem"
      client.subscribe(`/topic/messages.${userId}.seen`, (payload) => {
        const roomId = payload.body
        setMessages((prev) =>
          prev.map((msg) =>
            msg.roomId === roomId && msg.senderId === userId ? { ...msg, status: 'SEEN' } : msg
          )
        )
      })

      // Lắng nghe cập nhật trạng thái phòng
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
  }, [userId, playNotificationSound])

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

  const sendTextMessage = (content: string, receiverId: string, isAdmin: boolean) => {
    sendMessage(content, receiverId, isAdmin, 'TEXT')
  }

  const sendProductMessage = (productObj: ChatProduct, receiverId: string, isAdmin: boolean) => {
    const productJson = JSON.stringify(productObj)
    sendMessage(productJson, receiverId, isAdmin, 'PRODUCT')
  }

  return {
    messages,
    setMessages,
    sendTextMessage,
    sendProductMessage,
    roomStatusLive
  }
}
