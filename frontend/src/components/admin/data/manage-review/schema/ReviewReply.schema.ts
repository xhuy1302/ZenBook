import { z } from 'zod'

export const reviewReplySchema = z.object({
  content: z
    .string()
    .min(10, 'Phản hồi phải có ít nhất 10 ký tự')
    .max(2000, 'Phản hồi không được vượt quá 2000 ký tự')
    .trim()
})

export type ReviewReplyFormValues = z.infer<typeof reviewReplySchema>
