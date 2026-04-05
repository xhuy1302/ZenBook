'use client'

import { UserTableSkeleton } from '@/components/common/LoadingTable' // Bạn có thể dùng chung Skeleton
import { useFetchData } from '@/hooks/useFetchData'
import { getAllSuppliersApi } from '@/services/supplier/supplier.api'
import { useTranslation } from 'react-i18next'
import { columns } from './columns'
import { DataTable } from './data-table' // Copy file data-table.tsx của user sang thư mục supplier và đổi logic search

export default function SupplierPage() {
  const { t } = useTranslation('supplier')

  const { data, isLoading } = useFetchData('suppliers', getAllSuppliersApi)

  return (
    <div className='p-4 space-y-4'>
      <div className='mb-6 px-4 py-3 bg-secondary/50 border rounded-md'>
        <h1 className='text-xl font-bold tracking-tight text-foreground'>
          {t('list', 'Quản lý nhà cung cấp')}
        </h1>
      </div>

      {isLoading ? <UserTableSkeleton /> : <DataTable columns={columns} data={data || []} />}
    </div>
  )
}
