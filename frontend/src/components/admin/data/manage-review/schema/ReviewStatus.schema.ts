import { z } from 'zod'
import { ReviewStatus } from '@/defines/review.enum'

export const reviewStatusSchema = z.object({
  status: z.nativeEnum(ReviewStatus, {
    message: 'Vui lòng chọn trạng thái'
  })
})

export type ReviewStatusFormValues = z.infer<typeof reviewStatusSchema>
