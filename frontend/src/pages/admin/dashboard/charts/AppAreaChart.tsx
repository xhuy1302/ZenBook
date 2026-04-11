'use client'

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { VisitorChartData } from '@/services/dashboard/db.type'

// 1. Sửa nhãn (label) để phản ánh đúng logic Backend
const chartConfig = {
  newVisitors: {
    label: 'Tài khoản mới', // Logic: User mới đăng ký
    color: 'hsl(var(--chart-1))'
  },
  returningVisitors: {
    label: 'Khách đặt đơn cũ', // Logic: Khách cũ quay lại mua hàng
    color: 'hsl(var(--chart-2))'
  }
} satisfies ChartConfig

export default function AppAreaChart({ chartData }: { chartData: VisitorChartData[] }) {
  if (!chartData || chartData.length === 0)
    return (
      <div className='flex h-full items-center justify-center text-muted-foreground'>
        Chưa có dữ liệu người dùng
      </div>
    )

  return (
    <div className='flex flex-col gap-2'>
      {/* 2. Đổi tiêu đề cho đúng bản chất dữ liệu */}
      <h1 className='text-lg font-semibold'>Phân tích tăng trưởng người dùng</h1>
      <p className='text-sm text-muted-foreground mb-2'>
        Thống kê dựa trên lượt đăng ký mới và khách hàng phát sinh đơn hàng
      </p>

      <ChartContainer config={chartConfig} className='min-h-[250px] w-full'>
        <AreaChart accessibilityLayer data={chartData} margin={{ left: -20, right: 10 }}>
          <CartesianGrid vertical={false} strokeDasharray='3 3' />
          <XAxis
            dataKey='month'
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            // Giúp hiển thị tháng tiếng Việt cho đẹp nếu cần
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={10} />

          {/* 3. Chỉnh Tooltip để hiện rõ đơn vị là "Người" hoặc "Tài khoản" */}
          <ChartTooltip content={<ChartTooltipContent indicator='dot' />} />

          <ChartLegend content={<ChartLegendContent />} />

          <defs>
            <linearGradient id='fillNew' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='var(--color-newVisitors)' stopOpacity={0.3} />
              <stop offset='95%' stopColor='var(--color-newVisitors)' stopOpacity={0} />
            </linearGradient>
            <linearGradient id='fillReturning' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='var(--color-returningVisitors)' stopOpacity={0.3} />
              <stop offset='95%' stopColor='var(--color-returningVisitors)' stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Cấu trúc xếp chồng: Khách cũ ở dưới làm nền, khách mới đè lên trên */}
          <Area
            dataKey='returningVisitors'
            type='monotone'
            fill='url(#fillReturning)'
            stroke='var(--color-returningVisitors)'
            stackId='a'
          />
          <Area
            dataKey='newVisitors'
            type='monotone'
            fill='url(#fillNew)'
            stroke='var(--color-newVisitors)'
            stackId='a'
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
