// File: src/components/chat/HumanChatPanel.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
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
  ShoppingBag,
  Search,
  Smile
} from 'lucide-react'
import { useQueryClient, useQuery } from '@tanstack/react-query'

// 👉 SỬA LỖI 1: Import type EmojiClickData bằng từ khóa `import type`
import EmojiPicker from 'emoji-picker-react'
import type { EmojiClickData } from 'emoji-picker-react'

import {
  uploadChatMediaApi,
  markMessagesAsSeenApi,
  updateRoomStatusApi
} from '@/services/chat/chat.api'
import { getAllBooksApi } from '@/services/book/book.api'
import MessageItem from './MessageItem'

// 👉 SỬA LỖI 2: Đảm bảo các kiểu từ chat.type được import đúng bằng `import type`
import type { ChatMessageResponse, ChatRoomResponse, RoomStatus } from '@/services/chat/chat.type'

// 👉 SỬA LỖI 3: Import ChatProduct bằng từ khóa `import type`
import type { ChatProduct } from '@/hooks/useSupportChat'

import { toast } from 'sonner'

const SYSTEM_ADMIN_ID = '00000000-0000-7000-0000-000000000100'

interface HumanChatProps {
  currentUser: { id: string; username: string; roles: string[] }
  isAdmin: boolean
  isStoreActor: boolean
  adminTargetUserId?: string
  onClose?: () => void
  setUnreadCount?: (count: number) => void

  messages: ChatMessageResponse[]
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageResponse[]>>
  sendTextMessage: (text: string, receiverId: string, isStoreActor: boolean) => void
  sendProductMessage: (
    productPayload: ChatProduct,
    receiverId: string,
    isStoreActor: boolean
  ) => void
  roomStatusLive: RoomStatus | null
  currentRoom: ChatRoomResponse | null
  setCurrentRoom: React.Dispatch<React.SetStateAction<ChatRoomResponse | null>>
}

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

const HumanChatPanel: React.FC<HumanChatProps> = ({
  currentUser,
  isAdmin,
  isStoreActor,
  adminTargetUserId,
  onClose,
  setUnreadCount,
  messages,
  setMessages,
  sendTextMessage,
  sendProductMessage,
  roomStatusLive,
  currentRoom,
  setCurrentRoom
}) => {
  const [input, setInput] = useState<string>('')
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [showProductPicker, setShowProductPicker] = useState<boolean>(false)

  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isFirstScroll = useRef<boolean>(true)

  const receiverId = isStoreActor ? adminTargetUserId : SYSTEM_ADMIN_ID

  useEffect(() => {
    if (roomStatusLive && currentRoom) {
      setCurrentRoom((prev) => (prev ? { ...prev, status: roomStatusLive } : null))
    }
  }, [roomStatusLive, currentRoom, setCurrentRoom])

  useEffect(() => {
    if (!currentRoom || currentUser.id === '') return
    const unreadMsgs = messages.filter((m) => m.senderId !== currentUser.id && m.status !== 'SEEN')
    if (unreadMsgs.length > 0) {
      const targetReceiverIds = Array.from(new Set(unreadMsgs.map((m) => m.receiverId)))
      Promise.all(targetReceiverIds.map((id) => markMessagesAsSeenApi(currentRoom.id, id))).then(
        () => {
          if (setUnreadCount) setUnreadCount(0)
          queryClient.invalidateQueries({ queryKey: ['admin-chat-rooms', 'sidebar-badge'] })
          setMessages((prev) =>
            prev.map((m) => (m.senderId !== currentUser.id ? { ...m, status: 'SEEN' } : m))
          )
        }
      )
    }
  }, [messages, currentRoom, currentUser.id, queryClient, setMessages, setUnreadCount])

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollIntoView({
        behavior: isFirstScroll.current ? 'auto' : 'smooth',
        block: 'end'
      })
      isFirstScroll.current = false
    }, 100)
    return () => clearTimeout(timer)
  }, [messages])

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
          title: book.title,
          cover: book.thumbnail,
          price: book.salePrice,
          stock: book.stockQuantity
        },
        receiverId,
        isStoreActor
      )

      setShowProductPicker(false)
      toast.success('Đã gửi thẻ sản phẩm')
    },
    [receiverId, sendProductMessage, isStoreActor]
  )

  let headerLabel = 'Hỗ trợ khách hàng'
  if (isStoreActor) {
    if (currentRoom?.customerName) headerLabel = currentRoom.customerName
    else if (adminTargetUserId) headerLabel = `Khách #${adminTargetUserId.substring(0, 6)}`
  }

  const isChatDisabled = currentRoom?.status === 'RESOLVED' || currentRoom?.status === 'CLOSED'

  return (
    <div className='w-full h-full flex flex-col bg-white relative'>
      <ChatHeader
        label={headerLabel}
        tier={currentRoom?.customerTier}
        status={currentRoom?.status}
        onStatusChange={handleStatusChange}
        isAdmin={isAdmin}
        onClose={onClose}
      />

      {showProductPicker && (
        <ProductPicker onClose={() => setShowProductPicker(false)} onSelect={handleShareProduct} />
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
        isAdmin={isAdmin}
        onOpenProductPicker={() => setShowProductPicker(true)}
      />
    </div>
  )
}

// ─── SUB COMPONENTS ─────────────────────────────────────────────────────────

interface BookItem {
  id: string
  title: string
  salePrice: number
  thumbnail: string
  slug: string
  stockQuantity: number
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

  // 👉 SỬA LỖI 4: Ép kiểu an toàn (Type casting an toàn hơn cho API Response)
  const books: BookItem[] = useMemo(() => {
    let rawList: any[] = []

    // Kiểm tra cấu trúc mảng và object an toàn để tránh TypeScript báo lỗi Conversion Type
    if (Array.isArray(data)) {
      rawList = data
    } else if (data && typeof data === 'object') {
      const parsedData = data as Record<string, any>
      if (parsedData.content && Array.isArray(parsedData.content)) {
        rawList = parsedData.content
      } else if (parsedData.data && typeof parsedData.data === 'object') {
        const nestedData = parsedData.data as Record<string, any>
        if (nestedData.content && Array.isArray(nestedData.content)) {
          rawList = nestedData.content
        } else if (Array.isArray(parsedData.data)) {
          rawList = parsedData.data
        }
      }
    }

    return rawList.map((b: any) => ({
      id: b.id,
      title: b.title,
      salePrice: b.salePrice,
      thumbnail: b.thumbnail,
      slug: b.slug,
      stockQuantity: b.stockQuantity
    }))
  }, [data])

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

interface HeaderProps {
  label: string
  tier?: string
  status?: string
  onStatusChange?: (status: RoomStatus) => void
  onClose?: () => void
  isAdmin?: boolean
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

interface ListProps {
  messages: ChatMessageResponse[]
  currentUserId: string
  scrollRef: React.RefObject<HTMLDivElement | null>
  customerName?: string
}

function MessageList({ messages, currentUserId, scrollRef, customerName }: ListProps) {
  return (
    <div className='flex-1 overflow-y-auto p-4 sup-scroll bg-[#f0fdf4]/50'>
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

interface FooterProps {
  input: string
  setInput: React.Dispatch<React.SetStateAction<string>>
  onSend: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  isUploading: boolean
  disabled?: boolean
  isAdmin?: boolean
  onOpenProductPicker?: () => void
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const quickReplies = [
    '👋 ZenBook chào bạn!',
    '📦 Đợi mình check kho nhé.',
    '✅ Đã xác nhận đơn hàng.',
    '🙏 Cảm ơn bạn ủng hộ!'
  ]

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setInput((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  return (
    <div className='flex flex-col bg-white border-t shrink-0 relative'>
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

      {/* Box Picker Emoji */}
      {showEmojiPicker && !disabled && (
        <div className='absolute bottom-full right-4 mb-2 z-50 shadow-xl rounded-xl overflow-hidden'>
          <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={350} />
        </div>
      )}

      <div
        className={`p-3 flex items-center gap-2 ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`}
      >
        <div className='flex items-center gap-0.5'>
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

          {/* NÚT BẬT EMOJI */}
          {!disabled && (
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className='p-2 rounded-full text-emerald-600 hover:bg-emerald-50 transition-colors'
            >
              <Smile size={18} />
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !disabled) {
              e.preventDefault()
              onSend()
            }
          }}
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

export default HumanChatPanel
