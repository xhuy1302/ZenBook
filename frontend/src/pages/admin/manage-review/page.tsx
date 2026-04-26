'use client'

import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { getAdminReviewsApi } from '@/services/review/review.api'
import type { PageResponse, ReviewSummaryResponse } from '@/services/review/review.type'
import { useTranslation } from 'react-i18next'
import { columns } from './columns'
import { DataTable } from './data-table'

export default function ReviewPage() {
  const { t } = useTranslation('review')

  // Mặc định lấy size lớn để table client-side xử lý phân trang (tạm thời)
  const { data, isLoading } = useFetchData('reviews', () => getAdminReviewsApi({ size: 1000 }))

  // Ép kiểu an toàn để TypeScript biết chính xác cấu trúc dữ liệu trả về
  const reviewData = data as PageResponse<ReviewSummaryResponse> | undefined

  return (
    <div className='p-4 space-y-4'>
      <div className='mb-6 px-4 py-3 bg-secondary/50 border rounded-md'>
        <h1 className='text-xl font-bold tracking-tight text-foreground'>{t('title')}</h1>
      </div>

      {isLoading ? (
        <UserTableSkeleton />
      ) : (
        // Sử dụng reviewData đã được ép kiểu
        <DataTable columns={columns} data={reviewData?.content || []} />
      )}
    </div>
  )
}
