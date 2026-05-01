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

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'bot',
      content: 'Xin chào 👋 Mình là ZenBook AI. Hôm nay bạn muốn tìm sách gì?'
    }
  ])
  const [isTyping, setIsTyping] = useState<boolean>(false)

  // 👉 SỬA LỖI MẤT TRÍ NHỚ: Khởi tạo/Lấy SessionId từ sessionStorage
  const [sessionId] = useState<string>(() => {
    let savedId = sessionStorage.getItem('chat_session_id')
    if (!savedId) {
      // Vì backend của bạn dùng Long cho sessionId, ở đây ta dùng 1 số ngẫu nhiên lớn
      savedId = Math.floor(Math.random() * 1000000000).toString()
      sessionStorage.setItem('chat_session_id', savedId)
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
          sessionId: sessionId, // 👉 BÂY GIỜ ĐÃ CÓ ID CHUẨN ĐỂ GỬI LÊN
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
          // 👉 Tối ưu hóa việc bóc tách chuỗi (Streaming)
          const pieceOfText = chunk.replace(/^data:/gm, '').trim()

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

      // XỬ LÝ REFRESH GIỎ HÀNG
      const lowerContent = accumulatedContent.toLowerCase()
      // Bắt thêm từ khóa "xóa" hoặc "cập nhật" để refresh UI
      if (
        lowerContent.includes('thành công') ||
        lowerContent.includes('đã thêm') ||
        lowerContent.includes('đã xóa') ||
        lowerContent.includes('đã cập nhật')
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

  return { messages, sendMessage, isTyping, messagesEndRef, user }
}
