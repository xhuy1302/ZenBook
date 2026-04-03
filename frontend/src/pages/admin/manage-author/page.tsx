'use client'

import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { getAllAuthorsApi } from '@/services/author/author.api'
import { useTranslation } from 'react-i18next'
import { columns } from './columns'
import { DataTable } from './data-table'

export default function AuthorPage() {
  const { t } = useTranslation('author')

  // Sử dụng key 'authors' và gọi API của author
  const { data, isLoading } = useFetchData('authors', getAllAuthorsApi)

  return (
    <div className='p-4 space-y-4'>
      <div className='mb-6 px-4 py-3 bg-secondary/50 border rounded-md'>
        <h1 className='text-xl font-bold tracking-tight text-foreground'>
          {t('list.title', 'Quản lý tác giả')}
        </h1>
      </div>

      {isLoading ? <UserTableSkeleton /> : <DataTable columns={columns} data={data || []} />}
    </div>
  )
}
