'use client'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart'
import { useMemo } from 'react'
import { Label, Pie, PieChart, Cell } from 'recharts'
import type { CategoryChartData } from '@/services/dashboard/db.type'

// 👉 Sử dụng mã màu HEX trực tiếp để đảm bảo 100% lên màu
const SOLID_COLORS = [
  '#3b82f6', // Xanh dương
  '#10b981', // Xanh lá
  '#f59e0b', // Vàng cam
  '#ef4444', // Đỏ
  '#8b5cf6', // Tím
  '#ec4899', // Hồng
  '#06b6d4' // Xanh ngọc
]

export default function AppPieChart({ chartData }: { chartData: CategoryChartData[] }) {
  // Tính tổng số lượng
  const totalSales = useMemo(() => {
    if (!chartData) return 0
    return chartData.reduce((acc, curr) => acc + curr.sales, 0)
  }, [chartData])

  // Map lại data để ép màu HEX vào từng danh mục
  const formattedData = useMemo(() => {
    if (!chartData) return []
    return chartData.map((item, index) => ({
      ...item,
      fill: SOLID_COLORS[index % SOLID_COLORS.length]
    }))
  }, [chartData])

  // Cấu hình linh hoạt cho Shadcn Tooltip (Chuẩn TypeScript, KHÔNG DÙNG ANY)
  const dynamicConfig = useMemo(() => {
    const config: ChartConfig = {
      sales: { label: 'Đã bán' }
    }

    formattedData.forEach((item) => {
      config[item.category] = {
        label: item.category,
        color: item.fill
      }
    })

    return config
  }, [formattedData])

  // Xử lý khi chưa có dữ liệu
  if (!chartData || chartData.length === 0)
    return (
      <div className='flex flex-col h-full min-h-[250px]'>
        <h1 className='text-lg font-semibold mb-2'>Tỷ trọng danh mục</h1>
        <div className='flex-1 flex items-center justify-center text-muted-foreground border border-dashed rounded-xl bg-muted/10'>
          Chưa có dữ liệu danh mục
        </div>
      </div>
    )

  return (
    <div className='flex flex-col'>
      <h1 className='text-lg font-semibold mb-2'>Tỷ trọng danh mục</h1>
      <ChartContainer config={dynamicConfig} className='mx-auto aspect-square max-h-[250px]'>
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={formattedData}
            dataKey='sales'
            nameKey='category'
            innerRadius={65}
            strokeWidth={2}
            paddingAngle={2} // Thêm 2px khoảng cách giữa các múi cho hiện đại
          >
            {/* Vòng lặp này bắt buộc phải có để Recharts tô màu bằng thẻ Cell */}
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}

            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor='middle'
                      dominantBaseline='middle'
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className='fill-foreground text-3xl font-bold'
                      >
                        {totalSales.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className='fill-muted-foreground'
                      >
                        Quyển
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  )
}
