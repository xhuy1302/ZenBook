// File: src/hooks/useChatStream.ts
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'

export type MessageRole = 'user' | 'bot'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
}

export const useChatStream = () => {
  const { user } = useAuth()
  const { refreshCartFromServer } = useCart()

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const savedMessages = localStorage.getItem('zenbook_chat_history')
    return savedMessages
      ? JSON.parse(savedMessages)
      : [
          {
            id: 'welcome',
            role: 'bot',
            content: 'Xin chào 👋 Mình là ZenBook AI. Hôm nay bạn muốn tìm sách gì?'
          }
        ]
  })

  const [isTyping, setIsTyping] = useState<boolean>(false)

  // Lưu sessionId vào state để có thể cập nhật khi Clear Chat
  const [sessionId, setSessionId] = useState<string>(() => {
    let savedId = localStorage.getItem('chat_session_id')
    if (!savedId) {
      savedId = Math.floor(Math.random() * 1000000000).toString()
      localStorage.setItem('chat_session_id', savedId)
    }
    return savedId
  })

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    localStorage.setItem('zenbook_chat_history', JSON.stringify(messages))
  }, [messages])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    const botMsgId = (Date.now() + 1).toString()
    setMessages((prev) => [...prev, { id: botMsgId, role: 'bot', content: '' }])

    let accumulatedContent = ''

    try {
      const response = await fetch('http://localhost:8080/api/v1/chat', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: text,
          sessionId: sessionId, // Gửi session id hiện tại
          userId: user?.id || null
        })
      })

      if (!response.ok) throw new Error('Lỗi kết nối đến ZenBook AI')
      if (!response.body) throw new Error('Không nhận được luồng dữ liệu')

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone

        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          const pieceOfText = chunk.replace(/^data:/gm, '').replace(/\n\n$/g, '')

          if (pieceOfText) {
            accumulatedContent += pieceOfText
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMsgId ? { ...msg, content: accumulatedContent } : msg
              )
            )
          }
        }
      }

      const lowerContent = accumulatedContent.toLowerCase()
      // Tự động load lại giỏ hàng (Bắt thêm keyword 'success' từ backend trả về)
      if (
        lowerContent.includes('thành công') ||
        lowerContent.includes('đã thêm') ||
        lowerContent.includes('đã xóa') ||
        lowerContent.includes('đã cập nhật') ||
        lowerContent.includes('success')
      ) {
        await refreshCartFromServer()
      }
    } catch (error: any) {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === botMsgId ? { ...msg, content: `⚠️ ${error.message}` } : msg))
      )
    } finally {
      setIsTyping(false)
    }
  }

  // 👉 HÀM CLEAR CHAT CHUẨN CHỈ
  const clearChat = () => {
    // 1. Xóa lịch sử tin nhắn
    localStorage.removeItem('zenbook_chat_history')

    // 2. Tạo ID Phiên mới để "Tẩy não" AI trên Backend
    const newSessionId = Math.floor(Math.random() * 1000000000).toString()
    localStorage.setItem('chat_session_id', newSessionId)
    setSessionId(newSessionId)

    // 3. Reset giao diện
    setMessages([
      {
        id: 'welcome',
        role: 'bot',
        content: 'Xin chào 👋 Mình là ZenBook AI. Hôm nay bạn muốn tìm sách gì?'
      }
    ])
  }

  return { messages, sendMessage, isTyping, messagesEndRef, user, clearChat }
}
