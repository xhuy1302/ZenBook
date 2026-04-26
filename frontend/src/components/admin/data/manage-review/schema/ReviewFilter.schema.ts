import { z } from 'zod'
import { ReviewStatus } from '@/defines/review.enum'

export const reviewFilterSchema = z
  .object({
    bookId: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
    status: z.nativeEnum(ReviewStatus).optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),

    // 👇 SỬA 2 DÒNG NÀY: Bỏ .optional().default(...) đi
    page: z.number().min(0),
    size: z.number().min(1).max(100)
  })
  .refine(
    (data) => {
      if (data.fromDate && data.toDate) {
        return new Date(data.fromDate) <= new Date(data.toDate)
      }
      return true
    },
    {
      message: 'Ngày bắt đầu không được sau ngày kết thúc',
      path: ['fromDate']
    }
  )

export type ReviewFilterFormValues = z.infer<typeof reviewFilterSchema>
