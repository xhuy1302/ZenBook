import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getCustomerReviewsApi,
  createCustomerReviewApi,
  updateCustomerReviewApi,
  deleteCustomerReviewApi,
  toggleHelpfulVoteApi,
  uploadReviewMediaApi,
  getReviewStatsApi,
  checkUserReviewedApi
} from '@/services/review/review.api'

import type {
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewCustomerFilter
} from '@/services/review/review.type'

// ==========================================
// Query Keys
// ==========================================
export const reviewKeys = {
  all: ['reviews'] as const,

  lists: () => [...reviewKeys.all, 'list'] as const,

  byBook: (bookId: string, params?: ReviewCustomerFilter) =>
    [...reviewKeys.lists(), bookId, params] as const,

  stats: (bookId: string) => [...reviewKeys.all, 'stats', bookId] as const,

  me: (bookId: string) => [...reviewKeys.all, 'me', bookId] as const
}

// ==========================================
// Queries
// ==========================================

// Danh sách review theo sách
export function useBookReviews(bookId: string, params?: ReviewCustomerFilter) {
  return useQuery({
    queryKey: reviewKeys.byBook(bookId, params),
    queryFn: () => getCustomerReviewsApi(bookId, params),
    enabled: !!bookId
  })
}

// Stats review (average + breakdown)
export function useReviewStats(bookId: string) {
  return useQuery({
    queryKey: reviewKeys.stats(bookId),
    queryFn: () => getReviewStatsApi(bookId),
    enabled: !!bookId
  })
}

// User đã review chưa
export function useCheckReviewed(bookId: string) {
  return useQuery({
    queryKey: reviewKeys.me(bookId),
    queryFn: () => checkUserReviewedApi(bookId),
    enabled: !!bookId
  })
}

// ==========================================
// Mutations
// ==========================================

// Tạo review
export function useCreateReview(bookId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateReviewRequest) => createCustomerReviewApi(bookId, payload),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: reviewKeys.byBook(bookId)
      })

      qc.invalidateQueries({
        queryKey: reviewKeys.stats(bookId)
      })

      qc.invalidateQueries({
        queryKey: reviewKeys.me(bookId)
      })
    }
  })
}

// Update review
export function useUpdateReview(bookId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: UpdateReviewRequest }) =>
      updateCustomerReviewApi(reviewId, payload),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: reviewKeys.byBook(bookId)
      })

      qc.invalidateQueries({
        queryKey: reviewKeys.stats(bookId)
      })
    }
  })
}

// Delete review
export function useDeleteReview(bookId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (reviewId: string) => deleteCustomerReviewApi(reviewId),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: reviewKeys.byBook(bookId)
      })

      qc.invalidateQueries({
        queryKey: reviewKeys.stats(bookId)
      })

      qc.invalidateQueries({
        queryKey: reviewKeys.me(bookId)
      })
    }
  })
}

// Helpful vote
export function useToggleHelpful(bookId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (reviewId: string) => toggleHelpfulVoteApi(reviewId),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: reviewKeys.byBook(bookId)
      })
    }
  })
}

// Upload media
export function useUploadReviewMedia() {
  return useMutation({
    mutationFn: (file: File) => uploadReviewMediaApi(file)
  })
}
