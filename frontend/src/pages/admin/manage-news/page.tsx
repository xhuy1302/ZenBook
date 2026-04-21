'use client'

// Giả sử bạn có component skeleton tương tự User, nếu chưa có cứ tạm comment lại nhé
import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { getAllNewsApi } from '@/services/news/news.api'
import { useTranslation } from 'react-i18next'
import { columns } from './columns'
import { DataTable } from './data-table'

export default function NewsPage() {
  const { t } = useTranslation('news')

  const { data, isLoading } = useFetchData('news', getAllNewsApi)

  return (
    <div className='p-4 space-y-4'>
      <div className='mb-6 px-4 py-3 bg-secondary/50 border rounded-md'>
        <h1 className='text-xl font-bold tracking-tight text-foreground'>
          {t('page.title', 'Quản lý Bài viết / Tin tức')}
        </h1>
      </div>

      {isLoading ? <UserTableSkeleton /> : <DataTable columns={columns} data={data || []} />}
    </div>
  )
}
