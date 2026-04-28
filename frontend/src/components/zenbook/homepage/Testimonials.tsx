'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Star, Quote } from 'lucide-react'
import { getCustomerReviewsApi } from '@/services/review/review.api'
import type { ReviewResponse } from '@/services/review/review.type'

interface TestimonialsProps {
  bookId?: string
}

export default function Testimonials({ bookId }: TestimonialsProps) {
  const { t } = useTranslation('common')

  const [reviews, setReviews] = useState<ReviewResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Không chạy nếu chưa có ID sách
    if (!bookId) return

    const fetchReviews = async () => {
      try {
        setLoading(true)
        setError(false)

        // 👉 FIX: Chỉ truyền bookId, không truyền tham số phân trang nữa
        const res = await getCustomerReviewsApi(bookId)

        // 👉 XỬ LÝ DỮ LIỆU TẠI FRONTEND:
        // 1. Lọc ra các bài >= 4 sao
        // 2. Sắp xếp giảm dần (5 sao ưu tiên lên trước)
        // 3. Cắt lấy đúng 3 bài đầu tiên
        const topReviews = res.content
          .filter((review) => review.rating >= 4)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3)

        setReviews(topReviews)
      } catch (err) {
        console.error('Lỗi khi tải đánh giá khách hàng:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [bookId])

  // Nếu đang tải, có lỗi, không có bookId, hoặc mảng rỗng -> Không render
  if (loading || error || !bookId || reviews.length === 0) return null

  return (
    <section className='max-w-7xl mx-auto px-4 py-6'>
      <div className='text-center mb-6'>
        <h2 className='font-serif text-xl font-bold text-foreground'>{t('testimonials.title')}</h2>
        <p className='text-sm text-muted-foreground mt-1'>{t('testimonials.subtitle')}</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {reviews.map((review, index) => {
          // Lấy tên khách hàng
          const customerName = review.userName || 'Khách hàng'

          // Trích xuất 2 chữ cái đầu làm Avatar
          const avatarText = customerName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()

          return (
            <div
              key={review.id || index}
              className='bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow'
            >
              <Quote className='w-6 h-6 text-brand-green-light fill-brand-green-light' />

              <p className='text-sm text-foreground leading-relaxed flex-1 line-clamp-4'>
                {review.content || 'Đánh giá tuyệt vời!'}
              </p>

              <div className='flex gap-0.5'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < review.rating
                        ? 'text-brand-amber fill-brand-amber'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>

              <div className='flex items-center gap-2.5 pt-1 border-t border-border'>
                <div className='w-8 h-8 rounded-full bg-brand-green flex items-center justify-center shrink-0'>
                  <span className='text-xs font-bold text-primary-foreground'>{avatarText}</span>
                </div>
                <div>
                  <p className='text-sm font-semibold text-foreground'>{customerName}</p>
                  <p className='text-xs text-muted-foreground'>
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString('vi-VN')
                      : 'Thành viên ZenBook'}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
