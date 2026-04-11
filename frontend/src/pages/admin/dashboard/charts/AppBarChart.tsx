'use client'

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { RevenueChartData } from '@/services/dashboard/db.type'

const chartConfig = {
  revenue: { label: 'Doanh thu', color: 'hsl(var(--chart-1))' },
  profit: { label: 'Lợi nhuận', color: 'hsl(var(--chart-2))' }
} satisfies ChartConfig

export default function AppBarChart({ chartData }: { chartData: RevenueChartData[] }) {
  if (!chartData || chartData.length === 0)
    return (
      <div className='flex h-full items-center justify-center text-muted-foreground'>
        Chưa có dữ liệu
      </div>
    )

  return (
    <div className='flex flex-col gap-4'>
      <h1 className='text-lg font-semibold'>Tăng trưởng doanh thu</h1>
      <ChartContainer config={chartConfig} className='min-h-[250px] w-full'>
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} strokeDasharray='3 3' />
          <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey='revenue' fill='var(--color-revenue)' radius={[4, 4, 0, 0]} />
          <Bar dataKey='profit' fill='var(--color-profit)' radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
