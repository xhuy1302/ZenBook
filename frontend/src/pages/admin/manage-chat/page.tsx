import React, { useState, useEffect } from 'react'
import { getAdminRoomsApi } from '@/services/chat/chat.api'
import type { ChatRoomResponse } from '@/services/chat/chat.type'
import SupportChat from '@/components/support-chat/SupportChat'
import { useAuth } from '@/context/AuthContext'
import {
  Headphones,
  MessageSquare,
  Search,
  Users,
  Clock,
  Activity,
  Gem,
  Crown,
  Shield,
  Medal
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

// ─── User Avatar ──────────────────────────────────────────────────────────────
const UserAvatar = ({
  avatarUrl,
  isOnline,
  nameFallback
}: {
  avatarUrl?: string
  isOnline?: boolean
  nameFallback: string
}) => {
  const initials = nameFallback.substring(0, 2).toUpperCase()
  return (
    <div className='relative shrink-0'>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt='avatar'
          className='w-10 h-10 rounded-full object-cover border border-slate-200'
        />
      ) : (
        <div className='w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-700 text-sm font-bold'>
          {initials}
        </div>
      )}
      <span
        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-[2.5px] border-white ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}
      />
    </div>
  )
}

// ─── Format time ──────────────────────────────────────────────────────────────
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000)
  if (diffMins < 1) return 'Vừa xong'
  if (diffMins < 60) return `${diffMins}m`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

// ─── Tier Badge Helper ────────────────────────────────────────────────────────
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

// ─── Status Badge Helper ────────────────────────────────────────────
const renderStatusBadge = (status?: string) => {
  switch (status) {
    case 'PENDING':
      return (
        <span className='bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded text-[8px] font-bold shrink-0 border border-orange-200'>
          PENDING
        </span>
      )
    case 'RESOLVED':
      return (
        <span className='bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded text-[8px] font-bold shrink-0 border border-emerald-200'>
          RESOLVED
        </span>
      )
    case 'CLOSED':
      return (
        <span className='bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded text-[8px] font-bold shrink-0 border border-slate-300'>
          CLOSED
        </span>
      )
    default:
      return (
        <span className='bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[8px] font-bold shrink-0 border border-emerald-200'>
          OPEN
        </span>
      )
  }
}

const AdminChatPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<{ id: string; username: string } | null>(null)
  const { user: currentAdmin } = useAuth()
  const [currentTime, setCurrentTime] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const { data: chatRooms = [], isLoading: loading } = useQuery({
    queryKey: ['admin-chat-rooms', 'sidebar-badge'],
    queryFn: getAdminRoomsApi,
    refetchInterval: 15000,
    enabled: !!currentAdmin
  })

  const q = search.toLowerCase().trim()
  const filtered = q
    ? chatRooms.filter(
        (r: ChatRoomResponse) =>
          r.customerName?.toLowerCase().includes(q) || r.userId.toLowerCase().includes(q)
      )
    : chatRooms

  const activeRooms = chatRooms.filter(
    (r: ChatRoomResponse) => currentTime - new Date(r.updatedAt).getTime() < 5 * 60 * 1000
  ).length

  return (
    <div className='flex flex-col h-full w-full p-3 overflow-hidden font-sans'>
      {/* ── Header Gọn ── */}
      <div className='flex items-center justify-between bg-white/80 backdrop-blur-md border rounded-xl px-4 py-2 shadow-sm shrink-0 mb-3'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100'>
            <Headphones size={16} className='text-white' />
          </div>
          <div>
            <h1 className='text-sm font-bold text-slate-800 leading-none'>Hỗ trợ ZenBook</h1>
            <p className='text-[10px] text-slate-400 font-medium uppercase mt-1'>
              Hệ thống tư vấn trực tuyến
            </p>
          </div>
        </div>

        {/* ── Stats Pills ── */}
        <div className='flex items-center gap-3 bg-slate-50/50 px-3 py-1.5 rounded-lg border border-slate-100'>
          <div className='flex items-center gap-1.5'>
            <Users size={12} className='text-emerald-500' />
            <span className='text-xs font-bold text-slate-700'>{chatRooms.length}</span>
            <span className='text-[10px] text-slate-400 font-medium'>Tổng</span>
          </div>
          <div className='w-px h-3 bg-slate-200' />
          <div className='flex items-center gap-1.5'>
            <Activity size={12} className='text-emerald-500' />
            <span className='text-xs font-bold text-slate-700'>{activeRooms}</span>
            <span className='text-[10px] text-slate-400 font-medium'>Online</span>
          </div>
          <div className='w-px h-3 bg-slate-200' />
          <div className='flex items-center gap-1.5'>
            <Clock size={12} className='text-amber-500' />
            <span className='text-xs font-bold text-slate-700'>
              {chatRooms.length - activeRooms}
            </span>
            <span className='text-[10px] text-slate-400 font-medium'>Chờ</span>
          </div>
        </div>
      </div>

      {/* ── Layout Chính ── */}
      <div className='flex-1 flex min-h-0 border border-slate-200 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/40 bg-white/40 backdrop-blur-sm'>
        {/* ── Sidebar ── */}
        <div className='w-[320px] flex flex-col border-r border-slate-100 shrink-0'>
          <div className='p-3 border-b bg-white/60'>
            <div className='relative'>
              <Search
                className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                size={14}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Tìm tên khách, ID...'
                className='w-full pl-9 pr-3 py-2 bg-slate-100/50 border-none rounded-lg text-[13px] outline-none focus:ring-1 focus:ring-emerald-400 transition-all'
              />
            </div>
          </div>

          <div className='flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar'>
            {loading ? (
              <div className='p-4 text-center text-xs text-slate-400'>Đang tải dữ liệu...</div>
            ) : (
              filtered.map((room: ChatRoomResponse) => {
                const isSelected = selectedUser?.id === room.userId
                const isOnline = currentTime - new Date(room.updatedAt).getTime() < 5 * 60 * 1000
                const displayName = room.customerName || `Khách #${room.userId.substring(0, 6)}`

                return (
                  <button
                    key={room.id}
                    onClick={() =>
                      setSelectedUser({
                        id: room.userId,
                        username: displayName
                      })
                    }
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                        : 'bg-transparent border-transparent hover:bg-white/80 hover:border-slate-200'
                    }`}
                  >
                    <UserAvatar
                      avatarUrl={room.customerAvatar}
                      isOnline={isOnline}
                      nameFallback={displayName}
                    />

                    <div className='flex-1 min-w-0'>
                      <div className='flex justify-between items-center mb-1'>
                        <div className='flex items-center gap-1.5 overflow-hidden'>
                          <span
                            className={`text-[13px] font-bold truncate ${isSelected ? 'text-emerald-700' : 'text-slate-800'}`}
                          >
                            {displayName}
                          </span>
                          {renderStatusBadge(room.status)}
                          {renderTierBadge(room.customerTier)}
                        </div>
                        <span className='text-[10px] text-slate-400 shrink-0 pl-2'>
                          {formatTime(room.updatedAt)}
                        </span>
                      </div>

                      <div className='flex justify-between items-center'>
                        <p
                          className={`text-[11px] truncate pr-2 ${room.unreadCount > 0 ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}
                        >
                          {isOnline ? 'Đang hoạt động' : 'Nhấn để xem tin nhắn'}
                        </p>

                        {room.unreadCount > 0 && (
                          <span className='bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm shrink-0'>
                            {room.unreadCount > 99 ? '99+' : room.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ── Khung hiển thị nội dung Chat ── */}
        <div className='flex-1 flex flex-col relative min-w-0 overflow-hidden'>
          {selectedUser && currentAdmin ? (
            <div className='absolute inset-0 flex flex-col'>
              <SupportChat
                currentUser={currentAdmin}
                isAdmin={true}
                adminTargetUserId={selectedUser.id}
              />
            </div>
          ) : (
            <div className='h-full flex flex-col items-center justify-center text-slate-300 p-6 bg-slate-50/20'>
              <div className='w-16 h-16 rounded-3xl bg-white/80 border border-slate-100 flex items-center justify-center shadow-sm mb-4'>
                <MessageSquare size={32} className='opacity-10 text-emerald-900' />
              </div>
              <p className='text-sm font-bold text-slate-500'>Sẵn sàng hỗ trợ khách hàng</p>
              <p className='text-[11px] text-slate-400 mt-1 uppercase tracking-widest font-medium'>
                Chọn một cuộc hội thoại để bắt đầu
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  )
}

export default AdminChatPage
