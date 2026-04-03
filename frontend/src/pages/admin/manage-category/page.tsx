'use client' // Đừng quên directive này nếu dùng trong App Router của Next.js

import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { getAllCategoriesApi } from '@/services/category/category.api'
import { useTranslation } from 'react-i18next'
import { columns } from './columns'
import { DataTable } from './data-table'

export default function CategoryPage() {
  const { t } = useTranslation('category')

  const { data, isLoading } = useFetchData('categories', getAllCategoriesApi)

  return (
    <div className='p-4 space-y-4'>
      <div className='mb-6 px-4 py-3 bg-secondary/50 border rounded-md'>
        <h1 className='text-xl font-bold tracking-tight text-foreground'>
          {t('category:list', 'Quản lý danh mục')}
        </h1>
      </div>

      {isLoading ? <UserTableSkeleton /> : <DataTable columns={columns} data={data || []} />}
    </div>
  )
}
