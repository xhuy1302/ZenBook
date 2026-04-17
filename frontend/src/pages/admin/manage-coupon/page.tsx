'use client'

import { useMemo } from 'react'
import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { getAllCouponsApi } from '@/services/coupon/coupon.api'
import { useTranslation } from 'react-i18next'
import { getColumns } from './columns'
import { DataTable } from './data-table'
import type { CouponResponse } from '@/services/coupon/coupon.type'

export default function CouponPage() {
  const { t } = useTranslation('coupon')

  const { data, isLoading } = useFetchData<CouponResponse[]>(
    'coupons',
    () => getAllCouponsApi() as Promise<CouponResponse[]>
  )

  const dataSource = data || []

  // Truyền t vào hàm getColumns để tạo ra mảng columns được dịch
  const tableColumns = useMemo(() => getColumns(t), [t])

  return (
    <div className='p-4 space-y-4'>
      <div className='mb-6 px-4 py-3 bg-secondary/50 border rounded-md'>
        <h1 className='text-xl font-bold tracking-tight text-foreground'>
          {t('coupon.page.title', 'Quản lý Mã Giảm Giá')}
        </h1>
      </div>

      {isLoading ? <UserTableSkeleton /> : <DataTable columns={tableColumns} data={dataSource} />}
    </div>
  )
}
