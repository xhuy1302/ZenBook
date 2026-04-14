'use client'

import { useState, useMemo } from 'react' // Thêm useState
import { useQuery } from '@tanstack/react-query'
import { orderService } from '@/services/order/order.api'
import { columns } from './columns'
import { DataTable } from './data-table'
import { useTranslation } from 'react-i18next'
import { UserTableSkeleton } from '@/components/common/LoadingTable'
import type { Page, Order } from '@/services/order/order.type'
import { format } from 'date-fns' // Import format ngày
import type { DateRange } from 'react-day-picker' // Import type

const emptyPage: Page<Order> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 0
}

export default function OrdersPage() {
  const { t } = useTranslation('order')

  // 1. Quản lý state khoảng ngày
  const [date, setDate] = useState<DateRange | undefined>()

  // 2. Chuyển đổi ngày sang string yyyy-MM-dd để gửi cho Backend
  const fromStr = date?.from ? format(date.from, 'yyyy-MM-dd') : ''
  const toStr = date?.to ? format(date.to, 'yyyy-MM-dd') : ''

  // 3. Cập nhật QueryKey: Thêm filter vào mảng để tự động refetch khi ngày thay đổi
  const { data = emptyPage, isLoading } = useQuery({
    queryKey: ['orders', 'list', { from: fromStr, to: toStr }],
    queryFn: async () => {
      const result = await orderService.getAll({
        page: 0,
        size: 50,
        startDate: fromStr, // Truyền ngày bắt đầu
        endDate: toStr // Truyền ngày kết thúc
      })
      return result || emptyPage
    }
  })

  const orders = data.content || []
  const tableColumns = useMemo(() => columns, [])

  return (
    <div className='p-4 space-y-4'>
      <div className='mb-6 px-4 py-3 bg-secondary/50 border rounded-md'>
        <h1 className='text-xl font-bold tracking-tight text-foreground'>
          {t('title', 'Quản lý đơn hàng')}
        </h1>
      </div>

      {isLoading ? (
        <UserTableSkeleton />
      ) : (
        <DataTable
          columns={tableColumns}
          data={orders}
          // 👉 4. Truyền state ngày xuống bảng để hiển thị Picker
          dateRange={date}
          setDateRange={setDate}
        />
      )}
    </div>
  )
}
