// File: src/components/chat/SupportChat.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { Bot, MessageSquare } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import HumanChatPanel from './HumanChatPanel'
import AIChatPanel from './AIChatPanel'
import { useSupportChat } from '@/hooks/useSupportChat'
import { getRoomByUserIdApi, getChatHistoryApi } from '@/services/chat/chat.api'
import type { ChatRoomResponse } from '@/services/chat/chat.type'

interface Props {
  currentUser: { id: string; username: string; roles: string[] }
  isAdmin?: boolean
  adminTargetUserId?: string
}

const SupportChat: React.FC<Props> = ({ currentUser, isAdmin = false, adminTargetUserId }) => {
  const [activePanel, setActivePanel] = useState<'NONE' | 'SUPPORT' | 'AI'>('NONE')
  const [unreadCountForGuest, setUnreadCountForGuest] = useState<number>(0)
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [currentRoom, setCurrentRoom] = useState<ChatRoomResponse | null>(null)

  const isStoreActor = currentUser.roles.some((r) => r === 'ADMIN' || r === 'STAFF')
  const queryClient = useQueryClient()

  // 1. ELEVATE STATE: Move useSupportChat here to track messages globally
  const { messages, setMessages, sendTextMessage, sendProductMessage, roomStatusLive } =
    useSupportChat(currentUser.id)

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
    } catch (e) {
      console.error('Lỗi tải lịch sử chat', e)
    }
  }, [isStoreActor, adminTargetUserId, currentUser.id, setMessages])

  useEffect(() => {
    loadChatData()
  }, [loadChatData])

  // 2. GLOBAL UNREAD TRACKING
  useEffect(() => {
    if (!currentRoom || currentUser.id === '') return

    const unreadMsgs = messages.filter((m) => m.senderId !== currentUser.id && m.status !== 'SEEN')

    // If the human panel is open, the child component will handle marking them as seen.
    // If it's closed, we just update the badge count here.
    if (activePanel !== 'SUPPORT' && !isAdmin) {
      setUnreadCountForGuest(unreadMsgs.length)
    }
  }, [messages, activePanel, currentRoom, currentUser.id, isAdmin])

  return (
    <>
      <style>{`
        .sup-panel { animation: slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .sup-scroll::-webkit-scrollbar { width: 4px; }
        .sup-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 4px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {isAdmin ? (
        <HumanChatPanel
          currentUser={currentUser}
          isAdmin={isAdmin}
          adminTargetUserId={adminTargetUserId}
          isStoreActor={isStoreActor}
          // Pass down the global state
          messages={messages}
          setMessages={setMessages}
          sendTextMessage={sendTextMessage}
          sendProductMessage={sendProductMessage}
          roomStatusLive={roomStatusLive}
          currentRoom={currentRoom}
          setCurrentRoom={setCurrentRoom}
        />
      ) : (
        <div
          className={`fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 font-sans ${isExpanded ? 'inset-4 bottom-4 right-4' : ''}`}
        >
          {activePanel === 'SUPPORT' && (
            <div
              className='sup-panel flex flex-col rounded-2xl overflow-hidden bg-white shadow-2xl border'
              style={{ width: '360px', height: '540px' }}
            >
              <HumanChatPanel
                currentUser={currentUser}
                isAdmin={false}
                isStoreActor={isStoreActor}
                onClose={() => setActivePanel('NONE')}
                setUnreadCount={setUnreadCountForGuest}
                // Pass down the global state
                messages={messages}
                setMessages={setMessages}
                sendTextMessage={sendTextMessage}
                sendProductMessage={sendProductMessage}
                roomStatusLive={roomStatusLive}
                currentRoom={currentRoom}
                setCurrentRoom={setCurrentRoom}
              />
            </div>
          )}

          {activePanel === 'AI' && (
            <AIChatPanel
              onClose={() => {
                setActivePanel('NONE')
                setIsExpanded(false)
              }}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
            />
          )}

          {activePanel === 'NONE' && !isAdmin && (
            <div className='flex flex-col bg-[#16a34a] rounded-full shadow-2xl overflow-hidden border-[1.5px] border-white absolute bottom-0 right-0'>
              <button
                onClick={() => setActivePanel('AI')}
                className='flex flex-col items-center justify-center w-[58px] h-[58px] hover:bg-white/10 text-white transition-colors'
              >
                <Bot size={24} />
                <span className='text-[9px] font-bold mt-1'>Trợ lý AI</span>
              </button>
              <div className='w-8 h-[1px] bg-white/20 mx-auto' />
              <button
                onClick={() => {
                  setActivePanel('SUPPORT')
                  setUnreadCountForGuest(0) // Immediately clear badge on open
                }}
                className='relative flex flex-col items-center justify-center w-[58px] h-[58px] hover:bg-white/10 text-white transition-colors'
              >
                <MessageSquare size={22} />
                <span className='text-[9px] font-bold mt-1'>CSKH</span>
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

export default SupportChat
