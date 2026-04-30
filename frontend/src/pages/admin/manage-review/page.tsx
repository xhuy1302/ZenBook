'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { getAdminReviewsApi } from '@/services/review/review.api'
import type { PageResponse, ReviewSummaryResponse } from '@/services/review/review.type'
import { useTranslation } from 'react-i18next'
import { createColumns } from './columns'
import { DataTable } from './data-table'
import { ReviewDetailDialog } from '@/components/admin/data/manage-review/dialog/ReviewDetailDialog'

const STORAGE_KEY = 'admin_viewed_reviews'

function loadViewedReviews(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const ids: string[] = JSON.parse(stored)
      return new Set(ids)
    }
  } catch {}
  return new Set()
}

function saveViewedReviews(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)))
  } catch (e) {}
}

export default function ReviewPage() {
  const { t } = useTranslation('review')
  const queryClient = useQueryClient()

  const { data, isLoading } = useFetchData('admin-reviews', () =>
    getAdminReviewsApi({ size: 1000 })
  )
  const reviewData = data as PageResponse<ReviewSummaryResponse> | undefined

  // --- Trạng thái đã xem (lưu localStorage) ---
  const [viewedReviews, setViewedReviews] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') return loadViewedReviews()
    return new Set()
  })
  useEffect(() => {
    saveViewedReviews(viewedReviews)
  }, [viewedReviews])

  // --- Trạng thái dialog chi tiết (điều khiển từ page) ---
  const [detailReviewId, setDetailReviewId] = useState<string | null>(null)

  const handleViewDetail = useCallback((reviewId: string) => {
    // Đánh dấu đã xem
    setViewedReviews((prev) => {
      if (prev.has(reviewId)) return prev
      const next = new Set(prev)
      next.add(reviewId)
      return next
    })
    // Mở dialog chi tiết
    setDetailReviewId(reviewId)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setDetailReviewId(null)
  }, [])

  // Khi thay đổi trạng thái từ dialog (phê duyệt/ẩn/từ chối) => refresh danh sách
  const handleStatusChange = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
    handleCloseDetail()
  }

  // Tạo columns với callback xem chi tiết
  const columns = createColumns(viewedReviews, handleViewDetail)

  return (
    <div className='p-4 space-y-4'>
      <div className='mb-6 px-4 py-3 bg-secondary/50 border rounded-md'>
        <h1 className='text-xl font-bold tracking-tight text-foreground'>{t('title')}</h1>
      </div>

      {isLoading ? (
        <UserTableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={reviewData?.content || []}
          viewedReviews={viewedReviews}
        />
      )}

      {/* Dialog chi tiết chỉ render một lần, luôn sẵn sàng */}
      <ReviewDetailDialog
        reviewId={detailReviewId}
        open={detailReviewId !== null}
        onOpenChange={(open) => {
          if (!open) handleCloseDetail()
        }}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
