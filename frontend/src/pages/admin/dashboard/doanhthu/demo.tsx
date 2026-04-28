'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

type DateRange = 'today' | '7d' | '30d' | '3m' | '1y' | 'custom'
type MetricToggle = 'revenue' | 'profit' | 'orders' | 'customers'
type SortDir = 'asc' | 'desc'

// ═══════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════

const REVENUE_TREND = Array.from({ length: 30 }, (_, i) => {
  const base = 16000000 + Math.sin(i * 0.6) * 7000000 + i * 180000 + Math.random() * 2000000
  const profit = base * (0.28 + Math.random() * 0.06)
  const adCost = base * (0.1 + Math.random() * 0.04)
  const orders = Math.round(base / 185000)
  return {
    date: `${i + 1}/4`,
    revenue: Math.round(base),
    profit: Math.round(profit),
    adCost: Math.round(adCost),
    orders,
    customers: Math.round(orders * (0.7 + Math.random() * 0.2))
  }
})

const FORECAST_DATA = [
  ...Array.from({ length: 14 }, (_, i) => ({
    date: `${i + 17}/4`,
    actual: Math.round(18000000 + Math.sin(i * 0.5) * 5500000 + i * 200000),
    forecast: null as null | number,
    lower: null as null | number,
    upper: null as null | number
  })),
  ...Array.from({ length: 7 }, (_, i) => ({
    date: `${i + 1}/5`,
    actual: null as null | number,
    forecast: Math.round(23000000 + Math.sin((i + 14) * 0.5) * 4000000 + i * 280000),
    lower: Math.round(20000000 + i * 180000),
    upper: Math.round(26000000 + i * 380000)
  }))
]

const BREAKDOWN_DATA = [
  { name: 'Sách giấy', value: 58, color: '#10b981' },
  { name: 'Ebook', value: 18, color: '#3b82f6' },
  { name: 'Premium', value: 10, color: '#8b5cf6' },
  { name: 'Combo', value: 9, color: '#f59e0b' },
  { name: 'Merchandise', value: 5, color: '#ec4899' }
]

const TOP_BOOKS = [
  {
    rank: 1,
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'IT',
    sold: 512,
    revenue: 112640000,
    growth: 18
  },
  {
    rank: 2,
    title: 'Đắc Nhân Tâm',
    author: 'Dale Carnegie',
    category: 'Kỹ năng',
    sold: 489,
    revenue: 84654000,
    growth: 24
  },
  {
    rank: 3,
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Kỹ năng',
    sold: 445,
    revenue: 88555000,
    growth: 31
  },
  {
    rank: 4,
    title: 'Nhà Giả Kim',
    author: 'Paulo Coelho',
    category: 'Văn học',
    sold: 398,
    revenue: 71044000,
    growth: 12
  },
  {
    rank: 5,
    title: 'Sapiens',
    author: 'Y. N. Harari',
    category: 'Lịch sử',
    sold: 376,
    revenue: 108688000,
    growth: -3
  },
  {
    rank: 6,
    title: 'Tư Duy Nhanh Và Chậm',
    author: 'Daniel Kahneman',
    category: 'Khoa học',
    sold: 321,
    revenue: 85707000,
    growth: 9
  },
  {
    rank: 7,
    title: 'Harry Potter T1',
    author: 'J.K. Rowling',
    category: 'Thiếu nhi',
    sold: 298,
    revenue: 49170000,
    growth: 15
  },
  {
    rank: 8,
    title: 'The Lean Startup',
    author: 'Eric Ries',
    category: 'Kinh tế',
    sold: 267,
    revenue: 74076000,
    growth: 22
  },
  {
    rank: 9,
    title: 'Zero to One',
    author: 'Peter Thiel',
    category: 'Kinh tế',
    sold: 245,
    revenue: 65905000,
    growth: 7
  },
  {
    rank: 10,
    title: 'Tuổi Trẻ Đáng Giá',
    author: 'Rosie Nguyễn',
    category: 'Kỹ năng',
    sold: 232,
    revenue: 44080000,
    growth: 19
  }
]

const TOP_AUTHORS = [
  { rank: 1, name: 'Nguyễn Nhật Ánh', sold: 1240, revenue: 248000000, rating: 4.9, books: 15 },
  { rank: 2, name: 'Robert C. Martin', sold: 890, revenue: 196000000, rating: 4.8, books: 8 },
  { rank: 3, name: 'James Clear', sold: 756, revenue: 150240000, rating: 4.7, books: 3 },
  { rank: 4, name: 'Haruki Murakami', sold: 634, revenue: 138880000, rating: 4.6, books: 12 },
  { rank: 5, name: 'Dale Carnegie', sold: 598, revenue: 103454000, rating: 4.5, books: 6 }
]

const FUNNEL_DATA = [
  { label: 'Visitors', value: 100000, pct: 100 },
  { label: 'Xem sản phẩm', value: 42000, pct: 42 },
  { label: 'Thêm giỏ hàng', value: 18000, pct: 18 },
  { label: 'Checkout', value: 8500, pct: 8.5 },
  { label: 'Đã thanh toán', value: 7200, pct: 7.2 }
]

const CUSTOMER_MONTHLY = Array.from({ length: 12 }, (_, i) => ({
  month: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'][i],
  new: Math.round(700 + Math.random() * 500),
  returning: Math.round(1100 + Math.random() * 700)
}))

const SEGMENTS = [
  { label: 'VIP', value: 8, color: '#f59e0b' },
  { label: 'Loyal', value: 22, color: '#10b981' },
  { label: 'Potential', value: 35, color: '#3b82f6' },
  { label: 'New', value: 20, color: '#8b5cf6' },
  { label: 'Lost', value: 15, color: '#ef4444' }
]

const PAYMENT_DATA = [
  {
    method: 'VNPay',
    volume: 4234,
    amount: 890000000,
    success: 97.2,
    failed: 2.8,
    color: '#1e6fe0'
  },
  { method: 'MoMo', volume: 3102, amount: 654000000, success: 96.8, failed: 3.2, color: '#ae2070' },
  { method: 'COD', volume: 2890, amount: 542000000, success: 91.4, failed: 8.6, color: '#f59e0b' },
  {
    method: 'ZaloPay',
    volume: 1456,
    amount: 310000000,
    success: 98.1,
    failed: 1.9,
    color: '#0068ff'
  },
  {
    method: 'Bank Transfer',
    volume: 860,
    amount: 288000000,
    success: 99.2,
    failed: 0.8,
    color: '#10b981'
  }
]

const COUPON_DATA = [
  { code: 'FREESHIP', orders: 2100, discount: 42000000, revenue: 520000000, roi: 1138 },
  { code: 'SUMMER20', orders: 1240, discount: 62000000, revenue: 380000000, roi: 512 },
  { code: 'FAHASA10', orders: 890, discount: 31000000, revenue: 198000000, roi: 539 },
  { code: 'BOOK30', orders: 456, discount: 48000000, revenue: 142000000, roi: 196 },
  { code: 'NEWUSER', orders: 320, discount: 16000000, revenue: 89000000, roi: 456 }
]

const REFUND_REASONS = [
  { reason: 'Đổi ý', count: 124, pct: 38, color: '#f59e0b' },
  { reason: 'Lỗi giao hàng', count: 89, pct: 27, color: '#ef4444' },
  { reason: 'Sách lỗi/hỏng', count: 62, pct: 19, color: '#ec4899' },
  { reason: 'Chậm giao', count: 42, pct: 13, color: '#8b5cf6' },
  { reason: 'Khác', count: 10, pct: 3, color: '#6b7280' }
]

const REFUND_TREND = Array.from({ length: 12 }, (_, i) => ({
  month: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'][i],
  refunds: Math.round(20 + Math.random() * 30),
  cancels: Math.round(35 + Math.random() * 50)
}))

const GEO_DATA = [
  { province: 'TP.HCM', revenue: 820000000, orders: 4210, growth: 22, intensity: 100 },
  { province: 'Hà Nội', revenue: 640000000, orders: 3280, growth: 18, intensity: 78 },
  { province: 'Đà Nẵng', revenue: 180000000, orders: 920, growth: 31, intensity: 42 },
  { province: 'Hải Phòng', revenue: 120000000, orders: 615, growth: 14, intensity: 28 },
  { province: 'Cần Thơ', revenue: 98000000, orders: 502, growth: 26, intensity: 22 },
  { province: 'Bình Dương', revenue: 87000000, orders: 446, growth: 19, intensity: 19 },
  { province: 'Đồng Nai', revenue: 72000000, orders: 369, growth: 8, intensity: 15 },
  { province: 'An Giang', revenue: 45000000, orders: 231, growth: -2, intensity: 8 }
]

const TABLE_DATA = Array.from({ length: 50 }, (_, i) => {
  const d = new Date(2025, 3, 1 + (i % 30))
  const revenue = Math.round(14000000 + Math.random() * 16000000)
  const orders = Math.round(70 + Math.random() * 130)
  return {
    id: i + 1,
    date: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/2025`,
    orders,
    revenue,
    profit: Math.round(revenue * (0.27 + Math.random() * 0.09)),
    refund: Math.round(revenue * (0.01 + Math.random() * 0.02)),
    aov: Math.round(revenue / orders)
  }
})

const KPI_DATA = [
  {
    id: 'gross',
    label: 'Gross Revenue',
    display: '2.4 tỷ',
    raw: 2400000000,
    change: 18.2,
    up: true,
    good: true,
    icon: '💰',
    desc: 'Tổng doanh thu'
  },
  {
    id: 'net',
    label: 'Net Revenue',
    display: '2.1 tỷ',
    raw: 2100000000,
    change: 12.0,
    up: true,
    good: true,
    icon: '📊',
    desc: 'Sau refund & coupon'
  },
  {
    id: 'orders',
    label: 'Total Orders',
    display: '12,542',
    raw: 12542,
    change: 9.2,
    up: true,
    good: true,
    icon: '📦',
    desc: 'Đơn hàng thành công'
  },
  {
    id: 'aov',
    label: 'Avg Order Value',
    display: '185k',
    raw: 185000,
    change: 5.0,
    up: true,
    good: true,
    icon: '🛒',
    desc: 'Giá trị đơn TB'
  },
  {
    id: 'profit',
    label: 'Profit',
    display: '760 tr',
    raw: 760000000,
    change: 22.0,
    up: true,
    good: true,
    icon: '💎',
    desc: 'Lợi nhuận ròng'
  },
  {
    id: 'refund',
    label: 'Refund Rate',
    display: '1.8%',
    raw: 1.8,
    change: 0.4,
    up: false,
    good: true,
    icon: '↩️',
    desc: 'Tỉ lệ hoàn trả'
  },
  {
    id: 'conversion',
    label: 'Conversion Rate',
    display: '4.8%',
    raw: 4.8,
    change: 1.1,
    up: true,
    good: true,
    icon: '🎯',
    desc: 'Visitor → Paid'
  },
  {
    id: 'clv',
    label: 'Customer LTV',
    display: '2.7 tr',
    raw: 2700000,
    change: 8.0,
    up: true,
    good: true,
    icon: '👑',
    desc: 'Lifetime Value'
  }
]

const INSIGHTS = [
  {
    type: 'success' as const,
    emoji: '📈',
    text: 'Category IT tăng 32% so với tháng trước — cơ hội mở rộng danh mục.',
    badge: '+32% MoM'
  },
  {
    type: 'info' as const,
    emoji: '💳',
    text: 'Người mua qua VNPay chi tiêu cao hơn 18% trung bình so với phương thức khác.',
    badge: 'AOV +18%'
  },
  {
    type: 'success' as const,
    emoji: '🎟️',
    text: 'Coupon FREESHIP có tỉ lệ conversion tốt nhất: 2,100 đơn với ROI đạt 11x.',
    badge: 'ROI 1138%'
  },
  {
    type: 'warning' as const,
    emoji: '⚠️',
    text: 'Tỉ lệ bỏ checkout tăng 5% trong 7 ngày qua — kiểm tra UX luồng thanh toán.',
    badge: '↑5% abandon'
  },
  {
    type: 'info' as const,
    emoji: '📍',
    text: 'Đà Nẵng tăng trưởng nhanh nhất: +31% doanh thu, cân nhắc tăng tồn kho miền Trung.',
    badge: '+31% Đà Nẵng'
  }
]

// ═══════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════

function fmtCurrency(n: number, compact = false): string {
  if (compact) {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`
    if (n >= 1_000_000) return `${Math.round(n / 1_000_000)} tr`
    if (n >= 1_000) return `${Math.round(n / 1_000)}k`
    return n.toLocaleString('vi-VN')
  }
  return n.toLocaleString('vi-VN') + 'đ'
}

function fmtNum(n: number): string {
  return n.toLocaleString('vi-VN')
}

function useAnimatedNumber(target: number, active = true) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let current = 0
    const step = target / 60
    const id = setInterval(() => {
      current += step
      if (current >= target) {
        setVal(target)
        clearInterval(id)
      } else setVal(Math.round(current))
    }, 16)
    return () => clearInterval(id)
  }, [target, active])
  return val
}

function Stars({ n }: { n: number }) {
  return (
    <span className='text-xs text-amber-400'>
      {'★'.repeat(Math.floor(n))}
      {'☆'.repeat(5 - Math.floor(n))}
    </span>
  )
}

function Badge({
  children,
  variant = 'default'
}: {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger'
}) {
  const cls = {
    default: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    danger: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  }[variant]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}
    >
      {children}
    </span>
  )
}

// ═══════════════════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════════════════

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 ${className}`}
    />
  )
}

// ═══════════════════════════════════════════════════
// CUSTOM RECHARTS TOOLTIP
// ═══════════════════════════════════════════════════

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className='rounded-xl border border-emerald-100 bg-white/95 px-3 py-2.5 shadow-xl backdrop-blur-sm dark:border-emerald-800/50 dark:bg-gray-900/95'>
      <p className='mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400'>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className='flex items-center gap-2 py-0.5 text-xs'>
          <span className='h-2 w-2 shrink-0 rounded-full' style={{ background: p.color }} />
          <span className='text-gray-500 dark:text-gray-400'>{p.name}:</span>
          <span className='font-bold text-gray-900 dark:text-white'>
            {p.value > 100000 ? fmtCurrency(p.value, true) : fmtNum(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════
// SECTION WRAPPER
// ═══════════════════════════════════════════════════

function Section({
  title,
  subtitle,
  children,
  action,
  className = ''
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-white/70 bg-white/80 shadow-sm backdrop-blur-md dark:border-gray-700/60 dark:bg-gray-800/80 ${className}`}
    >
      <div className='flex flex-wrap items-start justify-between gap-3 border-b border-gray-100/80 px-5 py-4 dark:border-gray-700/40'>
        <div>
          <h2 className='text-sm font-bold text-gray-900 dark:text-white'>{title}</h2>
          {subtitle && <p className='mt-0.5 text-[11px] text-gray-400'>{subtitle}</p>}
        </div>
        {action && <div className='flex items-center gap-2'>{action}</div>}
      </div>
      <div className='p-5'>{children}</div>
    </div>
  )
}

// ═══════════════════════════════════════════════════
// 1. HEADER
// ═══════════════════════════════════════════════════

function Header({ darkMode, onDarkMode }: { darkMode: boolean; onDarkMode: () => void }) {
  const [range, setRange] = useState<DateRange>('30d')
  const [exportOpen, setExportOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [spinning, setSpinning] = useState(false)

  const handleRefresh = () => {
    setSpinning(true)
    setTimeout(() => setSpinning(false), 1200)
  }

  const RANGES: { key: DateRange; label: string }[] = [
    { key: 'today', label: 'Hôm nay' },
    { key: '7d', label: '7 ngày' },
    { key: '30d', label: '30 ngày' },
    { key: '3m', label: '3 tháng' },
    { key: '1y', label: '1 năm' },
    { key: 'custom', label: 'Tùy chỉnh' }
  ]

  const FILTERS = ['Category', 'Author', 'Publisher', 'Coupon', 'Payment Method', 'Order Source']

  return (
    <div className='mb-6 flex flex-col gap-4'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-black tracking-tight text-gray-900 dark:text-white'>
            Revenue Report
          </h1>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            Theo dõi doanh thu, lợi nhuận và hiệu suất kinh doanh theo thời gian.
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          {/* Dark Mode */}
          <button
            onClick={onDarkMode}
            className='flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white/80 text-base backdrop-blur-sm transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700'
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className='flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm transition hover:bg-emerald-50 dark:border-gray-600 dark:bg-gray-800'
          >
            <svg
              className={`h-4 w-4 text-emerald-600 transition-transform ${spinning ? 'animate-spin' : ''}`}
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
              />
            </svg>
          </button>

          {/* Filter */}
          <div className='relative'>
            <button
              onClick={() => {
                setFilterOpen(!filterOpen)
                setExportOpen(false)
              }}
              className='flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 bg-white/80 px-3 text-xs font-semibold text-gray-700 backdrop-blur-sm transition hover:border-emerald-300 hover:text-emerald-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
            >
              <svg
                className='h-3.5 w-3.5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
                />
              </svg>
              Lọc
              <svg
                className='h-3 w-3'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2.5}
              >
                <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
              </svg>
            </button>
            {filterOpen && (
              <div className='absolute right-0 top-11 z-50 w-48 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-800'>
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    className='flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-700 dark:text-gray-300 dark:hover:bg-emerald-900/20'
                  >
                    <span className='h-1.5 w-1.5 rounded-full bg-emerald-400' />
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export */}
          <div className='relative'>
            <button
              onClick={() => {
                setExportOpen(!exportOpen)
                setFilterOpen(false)
              }}
              className='flex h-9 items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-600 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95'
            >
              <svg
                className='h-3.5 w-3.5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                />
              </svg>
              Export
              <svg
                className='h-3 w-3'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2.5}
              >
                <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
              </svg>
            </button>
            {exportOpen && (
              <div className='absolute right-0 top-11 z-50 w-36 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-800'>
                {[
                  { label: 'PDF', icon: '📄' },
                  { label: 'Excel', icon: '📊' },
                  { label: 'CSV', icon: '📋' }
                ].map((e) => (
                  <button
                    key={e.label}
                    className='flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-700 dark:text-gray-300 dark:hover:bg-emerald-900/20'
                  >
                    <span>{e.icon}</span> {e.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date Range Pills */}
      <div className='flex flex-wrap gap-1.5'>
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              range === r.key
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                : 'bg-white/80 text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════
// 2. KPI CARDS
// ═══════════════════════════════════════════════════

function KPICards({ loading }: { loading: boolean }) {
  if (loading) {
    return (
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8'>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className='h-28' />
        ))}
      </div>
    )
  }
  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8'>
      {KPI_DATA.map((kpi) => {
        const isGood = kpi.good
        const colorClass = isGood
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
        return (
          <div
            key={kpi.id}
            className='group relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 px-4 py-3.5 shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700/60 dark:bg-gray-800/80'
          >
            <div className='absolute right-2 top-2 text-xl opacity-60'>{kpi.icon}</div>
            <p className='text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500'>
              {kpi.label}
            </p>
            <p className='mt-1.5 text-xl font-black tabular-nums text-gray-900 dark:text-white'>
              {kpi.display}
            </p>
            <p className='mt-0.5 text-[9px] text-gray-400'>{kpi.desc}</p>
            <div className='mt-2 flex items-center gap-1'>
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-black ${colorClass}`}
              >
                {kpi.up ? '↑' : '↓'} {kpi.change}%
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════
// 3. REVENUE TREND CHART
// ═══════════════════════════════════════════════════

function RevenueTrend({ loading }: { loading: boolean }) {
  const [metric, setMetric] = useState<MetricToggle>('revenue')
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day')

  const METRICS = [
    { key: 'revenue' as MetricToggle, label: 'Revenue', color: '#10b981' },
    { key: 'profit' as MetricToggle, label: 'Profit', color: '#3b82f6' },
    { key: 'orders' as MetricToggle, label: 'Orders', color: '#f59e0b' },
    { key: 'customers' as MetricToggle, label: 'Customers', color: '#8b5cf6' }
  ]

  const activeMetric = METRICS.find((m) => m.key === metric)!

  if (loading) return <Skeleton className='h-80' />

  return (
    <Section
      title='Revenue Trend'
      subtitle='Biến động doanh thu, lợi nhuận theo thời gian'
      action={
        <div className='flex items-center gap-2'>
          <div className='flex rounded-xl border border-gray-200 p-0.5 text-xs dark:border-gray-600'>
            {(['day', 'week', 'month'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${granularity === g ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'}`}
              >
                {g === 'day' ? 'Ngày' : g === 'week' ? 'Tuần' : 'Tháng'}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {/* Metric toggles */}
      <div className='mb-4 flex flex-wrap gap-2'>
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${metric === m.key ? 'text-white shadow-sm' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
            style={metric === m.key ? { background: m.color } : {}}
          >
            <span className='h-2 w-2 rounded-full' style={{ background: m.color }} />
            {m.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width='100%' height={280}>
        <AreaChart data={REVENUE_TREND} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id='gRevenue' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor={activeMetric.color} stopOpacity={0.25} />
              <stop offset='95%' stopColor={activeMetric.color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke='#f0fdf4' strokeOpacity={0.6} />
          <XAxis
            dataKey='date'
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={60}
            tickFormatter={(v) =>
              metric === 'revenue' || metric === 'profit' ? fmtCurrency(v, true) : fmtNum(v)
            }
          />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type='monotone'
            dataKey={metric}
            name={activeMetric.label}
            stroke={activeMetric.color}
            strokeWidth={2.5}
            fill='url(#gRevenue)'
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Section>
  )
}

// ═══════════════════════════════════════════════════
// 4. REVENUE BREAKDOWN
// ═══════════════════════════════════════════════════

function RevenueBreakdown({ loading }: { loading: boolean }) {
  const [hover, setHover] = useState<number | null>(null)
  if (loading) return <Skeleton className='h-80' />

  return (
    <Section title='Revenue Breakdown' subtitle='Phân bổ doanh thu theo loại sản phẩm'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
        <div className='shrink-0'>
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={BREAKDOWN_DATA}
                cx='50%'
                cy='50%'
                innerRadius={58}
                outerRadius={88}
                paddingAngle={3}
                dataKey='value'
                onMouseEnter={(_, idx) => setHover(idx)}
                onMouseLeave={() => setHover(null)}
              >
                {BREAKDOWN_DATA.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.color}
                    opacity={hover === null || hover === i ? 1 : 0.4}
                    stroke='none'
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => [`${v}%`, '']}
                contentStyle={{
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className='flex flex-col gap-2.5 flex-1'>
          {BREAKDOWN_DATA.map((d, i) => (
            <div
              key={i}
              className='flex items-center gap-3 cursor-default'
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <span className='h-3 w-3 shrink-0 rounded-full' style={{ background: d.color }} />
              <span className='flex-1 text-xs font-medium text-gray-600 dark:text-gray-400'>
                {d.name}
              </span>
              <div className='flex w-28 items-center gap-2'>
                <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700'>
                  <div
                    className='h-full rounded-full transition-all'
                    style={{ width: `${d.value}%`, background: d.color }}
                  />
                </div>
                <span className='w-8 text-right text-xs font-bold text-gray-800 dark:text-gray-200'>
                  {d.value}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════
// 5. TOP BOOKS TABLE
// ═══════════════════════════════════════════════════

function TopBooks({ loading }: { loading: boolean }) {
  const [limit, setLimit] = useState(10)
  if (loading) return <Skeleton className='h-96' />

  return (
    <Section
      title='Top Selling Books'
      subtitle='Sách bán chạy nhất trong kỳ'
      action={
        <div className='flex items-center gap-1.5'>
          <button
            onClick={() => setLimit(10)}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${limit === 10 ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-emerald-600 dark:text-gray-400'}`}
          >
            Top 10
          </button>
          <button
            onClick={() => setLimit(50)}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${limit === 50 ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-emerald-600 dark:text-gray-400'}`}
          >
            Top 50
          </button>
          <button className='flex items-center gap-1 rounded-lg border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400'>
            Export ↓
          </button>
        </div>
      }
    >
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-gray-100 dark:border-gray-700'>
              {['#', 'Sách', 'Danh mục', 'Đã bán', 'Doanh thu', 'Tăng trưởng'].map((h) => (
                <th
                  key={h}
                  className='pb-2.5 pr-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400'
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TOP_BOOKS.slice(0, limit).map((b) => (
              <tr
                key={b.rank}
                className='group border-b border-gray-50 transition hover:bg-emerald-50/50 dark:border-gray-700/50 dark:hover:bg-emerald-900/10'
              >
                <td className='py-2.5 pr-4'>
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${b.rank === 1 ? 'bg-amber-400 text-amber-900' : b.rank === 2 ? 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300' : b.rank === 3 ? 'bg-orange-300 text-orange-900' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
                  >
                    {b.rank}
                  </span>
                </td>
                <td className='py-2.5 pr-4'>
                  <p className='text-xs font-bold text-gray-900 dark:text-white'>{b.title}</p>
                  <p className='text-[10px] text-gray-400'>{b.author}</p>
                </td>
                <td className='py-2.5 pr-4'>
                  <Badge variant='info'>{b.category}</Badge>
                </td>
                <td className='py-2.5 pr-4 text-xs font-bold text-gray-800 dark:text-gray-200'>
                  {fmtNum(b.sold)}
                </td>
                <td className='py-2.5 pr-4 text-xs font-bold text-emerald-700 dark:text-emerald-400'>
                  {fmtCurrency(b.revenue, true)}
                </td>
                <td className='py-2.5'>
                  <span
                    className={`text-xs font-black ${b.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}
                  >
                    {b.growth >= 0 ? '↑' : '↓'} {Math.abs(b.growth)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════
// 6. TOP AUTHORS
// ═══════════════════════════════════════════════════

function TopAuthors({ loading }: { loading: boolean }) {
  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
  if (loading) return <Skeleton className='h-64' />

  return (
    <Section title='Top Authors' subtitle='Tác giả bán chạy nhất'>
      <div className='flex flex-col gap-2.5'>
        {TOP_AUTHORS.map((a, i) => (
          <div
            key={a.rank}
            className='flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 transition hover:border-emerald-200 hover:bg-emerald-50/50 dark:border-gray-700/50 dark:bg-gray-700/30'
          >
            <span className='text-xl'>{medals[i]}</span>
            <div className='flex-1 min-w-0'>
              <p className='truncate text-xs font-bold text-gray-900 dark:text-white'>{a.name}</p>
              <p className='text-[10px] text-gray-400'>{a.books} đầu sách</p>
            </div>
            <div className='text-right'>
              <p className='text-xs font-black text-emerald-600 dark:text-emerald-400'>
                {fmtCurrency(a.revenue, true)}
              </p>
              <p className='text-[10px] text-gray-400'>{fmtNum(a.sold)} cuốn</p>
            </div>
            <div className='text-right'>
              <Stars n={a.rating} />
              <p className='text-[10px] font-bold text-amber-600'>{a.rating}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════
// 7. SALES FUNNEL
// ═══════════════════════════════════════════════════

function SalesFunnel({ loading }: { loading: boolean }) {
  if (loading) return <Skeleton className='h-64' />
  const max = FUNNEL_DATA[0].value

  return (
    <Section title='Sales Funnel' subtitle='Tỉ lệ chuyển đổi từng bước'>
      <div className='flex flex-col gap-1.5'>
        {FUNNEL_DATA.map((f, i) => {
          const prevValue = i > 0 ? FUNNEL_DATA[i - 1].value : f.value
          const dropRate = i > 0 ? (((prevValue - f.value) / prevValue) * 100).toFixed(1) : null
          const width = (f.value / max) * 100
          return (
            <div key={f.label}>
              {dropRate && (
                <div className='flex items-center gap-2 py-0.5'>
                  <div className='flex-1' style={{ marginLeft: `${(100 - width) / 2}%` }}>
                    <div className='flex items-center gap-1 text-[10px] text-red-400'>
                      <span>↓</span>
                      <span className='font-bold'>-{dropRate}% drop</span>
                    </div>
                  </div>
                </div>
              )}
              <div
                className='relative flex items-center justify-center rounded-xl py-3 text-white transition-all'
                style={{
                  width: `${width}%`,
                  margin: '0 auto',
                  background: `rgba(16,185,129,${0.9 - i * 0.14})`,
                  minWidth: 140
                }}
              >
                <div className='text-center'>
                  <p className='text-xs font-black'>{f.label}</p>
                  <p className='text-[11px] font-bold opacity-90'>{fmtNum(f.value)}</p>
                </div>
                <span className='absolute right-3 text-[10px] font-bold opacity-80'>{f.pct}%</span>
              </div>
            </div>
          )
        })}
      </div>
      <div className='mt-3 rounded-xl bg-emerald-50 px-4 py-2.5 dark:bg-emerald-900/20'>
        <p className='text-xs text-gray-600 dark:text-gray-400'>
          <span className='font-bold text-emerald-700 dark:text-emerald-400'>Bottleneck:</span> Bước
          Add to Cart → Checkout có tỉ lệ rớt cao nhất (52.8%). Tối ưu luồng checkout để tăng
          conversion.
        </p>
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════
// 8. CUSTOMER ANALYTICS
// ═══════════════════════════════════════════════════

function CustomerAnalytics({ loading }: { loading: boolean }) {
  if (loading) return <Skeleton className='h-80' />

  return (
    <Section title='Customer Analytics' subtitle='Khách mới vs khách quay lại & phân khúc RFM'>
      <div className='grid grid-cols-1 gap-5 lg:grid-cols-2'>
        {/* Bar chart */}
        <div>
          <p className='mb-2 text-xs font-bold text-gray-500'>New vs Returning</p>
          <ResponsiveContainer width='100%' height={200}>
            <BarChart data={CUSTOMER_MONTHLY} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0fdf4' />
              <XAxis
                dataKey='month'
                tick={{ fontSize: 9, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey='new'
                name='Khách mới'
                fill='#10b981'
                radius={[3, 3, 0, 0]}
                maxBarSize={14}
              />
              <Bar
                dataKey='returning'
                name='Quay lại'
                fill='#3b82f6'
                radius={[3, 3, 0, 0]}
                maxBarSize={14}
              />
              <Legend iconType='circle' iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Segments */}
        <div>
          <p className='mb-2 text-xs font-bold text-gray-500'>RFM Segments</p>
          <div className='space-y-2'>
            {SEGMENTS.map((s) => (
              <div key={s.label} className='flex items-center gap-3'>
                <span className='w-16 text-xs font-bold text-gray-600 dark:text-gray-400'>
                  {s.label}
                </span>
                <div
                  className='flex-1 overflow-hidden rounded-full'
                  style={{ background: `${s.color}20` }}
                >
                  <div
                    className='h-5 rounded-full transition-all duration-700'
                    style={{ width: `${s.value}%`, background: s.color }}
                  />
                </div>
                <span className='w-8 text-right text-xs font-black text-gray-800 dark:text-gray-200'>
                  {s.value}%
                </span>
              </div>
            ))}
          </div>
          <div className='mt-3 grid grid-cols-2 gap-2'>
            {[
              { label: 'Recency', value: '12 ngày', icon: '🕐' },
              { label: 'Frequency', value: '3.2 lần', icon: '🔁' },
              { label: 'Monetary', value: '2.7 tr', icon: '💰' },
              { label: 'Churn Risk', value: '15%', icon: '⚠️' }
            ].map((m) => (
              <div key={m.label} className='rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-700/30'>
                <p className='text-[10px] text-gray-400'>
                  {m.icon} {m.label}
                </p>
                <p className='text-sm font-black text-gray-800 dark:text-white'>{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════
// 9. PAYMENT ANALYTICS
// ═══════════════════════════════════════════════════

function PaymentAnalytics({ loading }: { loading: boolean }) {
  if (loading) return <Skeleton className='h-64' />
  const maxAmount = Math.max(...PAYMENT_DATA.map((p) => p.amount))

  return (
    <Section title='Payment Analytics' subtitle='Phân tích theo phương thức thanh toán'>
      <div className='flex flex-col gap-3'>
        {PAYMENT_DATA.map((p) => (
          <div key={p.method} className='flex items-center gap-3'>
            <div className='w-24 shrink-0'>
              <p className='text-xs font-bold text-gray-700 dark:text-gray-300'>{p.method}</p>
              <p className='text-[10px] text-gray-400'>{fmtNum(p.volume)} đơn</p>
            </div>
            <div className='flex-1'>
              {/* Amount bar */}
              <div className='h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700'>
                <div
                  className='h-full rounded-full transition-all duration-700'
                  style={{ width: `${(p.amount / maxAmount) * 100}%`, background: p.color }}
                />
              </div>
              {/* Success/fail split */}
              <div className='mt-1 flex h-1.5 overflow-hidden rounded-full'>
                <div className='rounded-l-full bg-emerald-400' style={{ width: `${p.success}%` }} />
                <div className='rounded-r-full bg-red-300' style={{ width: `${p.failed}%` }} />
              </div>
            </div>
            <div className='w-20 shrink-0 text-right'>
              <p className='text-xs font-black text-gray-800 dark:text-gray-200'>
                {fmtCurrency(p.amount, true)}
              </p>
              <p className='text-[9px] text-gray-400'>
                <span className='text-emerald-600 font-semibold'>{p.success}%</span> /{' '}
                <span className='text-red-400 font-semibold'>{p.failed}%</span>
              </p>
            </div>
          </div>
        ))}
        <div className='mt-1 flex items-center gap-4 text-[10px] text-gray-400'>
          <span className='flex items-center gap-1'>
            <span className='h-2 w-2 rounded-full bg-emerald-400' /> Success rate
          </span>
          <span className='flex items-center gap-1'>
            <span className='h-2 w-2 rounded-full bg-red-300' /> Failed rate
          </span>
        </div>
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════
// 10. COUPON IMPACT
// ═══════════════════════════════════════════════════

function CouponImpact({ loading }: { loading: boolean }) {
  if (loading) return <Skeleton className='h-64' />

  return (
    <Section title='Coupon / Promotion Impact' subtitle='Hiệu quả chiến dịch khuyến mãi'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-gray-100 dark:border-gray-700'>
              {['Mã coupon', 'Đơn hàng', 'Chiết khấu', 'Doanh thu', 'ROI'].map((h) => (
                <th
                  key={h}
                  className='pb-2.5 pr-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400'
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COUPON_DATA.map((c) => (
              <tr
                key={c.code}
                className='border-b border-gray-50 hover:bg-emerald-50/30 dark:border-gray-700/50 dark:hover:bg-emerald-900/10'
              >
                <td className='py-2.5 pr-4'>
                  <span className='rounded-lg bg-emerald-100 px-2.5 py-0.5 text-xs font-black tracking-wide text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400'>
                    {c.code}
                  </span>
                </td>
                <td className='py-2.5 pr-4 text-xs font-bold text-gray-800 dark:text-gray-200'>
                  {fmtNum(c.orders)}
                </td>
                <td className='py-2.5 pr-4 text-xs text-red-500 font-semibold'>
                  -{fmtCurrency(c.discount, true)}
                </td>
                <td className='py-2.5 pr-4 text-xs font-bold text-emerald-600 dark:text-emerald-400'>
                  {fmtCurrency(c.revenue, true)}
                </td>
                <td className='py-2.5'>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-black ${c.roi >= 500 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : c.roi >= 200 ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}
                  >
                    {c.roi}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════
// 11. REFUND ANALYTICS
// ═══════════════════════════════════════════════════

function RefundAnalytics({ loading }: { loading: boolean }) {
  if (loading) return <Skeleton className='h-72' />

  return (
    <Section title='Refund & Cancel Analytics' subtitle='Xu hướng hoàn trả và lý do hủy đơn'>
      <div className='grid gap-5 lg:grid-cols-2'>
        {/* Reasons */}
        <div>
          <p className='mb-3 text-xs font-bold text-gray-500'>Lý do hoàn trả</p>
          <div className='space-y-2'>
            {REFUND_REASONS.map((r) => (
              <div key={r.reason} className='flex items-center gap-3'>
                <span className='w-28 text-xs text-gray-600 dark:text-gray-400'>{r.reason}</span>
                <div className='flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700'>
                  <div
                    className='h-4 rounded-full text-right text-[9px] font-bold leading-4 pr-1.5 text-white transition-all duration-700'
                    style={{ width: `${r.pct}%`, background: r.color, minWidth: 30 }}
                  >
                    {r.pct}%
                  </div>
                </div>
                <span className='w-8 text-right text-xs text-gray-400'>{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trend */}
        <div>
          <p className='mb-3 text-xs font-bold text-gray-500'>Xu hướng theo tháng</p>
          <ResponsiveContainer width='100%' height={160}>
            <BarChart data={REFUND_TREND} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0fdf4' />
              <XAxis
                dataKey='month'
                tick={{ fontSize: 9, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey='refunds'
                name='Hoàn trả'
                fill='#ef4444'
                radius={[3, 3, 0, 0]}
                maxBarSize={12}
              />
              <Bar
                dataKey='cancels'
                name='Hủy đơn'
                fill='#f59e0b'
                radius={[3, 3, 0, 0]}
                maxBarSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════
// 12. GEOGRAPHIC SALES
// ═══════════════════════════════════════════════════

function GeoSales({ loading }: { loading: boolean }) {
  if (loading) return <Skeleton className='h-64' />
  const maxRevenue = Math.max(...GEO_DATA.map((g) => g.revenue))

  return (
    <Section title='Geographic Sales' subtitle='Doanh thu theo tỉnh thành'>
      <div className='grid grid-cols-2 gap-2.5 sm:grid-cols-4'>
        {GEO_DATA.map((g) => {
          const intensity = g.intensity / 100
          return (
            <div
              key={g.province}
              className='group relative overflow-hidden rounded-2xl p-3.5 transition-all hover:scale-[1.02]'
              style={{ background: `rgba(16,185,129,${0.08 + intensity * 0.22})` }}
            >
              <div
                className='absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100'
                style={{ background: `rgba(16,185,129,${0.05})` }}
              />
              <div className='flex items-start justify-between'>
                <p className='text-xs font-black text-gray-800 dark:text-white'>{g.province}</p>
                <span
                  className={`text-[9px] font-black ${g.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}
                >
                  {g.growth >= 0 ? '↑' : '↓'}
                  {Math.abs(g.growth)}%
                </span>
              </div>
              <p className='mt-1 text-sm font-black text-emerald-700 dark:text-emerald-400'>
                {fmtCurrency(g.revenue, true)}
              </p>
              <p className='text-[10px] text-gray-500'>{fmtNum(g.orders)} đơn</p>
              <div className='mt-2 h-1 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900/20'>
                <div
                  className='h-full rounded-full bg-emerald-500'
                  style={{ width: `${(g.revenue / maxRevenue) * 100}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════
// 13. AI FORECAST
// ═══════════════════════════════════════════════════

function AIForecast({ loading }: { loading: boolean }) {
  if (loading) return <Skeleton className='h-72' />

  return (
    <Section
      title='AI Revenue Forecast'
      subtitle='Dự báo doanh thu 7 ngày tiếp theo'
      action={
        <div className='flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 dark:bg-emerald-900/20'>
          <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500' />
          <span className='text-[10px] font-bold text-emerald-700 dark:text-emerald-400'>
            Confidence 87%
          </span>
        </div>
      }
    >
      <div className='mb-4 grid grid-cols-3 gap-3'>
        {[
          { label: 'Dự báo 7 ngày', value: '420 tr', icon: '📈' },
          { label: 'Độ tin cậy', value: '87%', icon: '🎯' },
          { label: 'Khoảng tin cậy', value: '±15%', icon: '📊' }
        ].map((m) => (
          <div key={m.label} className='rounded-xl bg-emerald-50/80 p-3 dark:bg-emerald-900/20'>
            <p className='text-[10px] text-gray-500'>
              {m.icon} {m.label}
            </p>
            <p className='text-lg font-black text-emerald-700 dark:text-emerald-400'>{m.value}</p>
          </div>
        ))}
      </div>

      <ResponsiveContainer width='100%' height={200}>
        <AreaChart data={FORECAST_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id='gActual' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#10b981' stopOpacity={0.2} />
              <stop offset='95%' stopColor='#10b981' stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id='gForecast' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#8b5cf6' stopOpacity={0.2} />
              <stop offset='95%' stopColor='#8b5cf6' stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke='#f0fdf4' strokeOpacity={0.6} />
          <XAxis
            dataKey='date'
            tick={{ fontSize: 9, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={55}
            tickFormatter={(v) => fmtCurrency(v, true)}
          />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type='monotone'
            dataKey='actual'
            name='Thực tế'
            stroke='#10b981'
            strokeWidth={2}
            fill='url(#gActual)'
            connectNulls={false}
            dot={false}
          />
          <Area
            type='monotone'
            dataKey='forecast'
            name='Dự báo'
            stroke='#8b5cf6'
            strokeWidth={2}
            strokeDasharray='5 3'
            fill='url(#gForecast)'
            connectNulls={false}
            dot={false}
          />
          <Area
            type='monotone'
            dataKey='upper'
            name='Upper'
            stroke='#8b5cf620'
            strokeWidth={0}
            fill='#8b5cf610'
            connectNulls={false}
            dot={false}
          />
          <Area
            type='monotone'
            dataKey='lower'
            name='Lower'
            stroke='#8b5cf620'
            strokeWidth={0}
            fill='#ffffff'
            connectNulls={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Section>
  )
}

// ═══════════════════════════════════════════════════
// 14. AI INSIGHTS PANEL
// ═══════════════════════════════════════════════════

function InsightsPanel({ loading }: { loading: boolean }) {
  if (loading) return <Skeleton className='h-64' />

  const typeStyles = {
    success:
      'border-emerald-200 bg-emerald-50/80 dark:border-emerald-800/50 dark:bg-emerald-900/20',
    warning: 'border-amber-200 bg-amber-50/80 dark:border-amber-800/50 dark:bg-amber-900/20',
    info: 'border-blue-200 bg-blue-50/80 dark:border-blue-800/50 dark:bg-blue-900/20'
  }
  const badgeStyles = {
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400'
  }

  return (
    <Section
      title='AI Insights'
      subtitle='Phân tích thông minh từ dữ liệu kinh doanh'
      action={
        <span className='flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-[10px] font-black text-white shadow-sm'>
          ✨ Powered by AI
        </span>
      }
    >
      <div className='flex flex-col gap-2.5'>
        {INSIGHTS.map((ins, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 rounded-xl border p-3.5 transition hover:scale-[1.01] ${typeStyles[ins.type]}`}
          >
            <span className='mt-0.5 text-lg leading-none'>{ins.emoji}</span>
            <p className='flex-1 text-xs leading-relaxed text-gray-700 dark:text-gray-300'>
              {ins.text}
            </p>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${badgeStyles[ins.type]}`}
            >
              {ins.badge}
            </span>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════
// 15. DATA TABLE
// ═══════════════════════════════════════════════════

type TableCol = 'date' | 'orders' | 'revenue' | 'profit' | 'refund' | 'aov'

function DataTable({ loading }: { loading: boolean }) {
  const [search, setSearch] = useState('')
  const [sortCol, setSortCol] = useState<TableCol>('date')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const filtered = useMemo(() => {
    let rows = [...TABLE_DATA]
    if (search) rows = rows.filter((r) => r.date.includes(search))
    rows.sort((a, b) => {
      const va = a[sortCol] as number | string
      const vb = b[sortCol] as number | string
      if (typeof va === 'string' && typeof vb === 'string')
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number)
    })
    return rows
  }, [search, sortCol, sortDir])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const toggleSort = (col: TableCol) => {
    if (sortCol === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else {
      setSortCol(col)
      setSortDir('asc')
    }
    setPage(1)
  }

  const SortIcon = ({ col }: { col: TableCol }) => (
    <span className={`ml-1 text-[9px] ${sortCol === col ? 'text-emerald-600' : 'text-gray-300'}`}>
      {sortCol === col && sortDir === 'desc' ? '▼' : '▲'}
    </span>
  )

  if (loading) return <Skeleton className='h-96' />

  return (
    <Section
      title='Revenue Data Table'
      subtitle='Dữ liệu chi tiết theo ngày'
      action={
        <div className='flex items-center gap-2'>
          <div className='flex h-8 items-center gap-1.5 rounded-xl border border-gray-200 bg-white/80 px-3 dark:border-gray-600 dark:bg-gray-700'>
            <svg
              className='h-3 w-3 text-gray-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
            <input
              type='text'
              placeholder='Tìm ngày (dd/mm)...'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className='w-32 bg-transparent text-xs outline-none placeholder:text-gray-300 dark:text-gray-300'
            />
          </div>
          <button className='flex h-8 items-center gap-1 rounded-xl border border-emerald-200 px-3 text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400'>
            Export ↓
          </button>
        </div>
      }
    >
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-gray-100 dark:border-gray-700'>
              {(
                [
                  { key: 'date', label: 'Ngày' },
                  { key: 'orders', label: 'Đơn hàng' },
                  { key: 'revenue', label: 'Doanh thu' },
                  { key: 'profit', label: 'Lợi nhuận' },
                  { key: 'refund', label: 'Refund' },
                  { key: 'aov', label: 'AOV' }
                ] as { key: TableCol; label: string }[]
              ).map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className='cursor-pointer select-none pb-2.5 pr-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-emerald-600'
                >
                  {col.label} <SortIcon col={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row) => (
              <tr
                key={row.id}
                className='group border-b border-gray-50 transition hover:bg-emerald-50/40 dark:border-gray-700/40 dark:hover:bg-emerald-900/10'
              >
                <td className='py-2.5 pr-4 text-xs font-medium text-gray-600 dark:text-gray-400'>
                  {row.date}
                </td>
                <td className='py-2.5 pr-4 text-xs font-bold text-gray-800 dark:text-gray-200'>
                  {fmtNum(row.orders)}
                </td>
                <td className='py-2.5 pr-4 text-xs font-black text-emerald-700 dark:text-emerald-400'>
                  {fmtCurrency(row.revenue, true)}
                </td>
                <td className='py-2.5 pr-4 text-xs font-bold text-blue-600 dark:text-blue-400'>
                  {fmtCurrency(row.profit, true)}
                </td>
                <td className='py-2.5 pr-4 text-xs text-red-500'>
                  {fmtCurrency(row.refund, true)}
                </td>
                <td className='py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400'>
                  {fmtCurrency(row.aov, true)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='mt-4 flex items-center justify-between'>
        <p className='text-[11px] text-gray-400'>
          Hiển thị {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} /{' '}
          {filtered.length} dòng
        </p>
        <div className='flex items-center gap-1'>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className='flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-30 dark:border-gray-600'
          >
            <svg
              className='h-3 w-3'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2.5}
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M15 19l-7-7 7-7' />
            </svg>
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = i + Math.max(1, page - 2)
            if (p > totalPages) return null
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition ${p === page ? 'bg-emerald-600 text-white shadow-sm' : 'border border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-600 dark:border-gray-600'}`}
              >
                {p}
              </button>
            )
          })}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className='flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-30 dark:border-gray-600'
          >
            <svg
              className='h-3 w-3'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2.5}
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7' />
            </svg>
          </button>
        </div>
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════

export default function RevenueReport() {
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/60 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/30 transition-colors duration-300'>
        {/* Subtle background pattern */}
        <div
          className='pointer-events-none fixed inset-0 opacity-[0.025]'
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}
        />

        <div className='relative mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8'>
          {/* 1. Header */}
          <Header darkMode={darkMode} onDarkMode={() => setDarkMode((d) => !d)} />

          {/* 2. KPI Cards */}
          <div className='mb-5'>
            <KPICards loading={loading} />
          </div>

          {/* 3. Revenue Trend (full width) */}
          <div className='mb-5'>
            <RevenueTrend loading={loading} />
          </div>

          {/* 4+5: Breakdown + Top Books */}
          <div className='mb-5 grid gap-5 lg:grid-cols-3'>
            <div className='lg:col-span-1'>
              <RevenueBreakdown loading={loading} />
            </div>
            <div className='lg:col-span-2'>
              <TopBooks loading={loading} />
            </div>
          </div>

          {/* 6+7: Authors + Funnel */}
          <div className='mb-5 grid gap-5 lg:grid-cols-2'>
            <TopAuthors loading={loading} />
            <SalesFunnel loading={loading} />
          </div>

          {/* 8. Customer Analytics */}
          <div className='mb-5'>
            <CustomerAnalytics loading={loading} />
          </div>

          {/* 9+10: Payment + Coupon */}
          <div className='mb-5 grid gap-5 lg:grid-cols-2'>
            <PaymentAnalytics loading={loading} />
            <CouponImpact loading={loading} />
          </div>

          {/* 11+12: Refund + Geo */}
          <div className='mb-5 grid gap-5 lg:grid-cols-2'>
            <RefundAnalytics loading={loading} />
            <GeoSales loading={loading} />
          </div>

          {/* 13+14: Forecast + Insights */}
          <div className='mb-5 grid gap-5 lg:grid-cols-2'>
            <AIForecast loading={loading} />
            <InsightsPanel loading={loading} />
          </div>

          {/* 15. Data Table */}
          <div className='mb-8'>
            <DataTable loading={loading} />
          </div>

          {/* Footer */}
          <p className='text-center text-[10px] text-gray-300 dark:text-gray-600'>
            Revenue Report · Last updated: just now · Data retention: 12 months
          </p>
        </div>
      </div>
    </div>
  )
}
