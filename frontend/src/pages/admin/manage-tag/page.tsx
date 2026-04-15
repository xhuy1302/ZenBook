'use client'

import { useFetchData } from '@/hooks/useFetchData'
import { getAllTagsApi } from '@/services/tag/tag.api' // Đường dẫn API Tag của bạn
import { useTranslation } from 'react-i18next'
import { columns } from './columns'
import { DataTable } from './data-table'
// Nếu bạn có TagTableSkeleton thì import, không thì dùng tạm của User hoặc generic
import { UserTableSkeleton } from '@/components/common/LoadingTable'

export default function TagPage() {
  const { t } = useTranslation('tag')

  // Sử dụng custom hook của bạn, đổi key thành 'tags' và gọi hàm getAllTagsApi
  const { data, isLoading } = useFetchData('tags', getAllTagsApi)

  return (
    <div className='p-4 space-y-4'>
      <div className='mb-6 px-4 py-3 bg-secondary/50 border rounded-md'>
        <h1 className='text-xl font-bold tracking-tight text-foreground'>
          {t('page.title', 'Quản lý nhãn')}
        </h1>
      </div>

      {isLoading ? <UserTableSkeleton /> : <DataTable columns={columns} data={data || []} />}
    </div>
  )
}
