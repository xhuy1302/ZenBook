'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  getMyMembershipApi,
  getPointHistoriesApi,
  checkInApi,
  exchangeVoucherApi
} from '@/services/member/member.api'
import type {
  MemberInfoResponse,
  PointHistoryResponse,
  BackendTier
} from '@/services/member/member.type'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Flame, CheckCircle2, Info, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// 👉 Breadcrumb của bạn
import BreadcrumbHeader from '@/components/zenbook/breadcrumb/BreadCrumbHeader'

// --- Types & Mappers ---
type UiTier = 'leaf' | 'silver' | 'gold' | 'platinum' | 'diamond'
type HistoryDisplayType = 'earn' | 'redeem' | 'other'

function toUiTier(tier: BackendTier): UiTier {
  const map: Record<BackendTier, UiTier> = {
    member: 'leaf',
    silver: 'silver',
    gold: 'gold',
    platinum: 'platinum',
    diamond: 'diamond'
  }
  return map[tier] ?? 'leaf'
}

function toDisplayType(type: PointHistoryResponse['type']): HistoryDisplayType {
  if (type === 'earn') return 'earn'
  if (type === 'redeem') return 'redeem'
  return 'other'
}

// --- Constants (GIỮ NGUYÊN TOÀN BỘ CONFIG CỦA BẠN) ---
const TIER_CONFIG: Record<
  UiTier,
  {
    label: string
    icon: string
    min: number
    max: number | null
    color: string
    gradient: string
    perks: string[]
  }
> = {
  leaf: {
    label: 'Đồng',
    icon: '🌱',
    min: 0,
    max: 1999999,
    color: 'text-green-600',
    gradient: 'from-green-700 to-green-500',
    perks: ['Hệ số điểm thưởng x1.0', 'Mua sắm tích lũy ZPoints']
  },
  silver: {
    label: 'Bạc',
    icon: '🌿',
    min: 2000000,
    max: 4999999,
    color: 'text-slate-500',
    gradient: 'from-slate-600 to-slate-400',
    perks: ['Voucher sinh nhật 5%', 'Ưu tiên CSKH', 'Tích điểm x1.05', 'Nhận thông báo sale sớm 1h']
  },
  gold: {
    label: 'Vàng',
    icon: '⭐',
    min: 5000000,
    max: 9999999,
    color: 'text-amber-600',
    gradient: 'from-amber-600 to-yellow-400',
    perks: [
      'Voucher tháng 10%',
      'Freeship 3-5 đơn/tháng',
      'Tích điểm x1.10',
      'Quyền đổi trả +7 ngày',
      'Ưu tiên giữ sách hot 24h'
    ]
  },
  platinum: {
    label: 'Bạch Kim',
    icon: '💠',
    min: 10000000,
    max: 19999999,
    color: 'text-purple-600',
    gradient: 'from-purple-700 to-indigo-500',
    perks: [
      'Freeship unlimited',
      'Preorder sớm 24-48h',
      'Box quà sinh nhật',
      'Tích điểm x1.20',
      'Quà Collector'
    ]
  },
  diamond: {
    label: 'Kim Cương',
    icon: '💎',
    min: 20000000,
    max: null,
    color: 'text-sky-600',
    gradient: 'from-sky-700 to-blue-500',
    perks: [
      'CSKH & Hotline riêng',
      'Flash sale trước 24h',
      'Voucher 15-20% & Hoàn xu 3-5%',
      'Tích điểm x1.30',
      'Reserved stock'
    ]
  }
}

const REWARD_PACKAGES = [
  {
    code: 'VOUCHER_20K',
    label: 'Voucher 20k',
    pts: 500,
    icon: '🎟️',
    desc: 'Giảm trực tiếp 20.000đ'
  },
  {
    code: 'VOUCHER_50K',
    label: 'Voucher 50k',
    pts: 1000,
    icon: '💰',
    desc: 'Giảm trực tiếp 50.000đ'
  },
  {
    code: 'VOUCHER_120K',
    label: 'Voucher 120k',
    pts: 2500,
    icon: '🔥',
    desc: 'Giảm trực tiếp 120.000đ'
  },
  {
    code: 'FREESHIP_VIP',
    label: 'Freeship VIP',
    pts: 5000,
    icon: '🚚',
    desc: 'Miễn phí vận chuyển (Tối đa 35k)'
  }
]

const UI_TIERS: UiTier[] = ['leaf', 'silver', 'gold', 'platinum', 'diamond']
const NEXT_TIER: Partial<Record<UiTier, UiTier>> = {
  leaf: 'silver',
  silver: 'gold',
  gold: 'platinum',
  platinum: 'diamond'
}

const formatPoints = (n: number) => n.toLocaleString('vi-VN')
const formatCurrency = (n: number) => n.toLocaleString('vi-VN') + 'đ'

export default function ZenBookMembership() {
  const { t } = useTranslation('common')
  const [member, setMember] = useState<MemberInfoResponse | null>(null)
  const [history, setHistory] = useState<PointHistoryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const fetchAll = async () => {
    try {
      const [memberData, historyData] = await Promise.all([
        getMyMembershipApi(),
        getPointHistoriesApi()
      ])
      setMember(memberData)
      setHistory(historyData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  // 👉 LƯỚI BẮT LỖI TÊN BIẾN CỦA SPRING BOOT BỌC THÉP
  const isCheckedIn = member
    ? member.checkedInToday === true || (member as any).isCheckedInToday === true
    : false
  const currentStreak = member ? member.currentStreak || 0 : 0

  const handleCheckIn = async () => {
    setIsActionLoading(true)
    try {
      const res = await checkInApi()
      toast.success(res.data || t('membership.checkInSuccess', 'Điểm danh thành công!'))

      // Optimistic Update bọc thép
      setMember((prev) => {
        if (!prev) return prev
        const oldStreak = prev.currentStreak || 0
        const newStreak = oldStreak === 0 ? 1 : oldStreak + 1
        const bonus = newStreak % 3 === 0 ? 15 : 5
        return {
          ...prev,
          checkedInToday: true,
          isCheckedInToday: true, // Ép dính luôn cả 2 tên
          currentStreak: newStreak,
          points: prev.points + bonus
        } as any
      })
      fetchAll()
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          t('membership.checkInAlready', 'Hôm nay bạn đã điểm danh rồi!')
      )
      setMember((prev) =>
        prev ? ({ ...prev, checkedInToday: true, isCheckedInToday: true } as any) : null
      )
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleExchange = async (pkg: (typeof REWARD_PACKAGES)[0]) => {
    if (member && member.points < pkg.pts) return
    if (
      !confirm(
        t(
          'membership.confirmExchange',
          `Bạn có chắc chắn muốn dùng ${pkg.pts} điểm để đổi ${pkg.label}?`
        )
      )
    )
      return
    setIsActionLoading(true)
    try {
      const res = await exchangeVoucherApi(pkg.code)
      toast.success(res.data || t('membership.exchangeSuccess', 'Đổi quà thành công!'))
      fetchAll()
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('membership.exchangeFail', 'Có lỗi xảy ra'))
    } finally {
      setIsActionLoading(false)
    }
  }

  // 👉 CẤU HÌNH LỬA: ÉP CỨNG CHỐNG HIỂN THỊ x0
  const getStreakConfig = () => {
    if (!member) return {}

    // 1. CHƯA ĐIỂM DANH (Xám trắng)
    if (!isCheckedIn) {
      return {
        bg: 'bg-slate-50 border-2 border-slate-200 text-slate-400 shadow-none',
        flame: 'text-slate-300 fill-slate-200',
        text: `x${currentStreak}`, // Bấm vào sẽ đạt được ngày này
        label: t('membership.checkInNow', 'ĐIỂM DANH NGAY'),
        labelColor: 'text-slate-400'
      }
    }

    // 2. ĐÃ ĐIỂM DANH (Phân cấp màu)
    const displayStreak = Math.max(1, currentStreak) // 👈 Chống tuyệt đối x0

    if (displayStreak <= 1)
      return {
        bg: 'bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-yellow-200',
        flame: 'text-white fill-yellow-100',
        text: `x${displayStreak}`,
        label: 'ĐÃ ĐIỂM DANH',
        labelColor: 'text-yellow-600'
      }
    if (displayStreak === 2)
      return {
        bg: 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-orange-200',
        flame: 'text-white fill-orange-100',
        text: `x${displayStreak}`,
        label: 'CHUỖI RỰC RỠ',
        labelColor: 'text-orange-600'
      }
    if (displayStreak === 3)
      return {
        bg: 'bg-gradient-to-br from-orange-500 to-red-600 shadow-red-200',
        flame: 'text-white fill-red-100 animate-pulse',
        text: `x${displayStreak}`,
        label: 'BÙNG NỔ',
        labelColor: 'text-red-600'
      }
    // TỪ NGÀY 4+ (LỬA TÍM)
    return {
      bg: 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-200',
      flame: 'text-white fill-purple-100 animate-bounce',
      text: `x${displayStreak}`,
      label: 'HUYỀN THOẠI',
      labelColor: 'text-purple-600'
    }
  }

  if (loading)
    return (
      <div className='p-10 text-center animate-pulse text-brand-green font-medium'>
        Đang tải dữ liệu...
      </div>
    )
  if (!member) return null

  const streakCfg: any = getStreakConfig()
  const uiTier = toUiTier(member.tier)
  const next = NEXT_TIER[uiTier]

  return (
    <div className='min-h-screen bg-[#F8FAFB] text-slate-900'>
      <BreadcrumbHeader />

      <div className='max-w-[1200px] mx-auto px-6 py-10'>
        {/* HEADER */}
        <div className='flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6'>
          <div>
            <h1 className='text-3xl font-serif font-bold text-slate-800'>
              {t('membership.title', 'Trung tâm thành viên')}
            </h1>
            <p className='text-slate-500 mt-1 text-sm'>
              {t('membership.subtitle', 'Tích lũy chi tiêu, thăng hạng đặc quyền')}
            </p>
          </div>

          {/* 👉 NÚT ĐIỂM DANH */}
          <div className='flex flex-col items-center md:items-end gap-2'>
            <span
              className={cn(
                'text-[11px] font-black tracking-tighter uppercase px-2 py-0.5 rounded-md bg-white shadow-sm border border-slate-100',
                streakCfg.labelColor
              )}
            >
              {streakCfg.label}
            </span>
            <button
              onClick={handleCheckIn}
              disabled={isActionLoading || isCheckedIn}
              className={cn(
                'relative h-14 w-28 rounded-2xl font-black text-xl flex items-center justify-center gap-2 transition-all duration-500 shadow-lg border-b-4 active:border-b-0 active:translate-y-1',
                streakCfg.bg,
                isCheckedIn ? 'border-black/10' : 'border-slate-300'
              )}
            >
              {isActionLoading ? (
                <Loader2 className='w-6 h-6 animate-spin text-white' />
              ) : (
                <>
                  <Flame className={cn('w-7 h-7 transition-all', streakCfg.flame)} />
                  <span className={isCheckedIn ? 'text-white' : 'text-slate-400'}>
                    {streakCfg.text}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 items-start'>
          {/* CỘT TRÁI */}
          <div className='lg:col-span-5 space-y-6 lg:sticky lg:top-10'>
            {/* THẺ MEMBER */}
            <div
              className={cn(
                'relative overflow-hidden rounded-[24px] p-8 text-white shadow-2xl transition-all duration-500 aspect-[1.58/1] flex flex-col justify-between bg-gradient-to-br',
                TIER_CONFIG[uiTier].gradient
              )}
            >
              <span className='absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white opacity-[0.08]' />
              <div className='relative z-10 flex justify-between items-start'>
                <div>
                  <h3 className='font-serif text-2xl font-bold'>ZenBook</h3>
                  <p className='text-xs opacity-80 uppercase tracking-widest'>Premium Club</p>
                </div>
                <div className='bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-2xl flex items-center gap-2'>
                  <span className='text-xl'>{TIER_CONFIG[uiTier].icon}</span>
                  <span className='text-sm font-bold uppercase'>{TIER_CONFIG[uiTier].label}</span>
                </div>
              </div>
              <div className='relative z-10'>
                <p className='text-xs opacity-70 mb-1 tracking-wider uppercase'>
                  {t('membership.cardHolder', 'Chủ thẻ')}
                </p>
                <p className='text-lg font-medium tracking-wide mb-4'>{member.name}</p>
                <div className='flex justify-between items-end'>
                  <div>
                    <p className='text-xs opacity-70 uppercase mb-1'>
                      {t('membership.accumulatedPoints', 'Điểm tích lũy')}
                    </p>
                    <div className='flex items-baseline gap-2'>
                      <span className='text-4xl font-bold'>{formatPoints(member.points)}</span>
                      <span className='text-sm opacity-80'>ZPoints</span>
                    </div>
                  </div>
                  <p className='font-mono text-xs opacity-60'>{member.memberId}</p>
                </div>
              </div>
            </div>

            {/* TIẾN ĐỘ THĂNG HẠNG */}
            <Card className='border-none shadow-md bg-white rounded-[24px] overflow-hidden'>
              <CardContent className='p-6 space-y-6'>
                <div>
                  <div className='flex justify-between items-center mb-4 text-[14px]'>
                    <h4 className='font-bold text-slate-700 uppercase tracking-wider'>
                      {t('membership.progress', 'Tiến độ lên hạng')}
                    </h4>
                    <span className='text-brand-green font-bold'>
                      {next
                        ? `${formatCurrency(member.totalSpending)} / ${formatCurrency(TIER_CONFIG[next].min)}`
                        : 'Cấp cao nhất'}
                    </span>
                  </div>
                  <Progress
                    value={
                      next
                        ? ((member.totalSpending - TIER_CONFIG[uiTier].min) /
                            (TIER_CONFIG[next].min - TIER_CONFIG[uiTier].min)) *
                          100
                        : 100
                    }
                    className='h-3.5 bg-slate-100 rounded-full [&>div]:bg-brand-green'
                  />
                </div>
              </CardContent>
            </Card>

            {/* QUY TẮC TÍNH ĐIỂM */}
            <Card className='border-none shadow-md bg-white rounded-[24px] overflow-hidden'>
              <CardHeader className='bg-slate-50/50 border-b border-slate-100 pb-4'>
                <CardTitle className='text-[15px] font-bold text-slate-800 flex items-center gap-2'>
                  <Info className='w-4 h-4 text-brand-green' /> Quy tắc ZPoints
                </CardTitle>
              </CardHeader>
              <CardContent className='p-5 space-y-4'>
                <div className='flex gap-3 text-xs'>
                  <span className='w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0'>
                    🛒
                  </span>
                  <div>
                    <p className='font-bold text-slate-700'>Mua sắm</p>
                    <p className='text-slate-500'>1.000đ = 1 ZP. Nhân theo hệ số hạng.</p>
                  </div>
                </div>
                <div className='flex gap-3 text-xs'>
                  <span className='w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0'>
                    ⭐
                  </span>
                  <div>
                    <p className='font-bold text-slate-700'>Đánh giá</p>
                    <p className='text-slate-500'>+100 ZP cho mỗi đánh giá có ảnh/video.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CỘT PHẢI */}
          <div className='lg:col-span-7 space-y-10'>
            {/* QUYỀN LỢI */}
            <section>
              <h2 className='text-lg font-bold text-slate-800 mb-5'>
                Quyền lợi các Hạng Thành Viên
              </h2>
              <div className='grid gap-4'>
                {UI_TIERS.map((t) => (
                  <div
                    key={t}
                    className={cn(
                      'p-5 rounded-[20px] border flex flex-col sm:flex-row gap-5 items-center transition-all',
                      t === uiTier
                        ? 'bg-white border-brand-green shadow-md scale-[1.02] ring-1 ring-brand-green/50'
                        : 'bg-white/60 border-slate-100 opacity-80'
                    )}
                  >
                    <div className='flex flex-col items-center min-w-[100px] border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0 sm:pr-5'>
                      <span className='text-4xl mb-1'>{TIER_CONFIG[t].icon}</span>
                      <p className={cn('text-[12px] font-black uppercase', TIER_CONFIG[t].color)}>
                        {TIER_CONFIG[t].label}
                      </p>
                    </div>
                    <div className='flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2'>
                      {TIER_CONFIG[t].perks.map((perk, idx) => (
                        <div
                          key={idx}
                          className='flex items-start gap-2 text-xs font-medium text-slate-600'
                        >
                          <CheckCircle2
                            className={cn(
                              'w-3.5 h-3.5 mt-0.5',
                              t === uiTier ? 'text-brand-green' : 'text-slate-300'
                            )}
                          />{' '}
                          {perk}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ĐỔI QUÀ */}
            <section>
              <div className='flex justify-between items-center mb-5'>
                <h2 className='text-lg font-bold text-slate-800'>Đổi điểm nhận ưu đãi</h2>
                <span className='text-sm text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm'>
                  Ví điểm:{' '}
                  <strong className='text-brand-green'>{formatPoints(member.points)} ZP</strong>
                </span>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {REWARD_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.code}
                    className={cn(
                      'bg-white p-5 rounded-[22px] border flex items-center justify-between group transition-all',
                      member.points >= pkg.pts
                        ? 'hover:border-amber-400 hover:shadow-md'
                        : 'opacity-70'
                    )}
                  >
                    <div className='flex items-center gap-4'>
                      <div className='w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl'>
                        {pkg.icon}
                      </div>
                      <div>
                        <p className='text-sm font-bold text-slate-800'>{pkg.label}</p>
                        <p className='text-xs text-amber-600 font-black'>{pkg.pts} ZP</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleExchange(pkg)}
                      disabled={member.points < pkg.pts || isActionLoading}
                      className='px-4 py-2 bg-amber-500 text-white text-[12px] font-bold rounded-xl disabled:bg-slate-100 disabled:text-slate-400'
                    >
                      ĐỔI MÃ
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* LỊCH SỬ */}
            <HistorySection items={history} />
          </div>
        </div>
      </div>
    </div>
  )
}

function HistorySection({ items }: { items: PointHistoryResponse[] }) {
  const dotColors = {
    earn: 'bg-green-500',
    redeem: 'bg-amber-500',
    refund: 'bg-red-500',
    bonus: 'bg-blue-500'
  }
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 7
  const totalPages = Math.ceil(items.length / itemsPerPage)
  const paginatedItems = useMemo(
    () => items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [items, currentPage]
  )

  return (
    <Card className='border-slate-200 shadow-sm'>
      <CardHeader className='pb-4 px-6 border-b border-slate-100'>
        <div className='flex justify-between items-center'>
          <CardTitle className='text-[16px] font-bold text-slate-800'>Lịch sử giao dịch</CardTitle>
          <span className='text-xs text-slate-400'>{items.length} giao dịch</span>
        </div>
      </CardHeader>
      <CardContent className='p-0 flex flex-col'>
        {items.length === 0 ? (
          <div className='py-12 text-center text-gray-400 text-sm italic'>
            Chưa có giao dịch nào
          </div>
        ) : (
          paginatedItems.map((h, i) => (
            <div
              key={h.id}
              className='flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors border-b last:border-0'
            >
              <div
                className={cn(
                  'w-2.5 h-2.5 rounded-full',
                  dotColors[h.type as keyof typeof dotColors] || 'bg-slate-400'
                )}
              />
              <div className='flex-1'>
                <p className='text-sm font-semibold text-gray-800'>{h.title}</p>
                <p className='text-xs text-gray-500'>{h.date}</p>
              </div>
              <span
                className={cn(
                  'text-sm font-bold',
                  h.points > 0 ? 'text-green-600' : 'text-amber-600'
                )}
              >
                {h.points > 0 ? '+' : ''}
                {formatPoints(h.points)}
              </span>
            </div>
          ))
        )}
        {totalPages > 1 && (
          <div className='p-4 border-t border-slate-100 flex items-center justify-between'>
            <span className='text-xs text-slate-500'>
              Trang {currentPage} / {totalPages}
            </span>
            <div className='flex gap-2'>
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className='p-1 border rounded disabled:opacity-30'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
                className='p-1 border rounded disabled:opacity-30'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
