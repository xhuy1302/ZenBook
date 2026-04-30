'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Bell,
  Package,
  Ticket,
  Crown,
  Heart,
  Info,
  MessageSquare,
  CheckCheck,
  Clock,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  getMyNotificationsApi,
  markAllAsReadApi,
  markAsReadApi
} from '@/services/notification/notification.api'

export interface NotificationItem {
  id: string
  type: string
  title: string
  content: string
  link: string
  read: boolean
  createdAt: string
}

const getNotifyIcon = (type: string) => {
  switch (type.toUpperCase()) {
    case 'ORDER':
      return <Package className='w-4 h-4 text-blue-500' />
    case 'PROMOTION':
      return <Ticket className='w-4 h-4 text-rose-500' />
    case 'MEMBERSHIP':
      return <Crown className='w-4 h-4 text-amber-500' />
    case 'WISHLIST':
      return <Heart className='w-4 h-4 text-pink-500' />
    case 'INTERACTION':
      return <MessageSquare className='w-4 h-4 text-emerald-500' />
    default:
      return <Info className='w-4 h-4 text-slate-500' />
  }
}

const isImportantNoti = (noti: NotificationItem) => {
  const type = noti.type.toUpperCase()
  const title = noti.title.toLowerCase()

  if (type === 'MEMBERSHIP') return true
  if (type === 'PROMOTION') return true

  if (
    type === 'ORDER' &&
    (title.includes('thanh toán') || title.includes('hoàn tiền') || title.includes('thành công'))
  ) {
    return true
  }

  return false
}

export default function NotificationPopover() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [isRinging, setIsRinging] = useState(false)

  const prevNotisRef = useRef<string[]>([])

  const { data: notifications = [], isLoading } = useQuery<NotificationItem[]>({
    queryKey: ['notifications'],
    queryFn: getMyNotificationsApi,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    refetchInterval: open ? false : 30000
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsReadMutation = useMutation({
    mutationFn: markAsReadApi,

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      const previous = queryClient.getQueryData<NotificationItem[]>(['notifications'])

      queryClient.setQueryData<NotificationItem[]>(['notifications'], (old = []) =>
        old.map((item) => (item.id === id ? { ...item, read: true } : item))
      )
      return { previous }
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
        refetchType: 'inactive'
      })
    }
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsReadApi,

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      const previous = queryClient.getQueryData<NotificationItem[]>(['notifications'])

      queryClient.setQueryData<NotificationItem[]>(['notifications'], (old = []) =>
        old.map((item) => ({ ...item, read: true }))
      )
      return { previous }
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
        refetchType: 'inactive'
      })
    }
  })

  const handleNotificationClick = (id: string, read: boolean, link: string) => {
    setOpen(false)

    if (!read) {
      markAsReadMutation.mutate(id)
    }

    if (link) {
      navigate(link)
    }
  }

  useEffect(() => {
    if (notifications.length === 0) return

    const currentIds = notifications.map((n) => n.id)
    const newItems = notifications.filter((n) => !prevNotisRef.current.includes(n.id) && !n.read)

    // ✅ Fix: Use ReturnType<typeof setTimeout> instead of NodeJS.Timeout
    let ringTimeoutId: ReturnType<typeof setTimeout>

    if (prevNotisRef.current.length > 0 && newItems.length > 0) {
      setTimeout(() => {
        setIsRinging(true)
      }, 0)

      ringTimeoutId = setTimeout(() => setIsRinging(false), 2500)

      newItems.forEach((item) => {
        if (isImportantNoti(item)) {
          toast('🔔 Thông báo mới', {
            description: item.title,
            duration: 4000,
            action: {
              label: 'Xem ngay',
              onClick: () => handleNotificationClick(item.id, item.read, item.link)
            },
            className: 'border-l-4 border-l-brand-green shadow-lg'
          })
        }
      })
    }

    prevNotisRef.current = currentIds

    return () => {
      if (ringTimeoutId) {
        clearTimeout(ringTimeoutId)
      }
    }
  }, [notifications]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className='relative flex items-center gap-1.5 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-all text-white/90 group'>
          <div
            className={cn(
              'relative flex items-center justify-center',
              isRinging && 'animate-bounce'
            )}
          >
            <Bell
              className={cn(
                'w-3.5 h-3.5 transition-transform origin-top',
                isRinging
                  ? 'text-amber-400 rotate-12 scale-110'
                  : 'text-white/80 group-hover:rotate-12'
              )}
            />
          </div>

          <span className='font-medium text-[12px]'>Thông báo</span>

          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center bg-rose-500 text-[9px] font-bold text-white rounded-full border-2 border-brand-green',
                isRinging && 'animate-pulse scale-110'
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align='end'
        className='w-80 md:w-[380px] p-0 mr-4 mt-2 shadow-2xl border-slate-100 rounded-2xl overflow-hidden'
      >
        <div className='p-4 border-b bg-white flex items-center justify-between'>
          <h3 className='font-bold text-slate-800'>Thông báo</h3>

          <Button
            variant='ghost'
            size='sm'
            disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
            onClick={() => markAllAsReadMutation.mutate()}
            className='text-[11px] text-brand-green font-semibold h-7 px-2 disabled:opacity-50 hover:bg-brand-green/10'
          >
            {markAllAsReadMutation.isPending ? (
              <Loader2 className='w-3 h-3 animate-spin' />
            ) : (
              <>
                <CheckCheck className='w-3 h-3 mr-1' />
                Đánh dấu đã đọc
              </>
            )}
          </Button>
        </div>

        <ScrollArea className='h-[400px] bg-white'>
          {isLoading ? (
            <div className='flex justify-center py-10'>
              <Loader2 className='w-6 h-6 animate-spin text-brand-green' />
            </div>
          ) : notifications.length > 0 ? (
            <div className='flex flex-col'>
              {notifications.map((noti) => (
                <div
                  key={noti.id}
                  onClick={() => handleNotificationClick(noti.id, noti.read, noti.link)}
                  className={cn(
                    'p-4 border-b border-slate-50 flex gap-3 hover:bg-slate-50 transition-colors relative group cursor-pointer',
                    !noti.read && 'bg-brand-green/5 hover:bg-brand-green/[0.08]'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white transition-transform group-hover:scale-105',
                      noti.read ? 'bg-slate-100' : 'bg-white'
                    )}
                  >
                    {getNotifyIcon(noti.type)}
                  </div>

                  <div className='flex flex-col gap-1 min-w-0'>
                    <p
                      className={cn(
                        'text-[13px] leading-tight pr-4',
                        noti.read ? 'text-slate-600 font-medium' : 'text-slate-900 font-bold'
                      )}
                    >
                      {noti.title}
                    </p>

                    <p className='text-[12px] text-slate-500 line-clamp-2 leading-relaxed'>
                      {noti.content}
                    </p>

                    <div className='flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-medium'>
                      <Clock className='w-3 h-3' />
                      {formatDistanceToNow(new Date(noti.createdAt), {
                        addSuffix: true,
                        locale: vi
                      })}
                    </div>
                  </div>

                  {!noti.read && (
                    <div className='absolute top-5 right-4 w-2 h-2 bg-brand-green rounded-full shadow-sm shadow-brand-green/50' />
                  )}

                  <ChevronRight className='absolute bottom-4 right-2 w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1' />
                </div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-20 px-10 text-center'>
              <div className='w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4'>
                <Bell className='w-8 h-8 text-slate-200' />
              </div>

              <p className='text-sm font-medium text-slate-500'>Bạn chưa có thông báo nào</p>
            </div>
          )}
        </ScrollArea>

        <Link
          to='/customer/notifications'
          onClick={() => setOpen(false)}
          className='block p-3 text-center text-xs font-bold text-slate-500 hover:text-brand-green hover:bg-slate-50 bg-white border-t border-slate-100 transition-all uppercase tracking-wider'
        >
          Xem tất cả thông báo
        </Link>
      </PopoverContent>
    </Popover>
  )
}
