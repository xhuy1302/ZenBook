'use client'

import { useEffect, useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Zap, Loader2, CalendarClock } from 'lucide-react'
import { cn } from '@/lib/utils'

import {
  getTodayFlashSalesApi,
  getCategoriesByPromotionApi
} from '@/services/promotion/promotion.api'
import BookCard from '@/components/zenbook/homepage/BookCard'
import BreadcrumbHeader from '@/components/zenbook/breadcrumb/BreadCrumbHeader' // Giả sử path này đúng với project của bạn
import type { BookResponse } from '@/services/book/book.type'
import type { PromotionResponse } from '@/services/promotion/promotion.type'

function useCountdown(session?: PromotionResponse) {
  const [timeLeft, setTimeLeft] = useState(0)

  const targetDate = useMemo(() => {
    if (!session) return 0
    return session.status === 'SCHEDULED'
      ? new Date(session.startDate).getTime()
      : new Date(session.endDate).getTime()
  }, [session])

  useEffect(() => {
    if (!targetDate) return
    const update = () => {
      const now = new Date().getTime()
      const diff = Math.max(Math.floor((targetDate - now) / 1000), 0)
      setTimeLeft(diff)
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [targetDate])

  const h = String(Math.floor(timeLeft / 3600)).padStart(2, '0')
  const m = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0')
  const s = String(timeLeft % 60).padStart(2, '0')
  return { h, m, s, isZero: timeLeft === 0 }
}

function formatSessionLabel(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className='flex flex-col items-center'>
      <span className='flex h-10 w-10 items-center justify-center rounded-md bg-black/20 text-xl font-black text-white tabular-nums backdrop-blur-sm'>
        {value}
      </span>
      <span className='mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/70'>
        {label}
      </span>
    </div>
  )
}

function SessionTab({
  promotion,
  active,
  onClick
}: {
  promotion: PromotionResponse
  active: boolean
  onClick: () => void
}) {
  const label = formatSessionLabel(promotion.startDate)

  const getTabStyles = () => {
    if (promotion.status === 'EXPIRED') {
      return active
        ? 'bg-slate-400 text-white shadow-sm'
        : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
    }
    if (promotion.status === 'ACTIVE') {
      return active
        ? 'bg-rose-600 text-white shadow-[0_4px_15px_rgba(225,29,72,0.3)] scale-105'
        : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50'
    }
    return active
      ? 'bg-emerald-500 text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)] scale-105'
      : 'bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50'
  }

  const getStatusText = () => {
    if (promotion.status === 'ACTIVE') return 'Đang diễn ra'
    if (promotion.status === 'SCHEDULED') return 'Sắp diễn ra'
    return 'Đã kết thúc'
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center gap-0 w-[115px] h-[75px] rounded-xl transition-all duration-300 border overflow-hidden shrink-0',
        getTabStyles()
      )}
    >
      {active && (
        <div className='absolute top-0 right-0 w-0 h-0 border-t-[14px] border-t-white/30 border-l-[14px] border-l-transparent' />
      )}

      <span className='text-[9px] font-bold uppercase tracking-wider opacity-80'>
        {promotion.status === 'SCHEDULED' ? 'CHUẨN BỊ' : 'PHIÊN BÁN'}
      </span>

      <span className='text-xl font-black leading-tight tabular-nums'>{label}</span>

      <span
        className={cn(
          'text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mt-1',
          active ? 'bg-white/20' : 'bg-transparent'
        )}
      >
        {getStatusText()}
      </span>

      {promotion.status === 'ACTIVE' && (
        <span className='absolute top-1.5 right-1.5 flex h-2 w-2'>
          <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75'></span>
          <span className='relative inline-flex rounded-full h-2 w-2 bg-white'></span>
        </span>
      )}
    </button>
  )
}

export default function FlashSale() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('Tất cả')

  const { data: rawSessions = [], isLoading } = useQuery({
    queryKey: ['today-flash-sales'],
    queryFn: getTodayFlashSalesApi,
    staleTime: 60000
  })

  const sessions = useMemo(() => {
    const activeAndScheduled = rawSessions
      .filter((s) => s.status !== 'EXPIRED')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

    const expiredRecent = rawSessions
      .filter((s) => s.status === 'EXPIRED')
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
      .slice(0, 1)

    return [...expiredRecent, ...activeAndScheduled]
  }, [rawSessions])

  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      const priority =
        sessions.find((s) => s.status === 'ACTIVE') ||
        sessions.find((s) => s.status === 'SCHEDULED') ||
        sessions[0]
      setSelectedSessionId(priority.id)
    }
  }, [sessions, selectedSessionId])

  const currentSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId),
    [sessions, selectedSessionId]
  )

  const formattedDiscount = useMemo(() => {
    if (!currentSession) return ''
    const value = currentSession.discountValue
    if (value >= 1000) {
      return `${Math.floor(value / 1000)}K`
    }
    return `${value}%`
  }, [currentSession])

  const { h, m, s, isZero } = useCountdown(currentSession)

  const { data: categories = [] } = useQuery({
    queryKey: ['promotion-categories', selectedSessionId],
    queryFn: () => getCategoriesByPromotionApi(selectedSessionId!),
    enabled: !!selectedSessionId
  })

  const filteredBooks = useMemo(() => {
    if (!currentSession?.books) return []
    const books = currentSession.books.map((b) => ({ ...b, slug: b.id }) as unknown as BookResponse)
    if (activeCategory === 'Tất cả') return books
    return books.filter((book) => book.categories?.some((cat) => cat.name === activeCategory))
  }, [currentSession, activeCategory])

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center bg-white'>
        <Loader2 className='h-10 w-10 animate-spin text-emerald-600' />
      </div>
    )
  }

  const isScheduled = currentSession?.status === 'SCHEDULED'
  const isExpired =
    currentSession?.status === 'EXPIRED' || (currentSession?.status === 'ACTIVE' && isZero)

  return (
    <div className='min-h-screen bg-[#fafafa] pb-20'>
      {/* ── Thêm Breadcrumb Header vào đây ── */}
      <BreadcrumbHeader />

      <div
        className={cn(
          'relative overflow-hidden py-14 transition-all duration-700',
          isExpired
            ? 'bg-slate-400'
            : isScheduled
              ? 'bg-emerald-500'
              : 'bg-gradient-to-r from-rose-600 via-rose-500 to-orange-400'
        )}
      >
        <div className='absolute inset-0 opacity-10 pointer-events-none'>
          <Zap className='absolute -top-10 -right-10 w-64 h-64 rotate-12' />
        </div>

        <div className='relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 px-4 sm:flex-row'>
          <div className='flex items-center gap-5'>
            <div className='flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-lg shadow-2xl border border-white/30'>
              {isScheduled ? (
                <CalendarClock className='h-10 w-10 text-white' />
              ) : (
                <Zap
                  className={cn(
                    'h-10 w-10 fill-current',
                    isExpired ? 'text-slate-200' : 'text-yellow-300'
                  )}
                />
              )}
            </div>
            <div className='text-center sm:text-left text-white'>
              <h1 className='text-5xl font-black uppercase italic tracking-tighter drop-shadow-md'>
                Flash Sale
              </h1>
              <p className='text-sm font-bold uppercase tracking-[0.2em] opacity-90'>
                {currentSession?.name || 'Giờ vàng giá sốc'}
              </p>
            </div>
          </div>

          <div className='flex flex-col items-center gap-3 bg-black/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10'>
            <p className='text-xs font-black uppercase tracking-[0.15em] text-white/80'>
              {isExpired
                ? 'Sự kiện đã khép lại'
                : isScheduled
                  ? 'Mở bán chính thức sau'
                  : 'Thời gian còn lại'}
            </p>
            {!isExpired && (
              <div className='flex items-center gap-3'>
                <TimeBlock value={h} label='Giờ' />
                <span className='mb-4 text-2xl font-bold text-white/50'>:</span>
                <TimeBlock value={m} label='Phút' />
                <span className='mb-4 text-2xl font-bold text-white/50'>:</span>
                <TimeBlock value={s} label='Giây' />
              </div>
            )}
          </div>

          <div className='hidden flex-col items-end text-white sm:flex'>
            <span className='text-xs font-bold opacity-80 uppercase tracking-widest'>
              Sale Up To
            </span>
            <span className='text-7xl font-black leading-none text-yellow-300 drop-shadow-lg'>
              {formattedDiscount}
            </span>
          </div>
        </div>
      </div>

      <div className='border-b border-slate-200 bg-white shadow-sm'>
        <div className='mx-auto max-w-6xl px-4 py-4'>
          <div className='flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center'>
            {sessions.map((s) => (
              <SessionTab
                key={s.id}
                promotion={s}
                active={selectedSessionId === s.id}
                onClick={() => {
                  setSelectedSessionId(s.id)
                  setActiveCategory('Tất cả')
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-6xl px-4 py-12'>
        <div className='mb-12 flex flex-wrap gap-3 justify-center'>
          <button
            onClick={() => setActiveCategory('Tất cả')}
            className={cn(
              'rounded-full px-7 py-2.5 text-sm font-bold transition-all border-2 shadow-sm',
              activeCategory === 'Tất cả'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200'
                : 'bg-white text-slate-500 border-slate-100 hover:border-emerald-200 hover:text-emerald-600'
            )}
          >
            Tất cả sản phẩm
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={cn(
                'rounded-full px-7 py-2.5 text-sm font-bold transition-all border-2 shadow-sm',
                activeCategory === cat.name
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200'
                  : 'bg-white text-slate-500 border-slate-100 hover:border-emerald-200 hover:text-emerald-600'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div
          className={cn(
            'grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
            isScheduled && '[&_button]:hidden'
          )}
        >
          {filteredBooks.map((book) => (
            <div key={book.id} className='relative group'>
              <BookCard book={book} viewMode='grid' />

              {isScheduled && (
                <div className='absolute top-2 right-2 z-10'>
                  <span className='bg-emerald-600/90 text-white text-[9px] font-bold px-2 py-1 rounded-sm shadow-sm uppercase tracking-wider border border-emerald-500/20'>
                    Sắp mở bán
                  </span>
                </div>
              )}

              {isExpired && (
                <div className='absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] backdrop-grayscale-[1] pointer-events-none flex items-center justify-center rounded-2xl'>
                  <span className='bg-slate-800 text-white text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-widest'>
                    Hết lượt săn
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className='py-32 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-100 shadow-inner'>
            <div className='inline-block rounded-3xl bg-slate-50 p-10 mb-6'>
              <CalendarClock className='h-16 w-16 text-slate-200' />
            </div>
            <p className='text-slate-400 text-xl font-bold'>
              Chưa có đầu sách nào trong danh mục này
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
