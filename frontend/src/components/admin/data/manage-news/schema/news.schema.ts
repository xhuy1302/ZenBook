import { z } from 'zod'
import { NewsStatus } from '@/defines/news.enum'

export const getNewsSchema = (t: (key: string) => string, isEdit: boolean = false) => {
  return z
    .object({
      title: z
        .string()
        .min(5, { message: t('news:validation.titleMin') })
        .max(255, { message: t('news:validation.titleMax') }),
      summary: z
        .string()
        .max(500, { message: t('news:validation.summaryMax') })
        .optional()
        .nullable(),
      content: z.string().min(1, { message: t('news:validation.contentRequired') }),
      status: z.nativeEnum(NewsStatus),
      categoryId: z.string().optional().nullable(),
      tagIds: z.array(z.string()).optional(),
      bookIds: z.array(z.string()).optional(),
      metaTitle: z
        .string()
        .max(100, { message: t('news:validation.metaTitleMax') })
        .optional()
        .nullable(),
      metaDescription: z
        .string()
        .max(255, { message: t('news:validation.metaDescMax') })
        .optional()
        .nullable(),
      // ✅ Khi edit: thumbnail không bắt buộc (đã có ảnh cũ)
      // Khi create: thumbnail bắt buộc phải chọn
      thumbnailFile: isEdit
        ? z.instanceof(File).nullable().optional()
        : z.instanceof(File, { message: t('news:validation.thumbnailRequired') }).nullable()
    })
    .refine((data) => isEdit || data.thumbnailFile !== null, {
      message: t('news:validation.thumbnailRequired'),
      path: ['thumbnailFile']
    })
}

export type NewsFormValues = z.infer<ReturnType<typeof getNewsSchema>>
