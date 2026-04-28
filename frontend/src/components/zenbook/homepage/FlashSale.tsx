'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Zap, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

import { getTodayFlashSalesApi } from '@/services/promotion/promotion.api'
import type { BookResponse } from '@/services/book/book.type'
import type { PromotionResponse } from '@/services/promotion/promotion.type'
import BookCard from '@/components/zenbook/homepage/BookCard'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSessionTabLabel(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  if (isToday) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `Ngày ${day}/${month}`
}

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
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const distance = Math.floor((targetDate - now) / 1000)
      setTimeLeft(distance > 0 ? distance : 0)
    }
    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0')
  const seconds = String(timeLeft % 60).padStart(2, '0')

  return { hours, minutes, seconds, isEnded: timeLeft <= 0 }
}

const ITEMS_PER_PAGE = 5

// ─── Main Component ──────────────────────────────────────────────────────────

export default function FlashSaleWidget() {
  const { t } = useTranslation('common')
  const [page, setPage] = useState(0)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  const { data: rawSessions = [], isLoading } = useQuery({
    queryKey: ['today-flash-sales-widget'],
    queryFn: getTodayFlashSalesApi,
    staleTime: 5 * 60 * 1000
  })

  // 👉 CHỈ LẤY ACTIVE VÀ SCHEDULED (Bỏ Expired)
  const sessions = useMemo(() => {
    return rawSessions.filter((s) => s.status !== 'EXPIRED')
  }, [rawSessions])

  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      const active = sessions.find((s) => s.status === 'ACTIVE')
      const upcoming = sessions.find((s) => s.status === 'SCHEDULED')
      setSelectedSessionId(active?.id || upcoming?.id || sessions[0].id)
    }
  }, [sessions, selectedSessionId])

  const currentSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId),
    [sessions, selectedSessionId]
  )

  const { hours, minutes, seconds, isEnded } = useCountdown(currentSession)

  const booksToRender = useMemo(() => {
    if (!currentSession?.books) return []
    return currentSession.books.map((b) => ({ ...b, slug: b.id }) as unknown as BookResponse)
  }, [currentSession])

  const totalPages = Math.ceil(booksToRender.length / ITEMS_PER_PAGE)
  const visibleBooks = booksToRender.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  )

  if (isLoading) {
    return (
      <section className='max-w-7xl mx-auto px-4 py-4'>
        <div className='rounded-xl bg-slate-50 h-[380px] flex items-center justify-center border border-dashed border-slate-200'>
          <Loader2 className='w-8 h-8 animate-spin text-brand-green' />
        </div>
      </section>
    )
  }

  if (sessions.length === 0) return null

  const isScheduled = currentSession?.status === 'SCHEDULED'
  // Nếu session kết thúc ngay lúc đang xem (isEnded), ta cũng coi như expired
  const isNowExpired = isEnded && currentSession?.status === 'ACTIVE'

  return (
    <section className='max-w-7xl mx-auto px-4 py-4'>
      <div
        className={cn(
          'rounded-xl border overflow-hidden shadow-sm transition-colors duration-500',
          isScheduled ? 'bg-emerald-50 border-emerald-200' : 'bg-[#FDE2E4] border-brand-red/20',
          isNowExpired && 'bg-slate-100 border-slate-200'
        )}
      >
        {/* ── Header Banner ── */}
        <div className='bg-white m-3 rounded-lg px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm'>
          <div className='flex flex-wrap items-center gap-4'>
            <div
              className={cn(
                'flex items-center font-black text-xl italic tracking-tight uppercase',
                isScheduled
                  ? 'text-emerald-600'
                  : isNowExpired
                    ? 'text-slate-500'
                    : 'text-brand-red'
              )}
            >
              FLASH{' '}
              <Zap
                className={cn(
                  'w-6 h-6 mx-1 fill-current',
                  isScheduled ? 'text-emerald-400' : 'text-yellow-400'
                )}
              />{' '}
              SALE
            </div>

            <div className='flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg'>
              {sessions.map((session) => {
                const isActiveTab = selectedSessionId === session.id
                return (
                  <button
                    key={session.id}
                    onClick={() => {
                      setSelectedSessionId(session.id)
                      setPage(0)
                    }}
                    className={cn(
                      'px-3 py-1 rounded-md text-[11px] font-bold transition-all border',
                      isActiveTab
                        ? session.status === 'SCHEDULED'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-brand-red text-white border-brand-red'
                        : 'bg-transparent border-transparent text-slate-500 hover:bg-white'
                    )}
                  >
                    {formatSessionTabLabel(session.startDate)}
                    {session.status === 'SCHEDULED' && (
                      <span className='ml-1 w-1.5 h-1.5 bg-white rounded-full inline-block animate-pulse' />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Countdown Section */}
            {!isNowExpired && (
              <div className='flex items-center gap-2 px-3 border-l border-slate-200 hidden sm:flex'>
                <span
                  className={cn(
                    'text-[12px] font-bold uppercase',
                    isScheduled ? 'text-emerald-600' : 'text-slate-500'
                  )}
                >
                  {isScheduled ? 'Chuẩn bị bắt đầu' : t('flashSale.endsIn')}:
                </span>
                <div className='flex items-center gap-1'>
                  {[hours, minutes, seconds].map((unit, i) => (
                    <div key={i} className='flex items-center gap-1'>
                      <div
                        className={cn(
                          'text-white font-mono font-bold text-sm px-2 py-0.5 rounded',
                          isScheduled ? 'bg-emerald-600' : 'bg-slate-800'
                        )}
                      >
                        {unit}
                      </div>
                      {i < 2 && <span className='font-bold text-slate-800'>:</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {isNowExpired && (
              <span className='text-xs font-bold uppercase text-slate-400 border-l px-3'>
                Đã kết thúc
              </span>
            )}
          </div>

          <Button
            variant='ghost'
            size='sm'
            className='text-brand-green font-bold text-sm gap-1 hover:bg-emerald-50'
            asChild
          >
            <Link to='/flash-sale'>
              {t('bookGrid.viewAll')} <ChevronRight className='w-4 h-4' />
            </Link>
          </Button>
        </div>

        {/* ── Book Grid ── */}
        <div className='relative px-4 pb-5'>
          {page > 0 && (
            <button
              onClick={() => setPage((p) => p - 1)}
              className='absolute left-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-lg border flex items-center justify-center hover:bg-slate-50'
            >
              <ChevronLeft className='w-5 h-5 text-slate-600' />
            </button>
          )}
          {page < totalPages - 1 && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className='absolute right-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-lg border flex items-center justify-center hover:bg-slate-50'
            >
              <ChevronRight className='w-5 h-5 text-slate-600' />
            </button>
          )}

          <div
            className={cn(
              'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 px-2',
              isScheduled && '[&_button]:hidden' // 👉 CHỈ ẨN NÚT (Button), KHÔNG ẨN LINK (a) ĐỂ VẪN CLICK XEM CHI TIẾT ĐƯỢC
            )}
          >
            {visibleBooks.map((book) => (
              <div key={book.id} className='h-full relative group overflow-hidden rounded-xl'>
                <BookCard book={book} viewMode='grid' />

                {/* Badge Sắp mở bán: Vuông, sát góc, chìm vào card */}
                {isScheduled && (
                  <div className='absolute top-0 right-0 z-20'>
                    <span className='bg-emerald-500 text-white text-[9px] font-black px-2 py-1 uppercase shadow-sm'>
                      Sắp mở bán
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
