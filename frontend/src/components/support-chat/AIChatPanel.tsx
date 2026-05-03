// File: src/components/chat/AIChatPanel.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  Send,
  X,
  Bot,
  Maximize2,
  Minimize2,
  Trash2,
  ShoppingCart,
  ChevronRight
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useQuery } from '@tanstack/react-query'
import { useChatStream } from '@/hooks/useChatStream'
import axios from 'axios'

// 👉 1. ĐỊNH NGHĨA INTERFACE RÕ RÀNG ĐỂ LOẠI BỎ 'any'
interface Category {
  id: string
  name?: string
}

interface Book {
  id: string
  title: string
  slug: string
  thumbnail: string
  salePrice: number
  originalPrice?: number
  stockQuantity: number
  categories?: Category[]
}

interface AIChatPanelProps {
  onClose: () => void
  isExpanded: boolean
  setIsExpanded: (val: boolean) => void
}

const extractBooksFromContent = (content: string, allBooks: Book[]): Book[] => {
  if (!content || !allBooks || allBooks.length === 0) return []

  const linkRegex = /\[.*?\]\((.*?)\)/g
  const urls: string[] = []
  let match
  while ((match = linkRegex.exec(content)) !== null) {
    urls.push(match[1])
  }

  let matchedBooks: Book[] = []

  if (urls.length > 0) {
    matchedBooks = allBooks.filter((b: Book) => urls.some((url) => url.includes(b.slug)))
  }

  if (matchedBooks.length === 0) {
    const lowerContent = content.toLowerCase()
    matchedBooks = allBooks.filter((b: Book) => {
      if (b.slug && lowerContent.includes(b.slug.toLowerCase())) return true
      if (b.title && b.title.length > 4 && lowerContent.includes(b.title.toLowerCase())) {
        return true
      }
      return false
    })
  }

  return matchedBooks
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({ onClose, isExpanded, setIsExpanded }) => {
  const {
    messages: aiMessages,
    sendMessage: sendAiMessage,
    isTyping: isAiTyping,
    clearChat
  } = useChatStream()
  const [aiInput, setAiInput] = useState<string>('')
  const aiScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    aiScrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages, isAiTyping])

  const { data: bookData } = useQuery<Book[]>({
    queryKey: ['all-books-chat'],
    queryFn: async (): Promise<Book[]> => {
      const response = await axios.get('http://localhost:8080/api/v1/books', {
        params: { size: 500 }
      })
      const data = response.data

      // Xử lý linh hoạt mọi cấu trúc response để trả về đúng Array Book
      if (Array.isArray(data)) return data
      if (data?.content && Array.isArray(data.content)) return data.content
      if (data?.data?.content && Array.isArray(data.data.content)) return data.data.content
      if (data?.data && Array.isArray(data.data)) return data.data
      return []
    }
  })

  // Dữ liệu an toàn, không cần 'any'
  const allBooks: Book[] = useMemo(() => {
    return bookData || []
  }, [bookData])

  const booksMentionedInChat = useMemo(() => {
    if (aiMessages.length === 0) return []
    const lastMsg = aiMessages[aiMessages.length - 1]
    if (lastMsg.role !== 'bot') return []

    return extractBooksFromContent(lastMsg.content, allBooks)
  }, [aiMessages, allBooks])

  const expandedBookList = useMemo(() => {
    if (booksMentionedInChat.length === 0) return []

    const matchedCategoryIds = new Set<string>()
    booksMentionedInChat.forEach((book: Book) => {
      if (book.categories && Array.isArray(book.categories)) {
        book.categories.forEach((cat: Category) => {
          if (cat.id) matchedCategoryIds.add(cat.id)
        })
      }
    })

    if (matchedCategoryIds.size > 0) {
      const relatedBooks = allBooks.filter((book: Book) => {
        if (!book.categories || !Array.isArray(book.categories)) return false
        return book.categories.some((cat: Category) => matchedCategoryIds.has(cat.id))
      })

      const finalSet = new Set(booksMentionedInChat.map((b: Book) => b.id))
      const combinedList: Book[] = [...booksMentionedInChat]

      relatedBooks.forEach((book: Book) => {
        if (!finalSet.has(book.id)) {
          finalSet.add(book.id)
          combinedList.push(book)
        }
      })
      return combinedList
    }

    return booksMentionedInChat
  }, [booksMentionedInChat, allBooks])

  return (
    <div
      className={`sup-panel flex rounded-2xl overflow-hidden bg-white shadow-2xl border transition-all duration-300 ${isExpanded ? 'w-full h-[90vh] fixed inset-y-[5vh] inset-x-4 z-[10000]' : 'w-[370px] h-[580px] flex-col'}`}
    >
      <div
        className={`flex flex-col h-full bg-[#f0fdf4] transition-all duration-300 ${isExpanded ? 'w-[28%] min-w-[320px] border-r border-green-200 shadow-md z-10' : 'w-full'}`}
      >
        <div
          className='flex items-center justify-between px-4 py-3 shrink-0'
          style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
        >
          <div className='flex items-center gap-3 text-white'>
            <div className='w-9 h-9 rounded-xl flex items-center justify-center bg-white/15 border border-white/25'>
              <Bot size={22} />
            </div>
            <div>
              <div className='flex items-center gap-1.5'>
                <span className='font-bold text-base'>Trợ lý AI</span>
                <span className='text-[10px] bg-emerald-300/30 px-1.5 py-0.5 rounded-full'>
                  Beta
                </span>
              </div>
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <button
              onClick={() => {
                if (clearChat) clearChat()
                else window.location.reload()
              }}
              className='text-white hover:bg-white/20 p-1.5 rounded-md transition-colors'
              title='Xóa trò chuyện'
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='text-white hover:bg-white/20 p-1.5 rounded-md transition-colors'
              title={isExpanded ? 'Thu nhỏ' : 'Phóng to'}
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={onClose}
              className='text-white hover:bg-white/20 p-1.5 rounded-md transition-colors'
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto p-4 sup-scroll'>
          {aiMessages.length === 0 && (
            <div className='flex flex-col items-center justify-center h-full text-green-700/50'>
              <Bot size={40} className='mb-2 opacity-50' />
              <p className='text-sm font-medium mt-3 text-center px-4'>
                Xin chào! Mình có thể giúp bạn tìm sách, tra cứu đơn hàng hoặc tư vấn đọc sách.
              </p>
            </div>
          )}

          {aiMessages.map((msg) => {
            const msgBooks: Book[] =
              msg.role === 'bot' ? extractBooksFromContent(msg.content, allBooks) : []

            return (
              <div
                key={msg.id}
                className={`flex gap-2 mb-5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'bot' && (
                  <div className='w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shrink-0 mt-1 shadow-sm'>
                    <Bot size={16} className='text-white' />
                  </div>
                )}
                <div className='flex flex-col max-w-[88%]'>
                  <div
                    className={`px-4 py-3 text-[14px] shadow-sm ${msg.role === 'user' ? 'bg-green-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-green-100 rounded-2xl rounded-tl-sm text-slate-800'}`}
                    style={{ wordBreak: 'break-word' }}
                  >
                    {msg.role === 'bot' ? (
                      <div className='leading-[1.6] tracking-wide text-[13.5px]'>
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className='mb-2.5 last:mb-0'>{children}</p>,
                            ul: ({ children }) => (
                              <ul className='mb-2.5 pl-4 list-disc space-y-1'>{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className='mb-2.5 pl-4 list-decimal space-y-1'>{children}</ol>
                            ),
                            li: ({ children }) => <li>{children}</li>,
                            strong: ({ children }) => (
                              <strong className='font-bold text-green-800'>{children}</strong>
                            ),
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target='_blank'
                                className='text-green-600 font-semibold hover:underline'
                              >
                                {children}
                              </a>
                            )
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {!isExpanded && msgBooks.length > 0 && (
                    <div
                      className='mt-2.5 p-2 bg-white border border-green-100 rounded-xl flex items-center justify-between gap-3 shadow-sm hover:border-green-300 transition-colors cursor-pointer'
                      onClick={() => setIsExpanded(true)}
                    >
                      <div className='flex -space-x-3 overflow-hidden px-2'>
                        {msgBooks.slice(0, 3).map((b: Book, i: number) => (
                          <img
                            key={i}
                            src={b.thumbnail}
                            className='w-11 h-14 object-cover rounded shadow-md border-2 border-white relative z-10 bg-slate-100'
                            alt={b.title}
                          />
                        ))}
                        {msgBooks.length > 3 && (
                          <div className='w-11 h-14 rounded shadow-md border-2 border-white relative z-10 bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500'>
                            +{msgBooks.length - 3}
                          </div>
                        )}
                      </div>
                      <button className='flex items-center gap-1 text-[12px] font-bold text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg transition-colors flex-1 justify-center whitespace-nowrap'>
                        Xem {expandedBookList.length > msgBooks.length ? 'thêm' : msgBooks.length}{' '}
                        sản phẩm <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {isAiTyping && (
            <div className='flex gap-2 mb-4 justify-start'>
              <div className='w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shrink-0 mt-1'>
                <Bot size={16} className='text-white' />
              </div>
              <div className='bg-white border border-green-100 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm'>
                <div className='dot-wave flex gap-1.5 items-center h-4'>
                  <span className='w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce' />
                  <span className='w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-100' />
                  <span className='w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-200' />
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
              if (isExpanded) setIsExpanded(false)
            }
          }}
          className='p-3 bg-white border-t flex gap-2 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20'
        >
          <input
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder='Hỏi về sách, tác giả...'
            className='flex-1 h-11 px-4 rounded-full bg-slate-50 border border-slate-200 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm transition-all'
          />
          <button
            type='submit'
            disabled={!aiInput.trim() || isAiTyping}
            className='w-11 h-11 rounded-full bg-green-600 text-white flex items-center justify-center shadow-md disabled:bg-slate-200 disabled:cursor-not-allowed hover:bg-green-700 transition-colors'
          >
            <Send size={18} className='ml-0.5' />
          </button>
        </form>
      </div>

      {isExpanded && (
        <div className='flex-1 bg-slate-50 flex flex-col w-[72%] overflow-hidden relative'>
          <div className='p-6 border-b bg-white flex items-center justify-between sticky top-0 z-10 shadow-sm'>
            <div>
              <h2 className='text-xl font-bold text-slate-800 flex items-center gap-2'>
                {expandedBookList.length > 0
                  ? `Sản phẩm liên quan (${expandedBookList.length})`
                  : 'Sản phẩm nổi bật'}
              </h2>
              <p className='text-sm text-slate-500 mt-1'>
                Được AI đề xuất dựa trên nội dung trò chuyện
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className='p-2 hover:bg-slate-100 rounded-full transition-colors'
            >
              <X size={24} className='text-slate-500' />
            </button>
          </div>

          <div className='flex-1 overflow-y-auto p-6 sup-scroll bg-[#f8fafc]'>
            {expandedBookList.length > 0 ? (
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5'>
                {expandedBookList.map((book: Book) => {
                  const isMentioned = booksMentionedInChat.some((b: Book) => b.id === book.id)

                  return (
                    <div
                      key={book.id}
                      className={`bg-white p-4 rounded-xl border ${isMentioned ? 'border-green-300 shadow-md ring-1 ring-green-100' : 'border-slate-200 hover:shadow-lg hover:border-green-200'} transition-all duration-300 group flex flex-col relative`}
                    >
                      {isMentioned && (
                        <div className='absolute top-2 left-2 z-20 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm'>
                          <Bot size={10} /> AI Đề xuất
                        </div>
                      )}

                      {/* 👉 BỌC ẢNH BẰNG THẺ LINK: Ấn vào ảnh sẽ mở trang chi tiết */}
                      <a
                        href={`/products/${book.slug}`}
                        target='_blank'
                        rel='noreferrer'
                        className='aspect-[3/4] rounded-lg overflow-hidden mb-4 bg-slate-100 relative block cursor-pointer'
                      >
                        <img
                          src={book.thumbnail}
                          alt={book.title}
                          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                        />
                        {book.stockQuantity <= 0 && (
                          <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                            <span className='bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full'>
                              Hết hàng
                            </span>
                          </div>
                        )}
                      </a>

                      <div className='flex-1 flex flex-col'>
                        {/* 👉 BỌC TIÊU ĐỀ BẰNG THẺ LINK: Ấn vào tên sẽ mở trang chi tiết */}
                        <a
                          href={`/products/${book.slug}`}
                          target='_blank'
                          rel='noreferrer'
                          className='block mb-2'
                        >
                          <h3
                            className='text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-green-700 transition-colors'
                            title={book.title}
                          >
                            {book.title}
                          </h3>
                        </a>

                        <div className='mt-auto flex items-center justify-between'>
                          <div>
                            <span className='text-lg font-bold text-red-600 block leading-none'>
                              {new Intl.NumberFormat('vi-VN').format(book.salePrice)}đ
                            </span>
                            {(book.originalPrice ?? 0) > book.salePrice && (
                              <span className='text-xs text-slate-400 line-through mt-1 block'>
                                {new Intl.NumberFormat('vi-VN').format(
                                  book.originalPrice as number
                                )}
                                đ
                              </span>
                            )}
                          </div>

                          {/* NÚT THÊM VÀO GIỎ HÀNG */}
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation() // Chặn sự kiện click bị lây lan nếu cần
                              sendAiMessage(
                                `Thêm 1 cuốn sách có mã là ${book.slug} vào giỏ hàng (Tên sách: ${book.title})`
                              )
                              setIsExpanded(false)
                            }}
                            disabled={book.stockQuantity <= 0}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${book.stockQuantity > 0 ? 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white hover:scale-110' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                            title={book.stockQuantity > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                          >
                            <ShoppingCart size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className='h-full flex flex-col items-center justify-center text-slate-400'>
                <div className='w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4'>
                  <Bot size={40} className='text-slate-300' />
                </div>
                <p className='text-lg font-medium text-slate-600 mb-1'>Chưa có sản phẩm nào</p>
                <p className='text-sm'>Hãy hỏi AI về một chủ đề để xem các gợi ý.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AIChatPanel
