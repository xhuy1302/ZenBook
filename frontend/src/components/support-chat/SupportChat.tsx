import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send,
  X,
  Headphones,
  Image as ImageIcon,
  Loader2,
  Gem,
  Shield,
  Crown,
  Medal,
  Bot,
  MessageSquare,
  ShoppingBag,
  Search
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useQueryClient, useQuery } from '@tanstack/react-query'

import { useSupportChat } from '@/hooks/useSupportChat'
import { useChatStream } from '@/hooks/useChatStream'
import {
  getChatHistoryApi,
  getRoomByUserIdApi,
  uploadChatMediaApi,
  markMessagesAsSeenApi,
  updateRoomStatusApi
} from '@/services/chat/chat.api'
import { getAllBooksApi } from '@/services/book/book.api'
import MessageItem from './MessageItem'
import type { ChatMessageResponse, ChatRoomResponse, RoomStatus } from '@/services/chat/chat.type'
import { toast } from 'sonner'

// ─── TYPES & CONSTANTS ───────────────────────────────────────────────────────
interface Props {
  currentUser: { id: string; username: string; roles: string[] }
  isAdmin?: boolean
  adminTargetUserId?: string
}

interface BookItem {
  id: string
  title: string
  salePrice: number
  thumbnail: string
  slug: string
  stockQuantity: number
}

const SYSTEM_ADMIN_ID = '00000000-0000-7000-0000-000000000100'

const ZBookLogo: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 32 32'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <rect width='32' height='32' rx='8' fill='white' fillOpacity='0.15' />
    <path
      d='M7 8h12l-8 7h9'
      stroke='white'
      strokeWidth='2.2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M9 17h11v7H9z'
      stroke='white'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path d='M9 20h11' stroke='white' strokeWidth='1.5' strokeLinecap='round' />
  </svg>
)

const renderTierBadge = (tier?: string) => {
  switch (tier?.toUpperCase()) {
    case 'DIAMOND':
      return (
        <span className='flex items-center gap-1 bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded shadow-sm text-[9px] font-bold border border-violet-200 shrink-0'>
          <Gem size={10} /> DIAMOND
        </span>
      )
    case 'PLATINUM':
      return (
        <span className='flex items-center gap-1 bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded shadow-sm text-[9px] font-bold border border-cyan-200 shrink-0'>
          <Shield size={10} /> PLATINUM
        </span>
      )
    case 'GOLD':
      return (
        <span className='flex items-center gap-1 bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded shadow-sm text-[9px] font-bold border border-amber-200 shrink-0'>
          <Crown size={10} /> GOLD
        </span>
      )
    case 'SILVER':
      return (
        <span className='flex items-center gap-1 bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded shadow-sm text-[9px] font-bold border border-slate-300 shrink-0'>
          <Medal size={10} /> SILVER
        </span>
      )
    default:
      return null
  }
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const SupportChat: React.FC<Props> = ({ currentUser, isAdmin = false, adminTargetUserId }) => {
  const [activePanel, setActivePanel] = useState<'NONE' | 'SUPPORT' | 'AI'>('NONE')
  const [showProductPicker, setShowProductPicker] = useState<boolean>(false)
  const queryClient = useQueryClient()
  const [input, setInput] = useState<string>('')
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [currentRoom, setCurrentRoom] = useState<ChatRoomResponse | null>(null)
  const [unreadCountForGuest, setUnreadCountForGuest] = useState<number>(0)
  const isFirstScroll = useRef<boolean>(true)
  const inputRef = useRef<HTMLInputElement>(null)

  const isStoreActor = currentUser.roles.some((r) => r === 'ADMIN' || r === 'STAFF')
  const receiverId = isStoreActor ? adminTargetUserId : SYSTEM_ADMIN_ID

  const { messages, setMessages, sendTextMessage, sendProductMessage, roomStatusLive } =
    useSupportChat(currentUser.id)
  const scrollRef = useRef<HTMLDivElement>(null)

  const {
    messages: aiMessages,
    sendMessage: sendAiMessage,
    isTyping: isAiTyping,
    messagesEndRef: aiScrollRef
  } = useChatStream()
  const [aiInput, setAiInput] = useState<string>('')

  const loadChatData = useCallback(async () => {
    try {
      const targetId = isStoreActor ? adminTargetUserId : currentUser.id
      if (!targetId) return
      const room = await getRoomByUserIdApi(targetId)
      if (room) {
        setCurrentRoom(room)
        const history = await getChatHistoryApi(room.id)
        setMessages(history)
      }
    } catch {
      toast.error('Lỗi khi tải lịch sử!')
    }
  }, [isStoreActor, adminTargetUserId, currentUser.id, setMessages])

  useEffect(() => {
    loadChatData()
  }, [loadChatData])

  useEffect(() => {
    if (roomStatusLive && currentRoom) {
      setCurrentRoom((prev) => (prev ? { ...prev, status: roomStatusLive } : null))
    }
  }, [roomStatusLive, currentRoom])

  const playNotificationSound = useCallback(() => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3')
    audio.play().catch(() => {})
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg.senderId !== currentUser.id) playNotificationSound()
    }
  }, [messages, currentUser.id, playNotificationSound])

  useEffect(() => {
    if (!currentRoom || currentUser.id === '') return
    const unreadMsgs = messages.filter((m) => m.senderId !== currentUser.id && m.status !== 'SEEN')
    if ((activePanel === 'SUPPORT' || isAdmin) && unreadMsgs.length > 0) {
      const targetReceiverIds = Array.from(new Set(unreadMsgs.map((m) => m.receiverId)))
      Promise.all(targetReceiverIds.map((id) => markMessagesAsSeenApi(currentRoom.id, id))).then(
        () => {
          setUnreadCountForGuest(0)
          queryClient.invalidateQueries({ queryKey: ['admin-chat-rooms', 'sidebar-badge'] })
          setMessages((prev) =>
            prev.map((m) => (m.senderId !== currentUser.id ? { ...m, status: 'SEEN' } : m))
          )
        }
      )
    } else if (activePanel !== 'SUPPORT' && !isAdmin) {
      setUnreadCountForGuest(unreadMsgs.length)
    }
  }, [messages, activePanel, currentRoom, currentUser.id, isAdmin, queryClient, setMessages])

  useEffect(() => {
    if (activePanel === 'NONE' && !isAdmin) {
      isFirstScroll.current = true
      return
    }
    const timer = setTimeout(() => {
      const scrollOptions: ScrollIntoViewOptions = {
        behavior: isFirstScroll.current ? 'auto' : 'smooth',
        block: 'end'
      }
      if (activePanel === 'SUPPORT' || isAdmin) scrollRef.current?.scrollIntoView(scrollOptions)
      else if (activePanel === 'AI') aiScrollRef.current?.scrollIntoView(scrollOptions)
      isFirstScroll.current = false
    }, 100)
    return () => clearTimeout(timer)
  }, [messages, aiMessages, activePanel, isAdmin, aiScrollRef])

  const handleStatusChange = async (newStatus: RoomStatus) => {
    if (!currentRoom) return
    try {
      await updateRoomStatusApi(currentRoom.id, newStatus)
      setCurrentRoom((prev) => (prev ? { ...prev, status: newStatus } : null))
      queryClient.invalidateQueries({ queryKey: ['admin-chat-rooms', 'sidebar-badge'] })
      toast.success('Đã cập nhật trạng thái!')
    } catch {
      toast.error('Lỗi khi cập nhật!')
    }
  }

  const handleSend = () => {
    if (!input.trim() || !receiverId) return
    sendTextMessage(input, receiverId, isStoreActor)
    setInput('')
    inputRef.current?.focus()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !receiverId) return
    const type = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE'
    setIsUploading(true)
    try {
      await uploadChatMediaApi(file, currentUser.id, receiverId, isStoreActor, type)
    } finally {
      setIsUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleShareProduct = useCallback(
    (book: BookItem) => {
      if (!receiverId || !sendProductMessage) return

      sendProductMessage(
        {
          id: book.id,
          slug: book.slug,
          name: book.title,
          image: book.thumbnail,
          price: book.salePrice,
          stock: book.stockQuantity
        },
        receiverId,
        true
      )

      setShowProductPicker(false)
      toast.success('Đã gửi thẻ sản phẩm')
    },
    [receiverId, sendProductMessage]
  )

  let headerLabel = 'Hỗ trợ khách hàng'
  if (isStoreActor) {
    if (currentRoom?.customerName) headerLabel = currentRoom.customerName
    else if (adminTargetUserId) headerLabel = `Khách #${adminTargetUserId.substring(0, 6)}`
  }

  const isChatDisabled = currentRoom?.status === 'RESOLVED' || currentRoom?.status === 'CLOSED'

  return (
    <>
      <style>{`
        .sup-panel { animation: slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .sup-scroll::-webkit-scrollbar { width: 4px; }
        .sup-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 4px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes dotWave {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        .dot-wave span {
          display: inline-block;
          width: 5px;
          height: 5px;
          background-color: #10b981;
          border-radius: 50%;
          animation: dotWave 1.2s infinite ease-in-out;
        }
        .dot-wave span:nth-child(2) { animation-delay: 0.2s; }
        .dot-wave span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      {isAdmin ? (
        <div className='relative w-full h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-emerald-100'>
          <ChatHeader
            label={headerLabel}
            tier={currentRoom?.customerTier}
            status={currentRoom?.status}
            onStatusChange={handleStatusChange}
            isAdmin
          />
          {showProductPicker && (
            <ProductPicker
              onClose={() => setShowProductPicker(false)}
              onSelect={handleShareProduct}
            />
          )}
          <MessageList
            messages={messages}
            currentUserId={currentUser.id}
            scrollRef={scrollRef}
            customerName={currentRoom?.customerName}
          />
          <InputFooter
            input={input}
            setInput={setInput}
            onSend={handleSend}
            inputRef={inputRef}
            onFileChange={handleFileChange}
            isUploading={isUploading}
            disabled={isChatDisabled}
            isAdmin={true}
            onOpenProductPicker={() => setShowProductPicker(true)}
          />
        </div>
      ) : (
        <div className='fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 font-sans'>
          {activePanel === 'SUPPORT' && (
            <div
              className='sup-panel flex flex-col rounded-2xl overflow-hidden bg-white shadow-2xl border'
              style={{ width: '360px', height: '540px' }}
            >
              <ChatHeader
                label={headerLabel}
                tier={currentRoom?.customerTier}
                status={currentRoom?.status}
                onClose={() => setActivePanel('NONE')}
              />
              <MessageList
                messages={messages}
                currentUserId={currentUser.id}
                scrollRef={scrollRef}
                customerName={currentRoom?.customerName}
              />
              <InputFooter
                input={input}
                setInput={setInput}
                onSend={handleSend}
                inputRef={inputRef}
                onFileChange={handleFileChange}
                isUploading={isUploading}
                disabled={isChatDisabled}
                isAdmin={false}
              />
            </div>
          )}

          {activePanel === 'AI' && (
            <div
              className='sup-panel w-[370px] flex flex-col rounded-2xl overflow-hidden bg-white shadow-2xl border'
              style={{ height: '580px' }}
            >
              <div
                className='flex items-center justify-between px-4 py-3 shrink-0'
                style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
              >
                <div className='flex items-center gap-3'>
                  <div className='w-9 h-9 rounded-xl flex items-center justify-center bg-white/15 border border-white/25'>
                    <ZBookLogo size={22} />
                  </div>
                  <div className='text-white'>
                    <div className='flex items-center gap-1.5'>
                      <span className='font-bold text-base'>ZBook</span>
                      <span className='text-[10px] bg-emerald-300/30 px-1.5 py-0.5 rounded-full'>
                        AI
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActivePanel('NONE')}
                  className='text-white hover:bg-white/10 p-1.5 rounded-full'
                >
                  <X size={18} />
                </button>
              </div>
              <div className='flex-1 overflow-y-auto p-4 ai-scroll bg-[#f0fdf4]'>
                {aiMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 mb-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'bot' && (
                      <div className='w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center shrink-0 mt-1'>
                        <Bot size={14} className='text-white' />
                      </div>
                    )}
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl max-w-[82%] text-sm ${
                        msg.role === 'user'
                          ? 'bg-green-600 text-white rounded-tr-sm'
                          : 'bg-white border rounded-tl-sm text-slate-800' // Thêm text-slate-800 cho rõ
                      }`}
                      style={{
                        whiteSpace: 'pre-wrap', // 👉 DÒNG QUAN TRỌNG NHẤT: Giữ khoảng trắng và xuống dòng
                        wordBreak: 'break-word' // Tránh tràn chữ ra ngoài bubble
                      }}
                    >
                      {msg.role === 'bot' ? (
                        <div className='prose prose-sm max-w-none prose-ul:my-0 prose-li:my-0 prose-p:my-0'>
                          {' '}
                          {/* Thêm các class my-0 này để xóa khoảng cách dọc */}
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}

                {isAiTyping && (
                  <div className='flex gap-2 mb-3 justify-start'>
                    <div className='w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center shrink-0 mt-1'>
                      <Bot size={14} className='text-white' />
                    </div>
                    <div className='bg-white border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm'>
                      <div className='dot-wave flex gap-1.5 items-center h-4'>
                        <span />
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={aiScrollRef} />
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (aiInput.trim() && !isAiTyping) {
                    sendAiMessage(aiInput)
                    setAiInput('')
                  }
                }}
                className='p-3 bg-white border-t flex gap-2'
              >
                <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder='Hỏi gì về sách đi...'
                  className='flex-1 h-10 px-4 rounded-full bg-green-50 border border-transparent outline-none focus:border-green-400 text-sm'
                />
                <button
                  type='submit'
                  className='w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg'
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}

          {activePanel === 'NONE' && (
            <div className='flex flex-col bg-[#16a34a] rounded-full shadow-2xl overflow-hidden border-[1.5px] border-white'>
              <button
                onClick={() => setActivePanel('AI')}
                className='flex flex-col items-center justify-center w-[58px] h-[58px] hover:bg-white/10 text-white'
              >
                <Bot size={24} />
                <span className='text-[9px] font-bold'>Trợ lý</span>
              </button>
              <div className='w-8 h-[1px] bg-white/20 mx-auto' />
              <button
                onClick={() => setActivePanel('SUPPORT')}
                className='relative flex flex-col items-center justify-center w-[58px] h-[58px] hover:bg-white/10 text-white'
              >
                <MessageSquare size={22} />
                <span className='text-[9px] font-bold'>Tin mới</span>
                {unreadCountForGuest > 0 && (
                  <span className='absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-white border'>
                    {unreadCountForGuest > 99 ? '99+' : unreadCountForGuest}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

function ProductPicker({
  onClose,
  onSelect
}: {
  onClose: () => void
  onSelect: (book: BookItem) => void
}) {
  const [q, setQ] = useState<string>('')
  const { data } = useQuery({
    queryKey: ['all-books-chat'],
    queryFn: () => getAllBooksApi({ size: 100 })
  })
  const books: BookItem[] = (
    Array.isArray(data) ? data : (data as { content?: BookItem[] })?.content || []
  ).map((b: any) => ({
    id: b.id,
    title: b.title,
    salePrice: b.salePrice,
    thumbnail: b.thumbnail,
    slug: b.slug,
    stockQuantity: b.stockQuantity
  }))
  const filtered = books.filter((b) => b.title.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className='absolute inset-0 z-[50] bg-white flex flex-col'>
      <div className='p-3 border-b flex items-center justify-between bg-slate-50'>
        <span className='font-bold text-sm text-slate-700'>Chọn sách chia sẻ</span>
        <button onClick={onClose} className='p-1 hover:bg-slate-200 rounded-full'>
          <X size={18} />
        </button>
      </div>
      <div className='p-2 border-b'>
        <div className='relative'>
          <Search size={14} className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Tìm sách...'
            className='w-full pl-9 pr-3 py-1.5 bg-white border rounded-lg text-xs outline-none focus:border-emerald-400'
          />
        </div>
      </div>
      <div className='flex-1 overflow-y-auto p-2 space-y-2 sup-scroll'>
        {filtered.map((book) => (
          <div
            key={book.id}
            onClick={() => onSelect(book)}
            className='flex items-center gap-3 p-2 hover:bg-emerald-50 rounded-lg cursor-pointer border border-transparent hover:border-emerald-100 transition-all'
          >
            <img
              src={book.thumbnail}
              alt={book.title}
              className='w-12 h-12 object-cover rounded-md border'
            />
            <div className='flex-1 min-w-0'>
              <div className='flex justify-between items-start'>
                <p className='text-[12px] font-bold truncate text-slate-800 flex-1'>{book.title}</p>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-2 ${book.stockQuantity > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                >
                  Còn {book.stockQuantity}
                </span>
              </div>
              <p className='text-[11px] text-emerald-600 font-bold'>
                {new Intl.NumberFormat('vi-VN').format(book.salePrice)}đ
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChatHeader({ label, tier, status, onStatusChange, onClose, isAdmin }: HeaderProps) {
  return (
    <div
      className='flex items-center justify-between px-4 py-3 shrink-0'
      style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
    >
      <div className='flex items-center gap-3'>
        <div className='w-9 h-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-white'>
          <Headphones size={18} />
        </div>
        <div className='flex flex-col'>
          <div className='flex items-center gap-2'>
            <span className='text-white font-bold text-sm truncate max-w-[120px]'>{label}</span>
            {renderTierBadge(tier)}
          </div>
          <div className='flex items-center gap-1 mt-0.5'>
            <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse' />
            <span className='text-emerald-100 text-[10px] font-medium'>Nhân viên trực</span>
          </div>
        </div>
      </div>
      <div className='flex items-center gap-2'>
        {isAdmin && onStatusChange && (
          <select
            value={status || 'OPEN'}
            onChange={(e) => onStatusChange(e.target.value as RoomStatus)}
            className='bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded outline-none border border-white/30 cursor-pointer'
          >
            <option value='OPEN' className='text-black'>
              OPEN
            </option>
            <option value='PENDING' className='text-black'>
              PENDING
            </option>
            <option value='RESOLVED' className='text-black'>
              RESOLVED
            </option>
            <option value='CLOSED' className='text-black'>
              CLOSED
            </option>
          </select>
        )}
        {!isAdmin && onClose && (
          <button onClick={onClose} className='text-white hover:bg-white/10 p-1 rounded-full'>
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  )
}

function MessageList({ messages, currentUserId, scrollRef, customerName }: ListProps) {
  return (
    <div className='flex-1 overflow-y-auto p-4 sup-scroll bg-[#f0fdf4]/50'>
      {messages.length === 0 && (
        <div className='flex flex-col items-center justify-center h-full opacity-40'>
          <MessageSquare size={30} className='text-emerald-600' />
          <p className='text-xs mt-2'>Chưa có tin nhắn</p>
        </div>
      )}
      {messages.map((msg) => (
        <MessageItem
          key={msg.id}
          msg={msg}
          isMe={msg.senderId === currentUserId}
          avatarLabel={msg.senderId === currentUserId ? 'B' : (customerName || 'K').charAt(0)}
        />
      ))}
      <div ref={scrollRef} className='h-1' />
    </div>
  )
}

function InputFooter({
  input,
  setInput,
  onSend,
  inputRef,
  onFileChange,
  isUploading,
  disabled,
  isAdmin,
  onOpenProductPicker
}: FooterProps) {
  const quickReplies = [
    '👋 ZenBook chào bạn!',
    '📦 Đợi mình check kho nhé.',
    '✅ Đã xác nhận đơn hàng.',
    '🙏 Cảm ơn bạn ủng hộ!'
  ]
  return (
    <div className='flex flex-col bg-white border-t shrink-0'>
      {isAdmin && !disabled && (
        <div className='flex items-center gap-2 px-3 py-2 overflow-x-auto no-scrollbar bg-slate-50/50'>
          {quickReplies.map((text, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(text)
                inputRef.current?.focus()
              }}
              className='shrink-0 bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all shadow-sm'
            >
              {text}
            </button>
          ))}
        </div>
      )}
      <div
        className={`p-3 flex items-center gap-2 ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`}
      >
        <div className='flex items-center gap-1'>
          <label
            className={`p-2 rounded-full text-emerald-600 ${disabled ? 'pointer-events-none' : 'hover:bg-emerald-50 cursor-pointer'}`}
          >
            {isUploading ? <Loader2 size={18} className='animate-spin' /> : <ImageIcon size={18} />}
            <input
              type='file'
              className='hidden'
              onChange={onFileChange}
              accept='image/*,video/*'
              disabled={isUploading || disabled}
            />
          </label>
          {isAdmin && !disabled && (
            <button
              onClick={onOpenProductPicker}
              className='p-2 rounded-full text-emerald-600 hover:bg-emerald-50 transition-colors'
            >
              <ShoppingBag size={18} />
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !disabled && onSend()}
          placeholder={disabled ? 'Chat đã đóng...' : 'Nhập tin nhắn...'}
          disabled={disabled}
          className='flex-1 h-10 px-4 rounded-full bg-slate-100 border-none text-sm outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-emerald-400'
        />
        <button
          onClick={onSend}
          disabled={!input.trim() || disabled}
          className='w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg disabled:bg-slate-300 transition-transform active:scale-95'
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}

// Interfaces remain unchanged
interface HeaderProps {
  label: string
  tier?: string
  status?: string
  onStatusChange?: (status: RoomStatus) => void
  onClose?: () => void
  isAdmin?: boolean
}
interface ListProps {
  messages: ChatMessageResponse[]
  currentUserId: string
  scrollRef: React.RefObject<HTMLDivElement | null>
  customerName?: string
}
interface FooterProps {
  input: string
  setInput: (v: string) => void
  onSend: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  isUploading: boolean
  disabled?: boolean
  isAdmin?: boolean
  onOpenProductPicker?: () => void
}

export default SupportChat
