'use client'

import React, { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import {
  ShoppingBag,
  BookOpen,
  Users,
  TrendingUp,
  Star,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  ChevronRight,
  Truck,
  AlertCircle,
  BookMarked,
  Wallet
} from 'lucide-react'

/* ── DATA ── */
const revenueData = [
  { month: 'T1', revenue: 42, orders: 210 },
  { month: 'T2', revenue: 58, orders: 290 },
  { month: 'T3', revenue: 51, orders: 255 },
  { month: 'T4', revenue: 74, orders: 370 },
  { month: 'T5', revenue: 68, orders: 340 },
  { month: 'T6', revenue: 89, orders: 445 },
  { month: 'T7', revenue: 95, orders: 475 },
  { month: 'T8', revenue: 82, orders: 410 },
  { month: 'T9', revenue: 110, orders: 550 },
  { month: 'T10', revenue: 104, orders: 520 },
  { month: 'T11', revenue: 138, orders: 690 },
  { month: 'T12', revenue: 162, orders: 810 }
]

const categoryData = [
  { name: 'Văn học', value: 34 },
  { name: 'Kỹ năng', value: 28 },
  { name: 'Kinh tế', value: 19 },
  { name: 'Khoa học', value: 11 },
  { name: 'Thiếu nhi', value: 8 }
]

const topBooks = [
  {
    id: 1,
    title: 'Đắc Nhân Tâm',
    author: 'Dale Carnegie',
    sold: 1842,
    revenue: '55.3M',
    stock: 240,
    trend: 'up',
    cover: '#1a4d2e'
  },
  {
    id: 2,
    title: 'Nhà Giả Kim',
    author: 'Paulo Coelho',
    sold: 1590,
    revenue: '47.7M',
    stock: 185,
    trend: 'up',
    cover: '#4a2000'
  },
  {
    id: 3,
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    sold: 1230,
    revenue: '61.5M',
    stock: 92,
    trend: 'down',
    cover: '#1a2a4a'
  },
  {
    id: 4,
    title: 'Tôi Tài Giỏi, Bạn Cũng Thế',
    author: 'Adam Khoo',
    sold: 980,
    revenue: '29.4M',
    stock: 310,
    trend: 'up',
    cover: '#3d1a00'
  },
  {
    id: 5,
    title: 'Mindset',
    author: 'Carol S. Dweck',
    sold: 860,
    revenue: '34.4M',
    stock: 47,
    trend: 'down',
    cover: '#1a3a3a'
  }
]

const recentOrders = [
  {
    id: '#ZB-8821',
    customer: 'Nguyễn Minh Anh',
    avatar: 'NM',
    time: '5 phút trước',
    items: 3,
    total: '285,000₫',
    status: 'processing'
  },
  {
    id: '#ZB-8820',
    customer: 'Trần Bảo Châu',
    avatar: 'TC',
    time: '18 phút trước',
    items: 1,
    total: '89,000₫',
    status: 'shipped'
  },
  {
    id: '#ZB-8819',
    customer: 'Phạm Hữu Lộc',
    avatar: 'PL',
    time: '34 phút trước',
    items: 5,
    total: '612,000₫',
    status: 'delivered'
  },
  {
    id: '#ZB-8818',
    customer: 'Lê Khánh Linh',
    avatar: 'LL',
    time: '1 giờ trước',
    items: 2,
    total: '178,000₫',
    status: 'delivered'
  },
  {
    id: '#ZB-8817',
    customer: 'Vũ Đức Thành',
    avatar: 'VT',
    time: '2 giờ trước',
    items: 4,
    total: '396,000₫',
    status: 'cancelled'
  }
]

const alerts = [
  { book: 'Mindset', stock: 47, threshold: 50 },
  { book: 'Atomic Habits', stock: 23, threshold: 50 },
  { book: 'Hội Chứng Phòng Tám', stock: 11, threshold: 50 }
]

const metrics = [
  {
    label: 'Doanh thu tháng',
    value: '1.62 tỷ',
    change: '+23.4%',
    up: true,
    sub: 'so với tháng trước',
    icon: Wallet,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  {
    label: 'Đơn hàng',
    value: '3,240',
    change: '+18.2%',
    up: true,
    sub: 'so với tháng trước',
    icon: ShoppingBag,
    color: 'text-sky-500',
    bg: 'bg-sky-500/10'
  },
  {
    label: 'Sách đã bán',
    value: '8,910',
    change: '+31.7%',
    up: true,
    sub: 'so với tháng trước',
    icon: BookMarked,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10'
  },
  {
    label: 'Khách mới',
    value: '642',
    change: '-4.1%',
    up: false,
    sub: 'so với tháng trước',
    icon: Users,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10'
  }
]

type StatusKey = 'processing' | 'shipped' | 'delivered' | 'cancelled'

const statusConfig: Record<StatusKey, { label: string; cls: string }> = {
  processing: {
    label: 'Đang xử lý',
    cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20'
  },
  shipped: {
    label: 'Đang giao',
    cls: 'bg-sky-500/10 text-sky-600 dark:text-sky-500 border-sky-500/20'
  },
  delivered: {
    label: 'Hoàn thành',
    cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20'
  },
  cancelled: {
    label: 'Đã huỷ',
    cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-500 border-rose-500/20'
  }
}

interface TooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className='bg-popover border border-border rounded-lg p-3 text-xs shadow-md'>
      <p className='text-muted-foreground mb-1 font-medium'>{label}</p>
      <p className='text-emerald-500 font-bold text-sm'>{payload[0]?.value}M₫</p>
    </div>
  )
}

/* ════════════════════════════════════════════════════ */
export default function DashboardHome() {
  const [chartPeriod, setChartPeriod] = useState<string>('Năm')

  return (
    <div className='flex flex-col gap-6 p-6'>
      {/* ── PAGE TITLE & ACTIONS ── */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>Tổng quan ZenBook</h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Thứ Hai, 27 tháng 4, 2026 &nbsp;·&nbsp; Cập nhật lúc 14:32
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <button className='flex items-center gap-2 bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium transition-colors'>
            <Filter size={14} /> Lọc
          </button>
          <button className='flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-none px-4 py-2 rounded-md text-sm font-medium transition-colors'>
            <Download size={14} /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* ── 1. METRIC CARDS ── */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {metrics.map((m, i) => (
          <div
            key={i}
            className='bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5'
          >
            <div className='flex justify-between items-start mb-4'>
              <p className='text-xs text-muted-foreground font-semibold uppercase tracking-wider'>
                {m.label}
              </p>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${m.bg}`}>
                <m.icon size={18} className={m.color} />
              </div>
            </div>
            <div className='text-3xl font-bold mb-2'>{m.value}</div>
            <div className='flex items-center gap-2'>
              <span
                className={`flex items-center gap-1 text-sm font-semibold ${m.up ? 'text-emerald-500' : 'text-rose-500'}`}
              >
                {m.up ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {m.change}
              </span>
              <span className='text-xs text-muted-foreground'>{m.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 2. CHARTS ── */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {/* Revenue Chart */}
        <div className='bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm lg:col-span-2 flex flex-col'>
          <div className='flex justify-between items-center mb-6'>
            <div>
              <h2 className='text-lg font-semibold'>Doanh thu & Đơn hàng</h2>
              <p className='text-xs text-muted-foreground mt-1'>Tổng năm 2025: 1,073M₫</p>
            </div>
            <div className='flex gap-2'>
              {['Tuần', 'Tháng', 'Năm'].map((p) => (
                <button
                  key={p}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    chartPeriod === p
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-transparent text-muted-foreground border-transparent hover:bg-secondary hover:border-border'
                  }`}
                  onClick={() => setChartPeriod(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className='flex-1 min-h-[220px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id='revGrad' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor='hsl(var(--primary))' stopOpacity={0.2} />
                    <stop offset='100%' stopColor='hsl(var(--primary))' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' vertical={false} />
                <XAxis
                  dataKey='month'
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type='monotone'
                  dataKey='revenue'
                  stroke='hsl(var(--primary))'
                  strokeWidth={2}
                  fill='url(#revGrad)'
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: 'hsl(var(--primary))',
                    stroke: 'hsl(var(--background))',
                    strokeWidth: 2
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className='flex gap-6 mt-4 pt-4 border-t border-border items-center'>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 rounded-sm bg-primary' />
              <span className='text-xs text-muted-foreground'>Doanh thu (triệu đồng)</span>
            </div>
            <div className='flex items-center gap-1.5 text-emerald-500 text-xs font-semibold'>
              <TrendingUp size={14} />
              Tháng cao nhất: T12 — 162M₫
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className='bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm flex flex-col'>
          <h2 className='text-lg font-semibold mb-1'>Danh mục bán chạy</h2>
          <p className='text-xs text-muted-foreground mb-6'>Tháng 12 / 2025</p>

          <div className='space-y-5 flex-1'>
            {categoryData.map((cat, i) => {
              const colors = ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#f43f5e'] // Tailwind colors
              return (
                <div key={i}>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-sm font-medium text-foreground'>{cat.name}</span>
                    <span className='text-sm font-bold' style={{ color: colors[i] }}>
                      {cat.value}%
                    </span>
                  </div>
                  <div className='h-1.5 w-full bg-secondary rounded-full overflow-hidden'>
                    <div
                      className='h-full rounded-full'
                      style={{ width: `${cat.value}%`, backgroundColor: colors[i] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className='mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10'>
            <div className='text-xs text-muted-foreground mb-1 font-medium'>Tổng đơn vị bán</div>
            <div className='text-2xl font-bold text-primary'>8,910</div>
          </div>
        </div>
      </div>

      {/* ── 3. LISTS & ALERTS ── */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {/* Top Books */}
        <div className='bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-lg font-semibold'>Sách bán chạy</h2>
            <button className='flex items-center gap-1 text-xs text-primary font-medium hover:underline'>
              Xem tất cả <ChevronRight size={14} />
            </button>
          </div>

          <div className='space-y-4'>
            {topBooks.map((book, i) => (
              <div
                key={book.id}
                className='flex items-center gap-3 pb-4 border-b border-border last:border-0 last:pb-0'
              >
                <span className='text-xs font-bold text-muted-foreground w-4 shrink-0'>
                  0{i + 1}
                </span>
                <div
                  className='w-9 h-12 rounded bg-secondary shrink-0 flex items-end justify-center pb-1 shadow-sm'
                  style={{ backgroundColor: book.cover }}
                >
                  <div className='w-1 h-3/4 bg-white/20 rounded-sm' />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='text-sm font-semibold truncate text-foreground'>{book.title}</div>
                  <div className='text-xs text-muted-foreground mt-0.5'>{book.author}</div>
                </div>
                <div className='text-right shrink-0'>
                  <div className='text-sm font-bold text-primary'>{book.sold}</div>
                  <div className='text-[10px] text-muted-foreground mt-0.5'>{book.revenue}</div>
                </div>
                <div className='shrink-0 pl-1'>
                  {book.trend === 'up' ? (
                    <ArrowUpRight size={16} className='text-emerald-500' />
                  ) : (
                    <ArrowDownRight size={16} className='text-rose-500' />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className='bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-lg font-semibold'>Đơn hàng gần đây</h2>
            <button className='flex items-center gap-1 text-xs text-primary font-medium hover:underline'>
              Tất cả đơn <ChevronRight size={14} />
            </button>
          </div>

          <div className='space-y-4'>
            {recentOrders.map((order, i) => {
              const s = statusConfig[order.status as StatusKey]
              return (
                <div
                  key={i}
                  className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border last:border-0 last:pb-0'
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground'>
                      {order.avatar}
                    </div>
                    <div>
                      <div className='text-sm font-semibold text-foreground'>{order.customer}</div>
                      <div className='text-xs text-muted-foreground mt-0.5'>
                        {order.id} • {order.time}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-3 sm:gap-4 sm:ml-auto pl-12 sm:pl-0'>
                    <div className='text-right flex-1 sm:flex-none'>
                      <div className='text-sm font-bold text-foreground'>{order.total}</div>
                      <div className='text-[10px] text-muted-foreground mt-0.5'>
                        {order.items} cuốn
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border whitespace-nowrap ${s.cls}`}
                    >
                      {s.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Alerts & Stats */}
        <div className='flex flex-col gap-4'>
          {/* Stock Alerts */}
          <div className='bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm'>
            <div className='flex items-center gap-2 mb-5'>
              <AlertCircle size={18} className='text-amber-500' />
              <h2 className='text-base font-semibold'>Cảnh báo tồn kho</h2>
            </div>

            <div className='space-y-3'>
              {alerts.map((a, i) => (
                <div
                  key={i}
                  className='flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg'
                >
                  <div className='w-8 h-10 rounded bg-amber-500/10 shrink-0 flex items-center justify-center'>
                    <BookOpen size={16} className='text-amber-600 dark:text-amber-500' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-sm font-semibold truncate text-foreground'>{a.book}</div>
                    <div className='text-xs text-amber-600 dark:text-amber-500/80 font-medium mt-0.5'>
                      Còn {a.stock} cuốn
                    </div>
                  </div>
                  <button className='px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-500 rounded-md text-xs font-bold transition-colors'>
                    Nhập
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className='bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm flex-1'>
            <h2 className='text-base font-semibold mb-5'>Hôm nay</h2>
            <div className='space-y-4'>
              {[
                {
                  label: 'Đơn hàng mới',
                  value: '47',
                  icon: ShoppingBag,
                  color: 'text-sky-500',
                  bg: 'bg-sky-500/10'
                },
                {
                  label: 'Khách ghé thăm',
                  value: '1,204',
                  icon: Users,
                  color: 'text-purple-500',
                  bg: 'bg-purple-500/10'
                },
                {
                  label: 'Sách đánh giá',
                  value: '23',
                  icon: Star,
                  color: 'text-amber-500',
                  bg: 'bg-amber-500/10'
                },
                {
                  label: 'Đang giao hàng',
                  value: '31',
                  icon: Truck,
                  color: 'text-emerald-500',
                  bg: 'bg-emerald-500/10'
                }
              ].map((s, i) => (
                <div key={i} className='flex items-center gap-3'>
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${s.bg}`}>
                    <s.icon size={14} className={s.color} />
                  </div>
                  <span className='flex-1 text-sm text-muted-foreground'>{s.label}</span>
                  <span className='text-base font-bold text-foreground'>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
