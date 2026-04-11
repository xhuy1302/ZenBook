'use client'

import { useMemo } from 'react' // Import thêm useMemo
import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { getAllBooksApi } from '@/services/book/book.api'
import { useTranslation } from 'react-i18next'
import { getColumns } from './columns' // Sửa thành import getColumns
import { DataTable } from './data-table'
import type { BookResponse } from '@/services/book/book.type'

export default function BookPage() {
  const { t } = useTranslation('product')

  const { data, isLoading } = useFetchData<BookResponse[]>(
    'books',
    () => getAllBooksApi() as Promise<BookResponse[]>
  )

  const dataSource = data || []

  // Truyền t vào hàm getColumns để tạo ra mảng columns được dịch
  const tableColumns = useMemo(() => getColumns(t), [t])

  return (
    <div className='p-4 space-y-4'>
      <div className='mb-6 px-4 py-3 bg-secondary/50 border rounded-md'>
        <h1 className='text-xl font-bold tracking-tight text-foreground'>{t('book.page.title')}</h1>
      </div>

      {isLoading ? <UserTableSkeleton /> : <DataTable columns={tableColumns} data={dataSource} />}
    </div>
  )
}
