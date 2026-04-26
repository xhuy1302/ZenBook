'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  User,
  BookOpen,
  Star,
  ShoppingBag,
  ThumbsUp,
  Images,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { getReviewDetailApi } from '@/services/review/review.api'
import { ReviewStatusBadge } from '../ReviewStatusBadge'
import { ReviewReplySection } from './Reviewreplysection'

interface ReviewDetailDialogProps {
  reviewId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange?: () => void
}

function StarRating({ value }: { value: number }) {
  return (
    <div className='flex items-center gap-0.5'>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < value ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`}
        />
      ))}
      <span className='ml-1.5 text-sm font-semibold text-slate-700'>{value}/5</span>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className='space-y-5 p-1'>
      {/* User info skeleton */}
      <div className='flex items-center gap-3'>
        <Skeleton className='h-12 w-12 rounded-full' />
        <div className='space-y-2'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-3 w-48' />
        </div>
      </div>
      <Separator />
      {/* Content skeleton */}
      <div className='space-y-2'>
        <Skeleton className='h-5 w-48' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-3/4' />
      </div>
      <Separator />
      {/* Images skeleton */}
      <div className='flex gap-2'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-20 w-20 rounded-lg' />
        ))}
      </div>
    </div>
  )
}

export function ReviewDetailDialog({
  reviewId,
  open,
  onOpenChange,
  onStatusChange
}: ReviewDetailDialogProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const { data: review, isLoading } = useQuery({
    queryKey: ['admin-review-detail', reviewId],
    queryFn: () => getReviewDetailApi(reviewId!),
    enabled: !!reviewId && open,
    staleTime: 30_000
  })

  const images = review?.images ?? []
  const hasImages = images.length > 0

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side='right'
          className='w-full sm:max-w-2xl p-0 overflow-hidden flex flex-col'
        >
          {/* Header */}
          <SheetHeader className='px-6 py-4 border-b border-slate-100 shrink-0'>
            <div className='flex items-center justify-between'>
              <div>
                <SheetTitle className='text-base font-semibold text-slate-800'>
                  Chi tiết đánh giá
                </SheetTitle>
                {review && (
                  <SheetDescription className='text-xs text-slate-400 mt-0.5'>
                    ID: {review.id}
                  </SheetDescription>
                )}
              </div>
              {review && <ReviewStatusBadge status={review.status} />}
            </div>
          </SheetHeader>

          {/* Scrollable Content */}
          <div className='flex-1 overflow-y-auto'>
            {isLoading ? (
              <div className='p-6'>
                <DetailSkeleton />
              </div>
            ) : review ? (
              <div className='divide-y divide-slate-100'>
                {/* ── Section: Người dùng ── */}
                <section className='px-6 py-4 space-y-3'>
                  <h3 className='text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5'>
                    <User className='h-3.5 w-3.5' />
                    Thông tin người mua
                  </h3>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-11 w-11 ring-2 ring-white shadow-sm'>
                      <AvatarImage src={review.user.avatar} alt={review.user.fullName} />
                      <AvatarFallback className='text-sm font-semibold bg-blue-100 text-blue-600'>
                        {review.user.fullName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='text-sm font-semibold text-slate-800'>{review.user.fullName}</p>
                      <p className='text-xs text-slate-500'>{review.user.email}</p>
                    </div>
                    {review.isVerifiedPurchase && (
                      <Badge className='ml-auto text-[11px] gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 border'>
                        <ShoppingBag className='h-3 w-3' />
                        Đã mua hàng
                      </Badge>
                    )}
                  </div>
                </section>

                {/* ── Section: Sách ── */}
                <section className='px-6 py-4 space-y-3'>
                  <h3 className='text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5'>
                    <BookOpen className='h-3.5 w-3.5' />
                    Sách được đánh giá
                  </h3>
                  <div className='flex items-center gap-3'>
                    <img
                      src={review.book.thumbnail}
                      alt={review.book.title}
                      className='h-14 w-10 object-cover rounded shadow-sm shrink-0'
                    />
                    <div>
                      <p className='text-sm font-semibold text-slate-800 line-clamp-2'>
                        {review.book.title}
                      </p>
                      <p className='text-xs text-slate-400 mt-0.5'>/{review.book.slug}</p>
                    </div>
                  </div>
                </section>

                {/* ── Section: Nội dung đánh giá ── */}
                <section className='px-6 py-4 space-y-3'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5'>
                      <Star className='h-3.5 w-3.5' />
                      Nội dung đánh giá
                    </h3>
                    <div className='flex items-center gap-3 text-xs text-slate-400'>
                      <span className='flex items-center gap-1'>
                        <ThumbsUp className='h-3 w-3' />
                        {review.helpfulVotesCount} hữu ích
                      </span>
                      <span>
                        {format(new Date(review.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </span>
                    </div>
                  </div>
                  <StarRating value={review.rating} />
                  {review.title && (
                    <h4 className='text-sm font-semibold text-slate-800'>{review.title}</h4>
                  )}
                  <p className='text-sm text-slate-600 leading-relaxed whitespace-pre-wrap'>
                    {review.content}
                  </p>
                </section>

                {/* ── Section: Ảnh đính kèm ── */}
                {hasImages && (
                  <section className='px-6 py-4 space-y-3'>
                    <h3 className='text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5'>
                      <Images className='h-3.5 w-3.5' />
                      Ảnh đính kèm ({images.length})
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {images.map((img, idx) => (
                        <button
                          key={img.id}
                          type='button'
                          onClick={() => setLightboxIndex(idx)}
                          className='h-20 w-20 rounded-lg overflow-hidden border border-slate-200 hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400'
                        >
                          <img
                            src={img.imageUrl}
                            alt={`Ảnh ${idx + 1}`}
                            className='h-full w-full object-cover'
                          />
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* ── Section: Phản hồi của Admin ── */}
                <section className='px-6 py-4 space-y-3'>
                  <h3 className='text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5'>
                    <MessageSquare className='h-3.5 w-3.5' />
                    Phản hồi quản trị
                  </h3>
                  <ReviewReplySection
                    reviewId={review.id}
                    existingReply={review.reply ?? null}
                    onSuccess={onStatusChange}
                  />
                </section>
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      {/* Lightbox */}
      {lightboxIndex !== null && hasImages && (
        <div
          className='fixed inset-0 z-[200] bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm'
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type='button'
            onClick={() => setLightboxIndex(null)}
            className='absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors'
          >
            <X className='h-5 w-5' />
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((prev) => (prev! - 1 + images.length) % images.length)
              }}
              className='absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors'
            >
              <ChevronLeft className='h-6 w-6' />
            </button>
          )}

          <img
            src={images[lightboxIndex].imageUrl}
            alt={`Ảnh ${lightboxIndex + 1}`}
            className='max-h-[85vh] max-w-[85vw] rounded-xl shadow-2xl object-contain'
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {images.length > 1 && (
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((prev) => (prev! + 1) % images.length)
              }}
              className='absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors'
            >
              <ChevronRight className='h-6 w-6' />
            </button>
          )}

          {/* Counter */}
          <div className='absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs'>
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}
