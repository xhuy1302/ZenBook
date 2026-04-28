'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'

import { getDashboardOverviewApi, exportDashboardExcelApi } from '@/services/dashboard/db.api'
import type { DashboardData } from '@/services/dashboard/db.type'

type StatusKey =
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'pending'
  | 'confirmed'
  | 'packing'
  | 'returned'

// Chỉ lưu CSS class ở ngoài, label sẽ được dịch ở bên trong component
const statusStyles: Record<StatusKey, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  confirmed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  packing: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  shipped: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  processing: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  returned: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  cancelled: 'bg-rose-500/10 text-rose-600 border-rose-500/20'
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
  // 👉 1. HOOKS PHẢI NẰM TRONG COMPONENT
  const { t, i18n } = useTranslation('dashboard') // Khai báo namespace 'dashboard'

  const [period, setPeriod] = useState<string>('month')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Xác định locale cho date-fns dựa trên ngôn ngữ hiện tại
  const dateLocale = i18n.language === 'vi' ? vi : enUS

  // 👉 2. HÀM EXPORT CŨNG PHẢI NẰM TRONG COMPONENT
  const handleExport = async () => {
    try {
      const blobData = await exportDashboardExcelApi(period)
      const url = window.URL.createObjectURL(new Blob([blobData]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute(
        'download',
        `${t('export.fileName')}_${period}_${format(new Date(), 'ddMMyyyy_HHmm')}.xlsx`
      )

      document.body.appendChild(link)
      link.click()

      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Lỗi khi xuất file Excel:', error)
      alert(t('export.error'))
    }
  }

  // Fetch Dữ liệu từ Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await getDashboardOverviewApi(period)
        setData(response)
      } catch (error) {
        console.error('Lỗi khi tải Dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [period])

  // Dùng useMemo cho metrics để tự động cập nhật khi ngôn ngữ đổi
  const dynamicMetrics = useMemo(() => {
    if (!data) return []
    return [
      {
        label: t('metrics.revenue'),
        value: data.metrics.revenue.value,
        change: data.metrics.revenue.change,
        up: data.metrics.revenue.up,
        sub: t('metrics.compareSub'),
        icon: Wallet,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10'
      },
      {
        label: t('metrics.orders'),
        value: data.metrics.orders.value,
        change: data.metrics.orders.change,
        up: data.metrics.orders.up,
        sub: t('metrics.compareSub'),
        icon: ShoppingBag,
        color: 'text-sky-500',
        bg: 'bg-sky-500/10'
      },
      {
        label: t('metrics.booksSold'),
        value: data.metrics.booksSold.value,
        change: data.metrics.booksSold.change,
        up: data.metrics.booksSold.up,
        sub: t('metrics.compareSub'),
        icon: BookMarked,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10'
      },
      {
        label: t('metrics.newCustomers'),
        value: data.metrics.newCustomers.value,
        change: data.metrics.newCustomers.change,
        up: data.metrics.newCustomers.up,
        sub: t('metrics.compareSub'),
        icon: Users,
        color: 'text-rose-500',
        bg: 'bg-rose-500/10'
      }
    ]
  }, [data, t, i18n.language])

  const categoryColors = ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#f43f5e']

  const totalYearRevenue = useMemo(
    () => data?.revenueData.reduce((sum, item) => sum + item.revenue, 0) || 0,
    [data]
  )

  const bestMonth = useMemo(
    () =>
      data?.revenueData.reduce(
        (prev, current) => (prev.revenue > current.revenue ? prev : current),
        data.revenueData[0] || { month: 'T1', revenue: 0 }
      ) || { month: 'T1', revenue: 0 },
    [data]
  )

  if (loading || !data) {
    return (
      <div className='flex items-center justify-center h-screen w-full'>
        <div className='animate-pulse flex flex-col items-center'>
          <div className='h-12 w-12 bg-primary/20 rounded-full mb-4'></div>
          <p className='text-muted-foreground font-medium'>{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6 p-6'>
      {/* ── PAGE TITLE & ACTIONS ── */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>{t('title')}</h1>
          <p className='text-sm text-muted-foreground mt-1 capitalize'>
            {format(new Date(), t('datePattern'), { locale: dateLocale })}
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <div className='relative flex items-center'>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className='appearance-none bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 pl-9 pr-8 py-2 rounded-md text-sm font-medium transition-colors outline-none cursor-pointer focus:ring-2 focus:ring-primary/20'
            >
              <option value='today'>{t('filter.today')}</option>
              <option value='week'>{t('filter.week')}</option>
              <option value='month'>{t('filter.month')}</option>
              <option value='year'>{t('filter.year')}</option>
            </select>
            <Filter
              size={14}
              className='absolute left-3 pointer-events-none text-secondary-foreground'
            />
            <ChevronDown
              size={14}
              className='absolute right-3 pointer-events-none text-secondary-foreground opacity-50'
            />
          </div>
          <button
            onClick={handleExport}
            className='flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-none px-4 py-2 rounded-md text-sm font-medium transition-colors'
          >
            <Download size={14} /> {t('export.button')}
          </button>
        </div>
      </div>

      {/* ── 1. METRIC CARDS ── */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {dynamicMetrics.map((m, i) => (
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
        <div className='bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm lg:col-span-2 flex flex-col'>
          <div className='flex justify-between items-center mb-6'>
            <div>
              <h2 className='text-lg font-semibold'>{t('charts.revenue.title')}</h2>
              <p className='text-xs text-muted-foreground mt-1'>
                {t('charts.revenue.yearTotal')} {new Date().getFullYear()}:{' '}
                {totalYearRevenue.toLocaleString('en-US', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1
                })}{' '}
                M₫
              </p>
            </div>
          </div>

          <div className='flex-1 min-h-[220px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart
                data={data.revenueData}
                margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
              >
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
              <span className='text-xs text-muted-foreground'>{t('charts.revenue.legend')}</span>
            </div>
            <div className='flex items-center gap-1.5 text-emerald-500 text-xs font-semibold'>
              <TrendingUp size={14} />
              {t('charts.revenue.bestMonth')}: {bestMonth.month} —{' '}
              {bestMonth.revenue.toLocaleString('en-US', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
              })}{' '}
              M₫
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className='bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm flex flex-col'>
          <h2 className='text-lg font-semibold mb-1'>{t('charts.categories.title')}</h2>
          <p className='text-xs text-muted-foreground mb-6'>
            {t('charts.categories.month')} {new Date().getMonth() + 1} / {new Date().getFullYear()}
          </p>

          <div className='space-y-5 flex-1'>
            {data.categoryData.length === 0 ? (
              <div className='text-sm text-muted-foreground italic text-center mt-10'>
                {t('charts.categories.empty')}
              </div>
            ) : (
              data.categoryData.map((cat, i) => {
                const color = categoryColors[i % categoryColors.length]
                return (
                  <div key={i}>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='text-sm font-medium text-foreground'>{cat.name}</span>
                      <span className='text-sm font-bold' style={{ color }}>
                        {cat.value}%
                      </span>
                    </div>
                    <div className='h-1.5 w-full bg-secondary rounded-full overflow-hidden'>
                      <div
                        className='h-full rounded-full transition-all duration-1000 ease-in-out'
                        style={{ width: `${cat.value}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className='mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10 flex justify-between items-center'>
            <div className='text-xs text-muted-foreground font-medium'>
              {t('charts.categories.totalSold')}
            </div>
            <div className='text-xl font-bold text-primary'>
              {data.metrics.booksSold.value.replace(/[^0-9.,]/g, '')}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. LISTS & ALERTS ── */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {/* Top Books */}
        <div className='bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-lg font-semibold'>{t('lists.topBooks.title')}</h2>
            <button className='flex items-center gap-1 text-xs text-primary font-medium hover:underline'>
              {t('lists.seeAll')} <ChevronRight size={14} />
            </button>
          </div>

          <div className='space-y-4'>
            {data.topBooks.length === 0 ? (
              <div className='text-sm text-muted-foreground italic text-center'>
                {t('lists.topBooks.empty')}
              </div>
            ) : (
              data.topBooks.map((book, i) => (
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
                    <div
                      className='text-sm font-semibold truncate text-foreground'
                      title={book.title}
                    >
                      {book.title}
                    </div>
                    <div
                      className='text-xs text-muted-foreground mt-0.5 truncate'
                      title={book.author}
                    >
                      {book.author}
                    </div>
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
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className='bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-lg font-semibold'>{t('lists.recentOrders.title')}</h2>
            <button className='flex items-center gap-1 text-xs text-primary font-medium hover:underline'>
              {t('lists.recentOrders.seeAll')} <ChevronRight size={14} />
            </button>
          </div>

          <div className='space-y-4'>
            {data.recentOrders.length === 0 ? (
              <div className='text-sm text-muted-foreground italic text-center'>
                {t('lists.recentOrders.empty')}
              </div>
            ) : (
              data.recentOrders.map((order, i) => {
                const sCls =
                  statusStyles[order.status as StatusKey] || 'bg-gray-500/10 text-gray-600'
                const sLabel = t(`status.${order.status}`, { defaultValue: order.status })

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
                        <div className='text-sm font-semibold text-foreground'>
                          {order.customer}
                        </div>
                        <div className='text-xs text-muted-foreground mt-0.5'>
                          {order.id} • {order.time}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-3 sm:gap-4 sm:ml-auto pl-12 sm:pl-0'>
                      <div className='text-right flex-1 sm:flex-none'>
                        <div className='text-sm font-bold text-foreground'>{order.total}</div>
                        <div className='text-[10px] text-muted-foreground mt-0.5'>
                          {order.items} {t('lists.recentOrders.items')}
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border whitespace-nowrap ${sCls}`}
                      >
                        {sLabel}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column: Alerts & Stats */}
        <div className='flex flex-col gap-4'>
          {/* Stock Alerts */}
          <div className='bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm'>
            <div className='flex items-center gap-2 mb-5'>
              <AlertCircle size={18} className='text-amber-500' />
              <h2 className='text-base font-semibold'>{t('alerts.title')}</h2>
            </div>
            <div className='space-y-3'>
              {data.alerts.length === 0 ? (
                <div className='text-sm text-emerald-600 font-medium bg-emerald-500/10 p-3 rounded-lg text-center'>
                  {t('alerts.safe')}
                </div>
              ) : (
                data.alerts.map((a, i) => (
                  <div
                    key={i}
                    className='flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg'
                  >
                    <div className='w-8 h-10 rounded bg-amber-500/10 shrink-0 flex items-center justify-center'>
                      <BookOpen size={16} className='text-amber-600 dark:text-amber-500' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div
                        className='text-sm font-semibold truncate text-foreground'
                        title={a.book}
                      >
                        {a.book}
                      </div>
                      <div className='text-xs text-amber-600 dark:text-amber-500/80 font-medium mt-0.5'>
                        {t('alerts.left')} {a.stock} {t('alerts.unit')}
                      </div>
                    </div>
                    <button className='px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-500 rounded-md text-xs font-bold transition-colors shrink-0'>
                      {t('alerts.importBtn')}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className='bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm flex-1'>
            <h2 className='text-base font-semibold mb-5'>{t('todayStats.title')}</h2>
            <div className='space-y-4'>
              {[
                {
                  label: t('todayStats.newOrders'),
                  value: data.todayStats.newOrders,
                  icon: ShoppingBag,
                  color: 'text-sky-500',
                  bg: 'bg-sky-500/10'
                },
                {
                  label: t('todayStats.visitors'),
                  value: data.todayStats.visitors.toLocaleString(),
                  icon: Users,
                  color: 'text-purple-500',
                  bg: 'bg-purple-500/10'
                },
                {
                  label: t('todayStats.reviews'),
                  value: data.todayStats.reviews,
                  icon: Star,
                  color: 'text-amber-500',
                  bg: 'bg-amber-500/10'
                },
                {
                  label: t('todayStats.shipping'),
                  value: data.todayStats.shipping,
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
