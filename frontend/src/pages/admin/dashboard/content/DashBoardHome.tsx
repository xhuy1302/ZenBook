'use client'

import { useEffect, useState } from 'react'
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  type LucideIcon,
  Loader2
} from 'lucide-react'
import AppAreaChart from '@/pages/admin/dashboard/charts/AppAreaChart'
import AppBarChart from '@/pages/admin/dashboard/charts/AppBarChart'
import AppPieChart from '@/pages/admin/dashboard/charts/AppPieChart'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import { getDashboardSummaryApi } from '@/services/dashboard/db.api'
import type { DashboardSummary, RecentOrder, LowStockBook } from '@/services/dashboard/db.type'

interface StatCardProps {
  title: string
  value: string | number
  desc: string
  icon: LucideIcon
  trend: string
  onClick?: () => void
}

function StatCard({ title, value, desc, icon: Icon, trend, onClick }: StatCardProps) {
  return (
    <div
      className={`bg-primary-foreground p-6 rounded-xl border shadow-sm ${
        onClick ? 'cursor-pointer hover:border-primary transition-colors duration-200' : ''
      }`}
      onClick={onClick}
    >
      <div className='flex justify-between items-start'>
        <div>
          <p className='text-sm text-muted-foreground font-medium'>{title}</p>
          <h3 className='text-2xl font-bold mt-1'>{value}</h3>
          <p
            className={`text-xs mt-1 flex items-center ${
              trend.startsWith('-') || trend === 'Cảnh báo' ? 'text-rose-500' : 'text-emerald-500'
            }`}
          >
            {trend} <span className='text-muted-foreground ml-1'>{desc}</span>
          </p>
        </div>
        <div className='p-2 bg-muted rounded-lg'>
          <Icon className='h-5 w-5 text-foreground' />
        </div>
      </div>
    </div>
  )
}

export default function DashboardHome() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const summaryData = await getDashboardSummaryApi()
        setData(summaryData)
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
            ?.message ||
          (err as { message?: string })?.message ||
          'Lỗi tải dữ liệu Dashboard'
        setErrorMsg(message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className='flex h-[80vh] flex-col items-center justify-center gap-4 text-muted-foreground'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
        <p>Đang tải nhịp đập ZenBook...</p>
      </div>
    )
  }

  if (errorMsg || !data) {
    return (
      <div className='flex h-[80vh] items-center justify-center'>
        <p className='p-6 text-rose-500 bg-rose-50 rounded-lg border border-rose-200'>
          Lỗi: {errorMsg || 'Không có dữ liệu'}
        </p>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6 p-6'>
      <h1 className='text-2xl font-bold tracking-tight'>Tổng quan ZenBook</h1>

      {/* 1. STAT CARDS */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='Doanh thu'
          // 👉 Sửa: Thêm ?. để phòng trường hợp totalRevenue bị undefined
          value={`${(data.totalRevenue || 0).toLocaleString()}đ`}
          trend='Live'
          desc='cập nhật liên tục'
          icon={DollarSign}
        />
        <StatCard
          title='Đơn hàng mới'
          value={data.newOrdersCount || 0}
          trend={`+${data.newOrdersCount || 0}`}
          desc='đơn cần duyệt'
          icon={ShoppingBag}
        />
        <StatCard
          title='Khách hàng'
          value={data.totalCustomers || 0}
          trend='Tổng'
          desc='thành viên hệ thống'
          icon={Users}
        />
        <StatCard
          title='Sách sắp hết'
          value={data.lowStockCount || 0}
          trend={(data.lowStockCount || 0) > 0 ? 'Cảnh báo' : 'An toàn'}
          desc='đầu sách < 5 quyển (Click xem)'
          icon={AlertTriangle}
          onClick={() => setIsLowStockModalOpen(true)}
        />
      </div>

      {/* 2. CHARTS GRID */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <div className='bg-primary-foreground p-6 rounded-xl border shadow-sm lg:col-span-2'>
          <AppBarChart chartData={data.revenueChart || []} />
        </div>

        <div className='bg-primary-foreground p-6 rounded-xl border shadow-sm'>
          <AppPieChart chartData={data.categoryChart || []} />
        </div>

        <div className='bg-primary-foreground p-6 rounded-xl border shadow-sm lg:col-span-2'>
          <AppAreaChart chartData={data.visitorChart || []} />
        </div>

        {/* 3. RECENT ORDERS */}
        <div className='bg-primary-foreground p-6 rounded-xl border shadow-sm overflow-hidden flex flex-col'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-lg font-semibold'>Đơn hàng mới nhất</h2>
            <ArrowUpRight className='h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary' />
          </div>
          <div className='space-y-6 overflow-y-auto pr-2'>
            {data.recentOrders?.map((order: RecentOrder) => (
              <div key={order.id} className='flex items-center gap-4'>
                <div className='h-9 w-9 rounded-full bg-muted flex items-center justify-center font-bold text-xs uppercase text-primary'>
                  {order.customerName ? order.customerName.substring(0, 2) : 'KH'}
                </div>
                <div className='flex-1 space-y-1'>
                  <p className='text-sm font-medium leading-none truncate max-w-[150px]'>
                    {order.customerName}
                  </p>
                  {/* 👉 Sửa: Thêm optional chaining ?. để tránh Crash nếu finalTotal bị null */}
                  <p className='text-xs text-muted-foreground'>
                    {order.orderCode} • {(order.finalTotal || 0).toLocaleString()}đ
                  </p>
                </div>
                <div
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    order.status === 'PENDING'
                      ? 'bg-amber-50 text-amber-500'
                      : 'bg-blue-50 text-blue-500'
                  }`}
                >
                  {order.status}
                </div>
              </div>
            ))}
            {(!data.recentOrders || data.recentOrders.length === 0) && (
              <p className='text-sm text-muted-foreground text-center mt-4'>
                Chưa có đơn hàng nào.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 4. MODAL DANH SÁCH SÁCH SẮP HẾT */}
      <Dialog open={isLowStockModalOpen} onOpenChange={setIsLowStockModalOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5 text-amber-500' />
              Danh sách sách sắp hết hàng (Tồn kho &lt; 5)
            </DialogTitle>
          </DialogHeader>

          <div className='max-h-[50vh] overflow-y-auto border rounded-md'>
            <Table>
              <TableHeader className='bg-muted/50 sticky top-0'>
                <TableRow>
                  <TableHead>Tên sách</TableHead>
                  <TableHead className='text-right w-[100px]'>Tồn kho</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.lowStockBooks && data.lowStockBooks.length > 0 ? (
                  data.lowStockBooks.map((book: LowStockBook) => (
                    <TableRow key={book.id}>
                      <TableCell className='font-medium'>{book.title}</TableCell>
                      <TableCell className='text-right text-rose-500 font-bold'>
                        {book.stockQuantity}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className='text-center py-8 text-muted-foreground'>
                      Hiện tại không có sách nào sắp hết.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
