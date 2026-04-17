'use client'

import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { getAllPromotionsApi } from '@/services/promotion/promotion.api'
import { useTranslation } from 'react-i18next'
import { columns } from './columns'
import { DataTable } from './data-table'

export default function PromotionPage() {
  const { t } = useTranslation('promotion')

  // Gọi API lấy danh sách khuyến mãi
  const { data, isLoading } = useFetchData('promotions', getAllPromotionsApi)

  return (
    <div className='p-4 space-y-4'>
      <div className='mb-6 px-4 py-3 bg-secondary/50 border rounded-md'>
        <h1 className='text-xl font-bold tracking-tight text-foreground'>
          {t('list', 'Quản lý khuyến mãi')}
        </h1>
      </div>

      {isLoading ? <UserTableSkeleton /> : <DataTable columns={columns} data={data || []} />}
    </div>
  )
}
