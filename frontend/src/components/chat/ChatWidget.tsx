import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChatStream } from '@/hooks/useChatStream'
import { Send, Bot, User, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

// ─── ZBook Brand Logo ───────────────────────────────────────────────────────
const ZBookLogo = ({ size = 20 }: { size?: number }) => (
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

// ─── Floating Trigger Button ─────────────────────────────────────────────────
const TriggerButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
      boxShadow: '0 4px 24px rgba(22,163,74,0.45), 0 1px 4px rgba(0,0,0,0.1)'
    }}
    className='group relative flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-2xl
      hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-0 outline-none'
  >
    {/* Logo icon */}
    <div className='flex items-center justify-center w-8 h-8 rounded-xl bg-white/20'>
      <ZBookLogo size={20} />
    </div>

    {/* Brand text */}
    <div className='flex flex-col items-start leading-none'>
      <span
        className='text-white font-bold tracking-tight'
        style={{ fontFamily: "'Georgia', serif", fontSize: '15px', letterSpacing: '-0.3px' }}
      >
        ZBook
      </span>
      <span className='text-green-100 text-[10px] font-medium opacity-80'>AI Trợ lý</span>
    </div>

    {/* Ping dot */}
    <span className='absolute -top-1 -right-1 flex h-3 w-3'>
      <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75' />
      <span className='relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border-2 border-white' />
    </span>
  </button>
)

// ─── Main ChatWidget ──────────────────────────────────────────────────────────
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [inputMsg, setInputMsg] = useState<string>('')
  const navigate = useNavigate()

  const { messages, sendMessage, isTyping, messagesEndRef } = useChatStream()

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inputMsg.trim() || isTyping) return
    sendMessage(inputMsg)
    setInputMsg('')
  }

  const renderMessageContent = (content: string) => {
    const hasLoginAction = content.includes('[ACTION:LOGIN]')
    const cleanContent = content.replace('[ACTION:LOGIN]', '')

    return (
      <div className='flex flex-col gap-2'>
        <div className='prose prose-sm text-left leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0'>
          <ReactMarkdown>{cleanContent}</ReactMarkdown>
        </div>
        {hasLoginAction && (
          <button
            onClick={() => {
              setIsOpen(false)
              navigate('/login')
            }}
            style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
            className='w-fit mt-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold
              shadow-sm hover:opacity-90 active:scale-95 transition-all'
          >
            🔒 Đăng nhập ngay
          </button>
        )}
      </div>
    )
  }

  return (
    <div className='fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 font-sans'>
      {/* ── Chat Panel ── */}
      {isOpen && (
        <div
          className='w-[370px] flex flex-col rounded-2xl overflow-hidden'
          style={{
            height: '580px',
            boxShadow: '0 8px 40px rgba(22,163,74,0.18), 0 2px 12px rgba(0,0,0,0.12)',
            border: '1px solid rgba(22,163,74,0.15)',
            animation: 'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)'
          }}
        >
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(16px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0)   scale(1);    }
            }
            @keyframes fadeInMsg {
              from { opacity: 0; transform: translateY(6px); }
              to   { opacity: 1; transform: translateY(0);   }
            }
            .msg-appear { animation: fadeInMsg 0.2s ease-out; }
            .dot-bounce span { display: inline-block; animation: dotBounce 1.2s infinite; }
            .dot-bounce span:nth-child(2) { animation-delay: 0.15s; }
            .dot-bounce span:nth-child(3) { animation-delay: 0.30s; }
            @keyframes dotBounce {
              0%,60%,100% { transform: translateY(0); }
              30%          { transform: translateY(-4px); }
            }
            .chat-scroll::-webkit-scrollbar { width: 4px; }
            .chat-scroll::-webkit-scrollbar-thumb { background: #d1fae5; border-radius: 4px; }
          `}</style>

          {/* ── Header ── */}
          <div
            className='flex items-center justify-between px-4 py-3 shrink-0'
            style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
          >
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-xl flex items-center justify-center bg-white/15 border border-white/25'>
                <ZBookLogo size={22} />
              </div>
              <div>
                <div className='flex items-center gap-1.5'>
                  <span
                    className='text-white font-bold text-base'
                    style={{ fontFamily: "'Georgia', serif", letterSpacing: '-0.3px' }}
                  >
                    ZBook
                  </span>
                  <span className='text-[10px] bg-emerald-300/30 text-emerald-100 px-1.5 py-0.5 rounded-full font-medium border border-emerald-300/20'>
                    AI
                  </span>
                </div>
                <div className='flex items-center gap-1 mt-0.5'>
                  <span className='w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse' />
                  <span className='text-green-100 text-[10px] opacity-80'>
                    Trợ lý sách thông minh
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className='w-8 h-8 rounded-full flex items-center justify-center
                bg-white/10 hover:bg-white/25 active:bg-white/30 border border-white/20
                text-white transition-all cursor-pointer'
            >
              <X size={15} />
            </button>
          </div>

          {/* ── Messages ── */}
          <div className='flex-1 overflow-y-auto flex flex-col gap-3 p-4 chat-scroll bg-[#f0fdf4]'>
            {/* Subtle pattern background */}
            <div
              className='absolute inset-0 pointer-events-none opacity-[0.03]'
              style={{
                backgroundImage: 'radial-gradient(#16a34a 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`msg-appear flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Bot avatar */}
                {msg.role === 'bot' && (
                  <div
                    className='w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5'
                    style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
                  >
                    <Bot size={13} className='text-white' />
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`px-3.5 py-2.5 rounded-2xl max-w-[82%] text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-white rounded-tr-sm'
                      : 'bg-white text-gray-700 rounded-tl-sm border border-green-100'
                  }`}
                  style={
                    msg.role === 'user'
                      ? {
                          background: 'linear-gradient(135deg, #16a34a, #15803d)',
                          boxShadow: '0 2px 8px rgba(22,163,74,0.25)'
                        }
                      : { boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }
                  }
                >
                  {msg.role === 'bot' ? renderMessageContent(msg.content) : msg.content}
                </div>

                {/* User avatar */}
                {msg.role === 'user' && (
                  <div className='w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0 mt-0.5 border border-green-200'>
                    <User size={13} className='text-green-600' />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className='flex items-center gap-2'>
                <div
                  className='w-7 h-7 rounded-lg flex items-center justify-center shrink-0'
                  style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
                >
                  <Bot size={13} className='text-white' />
                </div>
                <div
                  className='px-3.5 py-2.5 bg-white rounded-2xl rounded-tl-sm border border-green-100'
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                  <div className='dot-bounce flex gap-1 items-center h-4'>
                    <span className='w-1.5 h-1.5 rounded-full bg-green-400 inline-block' />
                    <span className='w-1.5 h-1.5 rounded-full bg-green-400 inline-block' />
                    <span className='w-1.5 h-1.5 rounded-full bg-green-400 inline-block' />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input Footer ── */}
          <div className='px-3 py-3 bg-white border-t border-green-100 shrink-0'>
            <form onSubmit={handleSend} className='flex gap-2 items-center'>
              <input
                placeholder='Hỏi gì về sách đi...'
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                autoFocus
                className='flex-1 h-10 px-4 rounded-full text-sm bg-green-50 border border-green-200
                  outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100
                  placeholder:text-gray-400 text-gray-700 transition-all'
              />
              <button
                type='submit'
                disabled={!inputMsg.trim() || isTyping}
                className='w-10 h-10 rounded-full flex items-center justify-center shrink-0
                  disabled:opacity-40 disabled:cursor-not-allowed
                  hover:opacity-90 active:scale-95 transition-all cursor-pointer border-0'
                style={{
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  boxShadow: '0 2px 8px rgba(22,163,74,0.35)'
                }}
              >
                <Send size={16} className='text-white translate-x-[1px]' />
              </button>
            </form>

            {/* Branding footer */}
            <p className='text-center text-[10px] text-gray-400 mt-2'>
              Powered by{' '}
              <span
                className='text-green-600 font-semibold'
                style={{ fontFamily: "'Georgia', serif" }}
              >
                ZBook
              </span>{' '}
              AI
            </p>
          </div>
        </div>
      )}

      {/* ── Trigger ── */}
      {!isOpen && <TriggerButton onClick={() => setIsOpen(true)} />}
    </div>
  )
}
