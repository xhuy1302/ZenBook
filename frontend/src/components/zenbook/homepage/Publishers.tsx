'use client'

import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { getAllPublishersApi } from '@/services/publisher/publisher.api'

// Định nghĩa interface để code không bị lỗi gạch đỏ
interface PublisherResponse {
  id: string
  name: string
}

export default function Publishers() {
  const { t } = useTranslation('common')

  // 1. Gọi dữ liệu từ Database bằng React Query
  const { data: publishers, isLoading } = useQuery({
    queryKey: ['publishers', 'public'],
    queryFn: getAllPublishersApi,
    staleTime: 60 * 60 * 1000 // Nhà xuất bản ít thay đổi nên cache 1 tiếng cho nhẹ máy
  })

  return (
    <section className='max-w-7xl mx-auto px-4 py-6'>
      <div className='text-center mb-5'>
        <h2 className='font-serif text-xl font-bold text-foreground'>{t('publishers.title')}</h2>
        <p className='text-sm text-muted-foreground mt-1'>{t('publishers.subtitle')}</p>
      </div>

      <div className='bg-card border border-border rounded-xl px-6 py-5 min-h-[100px] flex items-center justify-center'>
        {/* 2. Xử lý trạng thái Loading */}
        {isLoading ? (
          <Loader2 className='w-6 h-6 animate-spin text-brand-green' />
        ) : (
          <div className='flex flex-wrap items-center justify-center gap-x-8 gap-y-4'>
            {publishers?.map((pub: PublisherResponse) => (
              <div
                key={pub.id}
                className='flex items-center justify-center px-4 py-2 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer group'
              >
                <span className='text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors text-center'>
                  {pub.name}
                </span>
              </div>
            ))}

            {/* Hiển thị nếu không có dữ liệu */}
            {(!publishers || publishers.length === 0) && (
              <span className='text-xs text-muted-foreground italic'>
                {t('publishers.noData', 'Đang cập nhật danh sách đối tác...')}
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
