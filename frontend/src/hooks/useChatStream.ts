import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext' // 👈 Import thêm cái này

export type MessageRole = 'user' | 'bot'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
}

export const useChatStream = () => {
  const { user } = useAuth()
  const { refreshCartFromServer } = useCart() // 👈 Lấy hàm refresh từ context ra

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'bot',
      content: 'Xin chào 👋 Mình là ZenBook AI. Hôm nay bạn muốn tìm sách gì?'
    }
  ])
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [sessionId] = useState<number | null>(null)
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

    // 1. Hiển thị tin nhắn User
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    // 2. Chuẩn bị tin nhắn Bot trống
    const botMsgId = (Date.now() + 1).toString()
    setMessages((prev) => [...prev, { id: botMsgId, role: 'bot', content: '' }])

    // Biến để lưu lại toàn bộ nội dung Bot trả về để kiểm tra từ khóa
    let accumulatedContent = ''

    try {
      const response = await fetch('http://localhost:8080/api/v1/chat', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: text,
          sessionId: sessionId,
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
          const lines = chunk.split('\n')
          let pieceOfText = ''

          lines.forEach((line) => {
            if (line.startsWith('data:')) {
              let content = line.substring(5).trim()
              content = content.replace(/\\n/g, '\n').replace(/\\"/g, '"')
              pieceOfText += content
            } else if (line.trim() !== '' && !line.startsWith('data:')) {
              pieceOfText += line
            }
          })

          if (pieceOfText) {
            accumulatedContent += pieceOfText // Cộng dồn nội dung
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMsgId ? { ...msg, content: msg.content + pieceOfText } : msg
              )
            )
          }
        }
      }

      // ── XỬ LÝ REFRESH GIỎ HÀNG SAU KHI STREAM XONG ──
      const lowerContent = accumulatedContent.toLowerCase()

      // Nếu trong câu trả lời có từ khóa xác nhận đã thêm thành công
      if (lowerContent.includes('thành công') || lowerContent.includes('đã thêm')) {
        console.log('AI xác nhận thêm giỏ hàng. Đang làm mới dữ liệu...')
        await refreshCartFromServer() // 👈 Gọi hàm của CartContext để update UI toàn app
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
