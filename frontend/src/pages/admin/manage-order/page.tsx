'use client'

import { useQuery } from '@tanstack/react-query'
import { orderService } from '@/services/order/order.api'
import { columns } from './columns'
import { DataTable } from './data-table'
import { useTranslation } from 'react-i18next'
import { UserTableSkeleton } from '@/components/common/LoadingTable'
import type { Page, Order } from '@/services/order/order.type'

// Tạo giá trị mặc định tránh lỗi undefined
const emptyPage: Page<Order> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 0
}

export default function OrdersPage() {
  const { t } = useTranslation('order')

  const { data = emptyPage, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      // Truyền tham số page và size (tạm thời lấy 50 đơn trang đầu)
      const result = await orderService.getAll({ page: 0, size: 50 })
      return result || emptyPage
    }
  })

  // Trích xuất mảng đơn hàng từ trường content của Spring Boot
  const orders = data.content || []

  return (
    <div className='p-4 space-y-4'>
      <div className='mb-6 px-4 py-3 bg-secondary/50 border rounded-md'>
        <h1 className='text-xl font-bold tracking-tight text-foreground'>
          {t('title', 'Quản lý đơn hàng')}
        </h1>
      </div>

      {isLoading ? <UserTableSkeleton /> : <DataTable columns={columns} data={orders} />}
    </div>
  )
}
