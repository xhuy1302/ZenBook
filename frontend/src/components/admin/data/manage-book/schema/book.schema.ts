import { z } from 'zod'
import { BookFormat, BookStatus } from '@/defines/book.enum'

type TValidator = (key: string) => string

export const getBookSchema = (t: TValidator) =>
  z.object({
    // Bắt buộc nhập tên
    title: z.string().trim().min(1, t('book.validation.titleRequired')),

    // Bắt buộc nhập giá và phải > 0
    salePrice: z.preprocess(
      (val) => (val === '' || val === null ? undefined : Number(val)),
      z
        .number({ message: t('book.validation.priceInvalid') })
        .min(1, t('book.validation.priceNegative'))
    ),

    originalPrice: z.preprocess(
      (val) => (val === '' || val === null ? undefined : Number(val)),
      z
        .number({ message: t('book.validation.priceInvalid') })
        .min(1, t('book.validation.priceNegative'))
    ),
    stockQuantity: z
      .number({ message: t('book.validation.stockInvalid') })
      .min(0, t('book.validation.stockNegative'))
      .or(z.nan().transform(() => 0)),

    // Các thông số kỹ thuật nếu ông muốn BẮT BUỘC thì bỏ .optional() đi
    pageCount: z.preprocess(
      (val) => (val === '' || val === null ? undefined : Number(val)),
      z
        .number({ message: t('book.validation.priceInvalid') })
        .min(1, t('book.validation.pageCountInvalid'))
        .optional()
    ),

    publicationYear: z.preprocess(
      (val) => (val === '' || val === null ? undefined : Number(val)),
      z
        .number({ message: t('book.validation.priceInvalid') })
        .min(1000, t('book.validation.publicationYearInvalid'))
        .optional()
    ),

    weight: z.preprocess(
      (val) => (val === '' || val === null ? undefined : Number(val)),
      z
        .number({ message: t('book.validation.priceInvalid') })
        .min(1, t('book.validation.weightInvalid'))
        .optional()
    ),

    // Giữ nguyên các trường khác
    status: z.nativeEnum(BookStatus),

    // 👉 THÊM MỚI: ID Nhà xuất bản
    publisherId: z.string().optional(),

    categoryIds: z.array(z.string()).default([]),
    authorIds: z.array(z.string()).default([]),
    tagIds: z.array(z.string()).default([]),
    isbn: z.string().optional(),
    description: z.string().optional(),
    format: z.nativeEnum(BookFormat).optional().nullable(),
    dimensions: z.string().optional(),
    language: z.string().optional().default('Tiếng Việt'),
    thumbnailFile: z.any().optional(),
    galleryFiles: z.any().optional()
  })

export type BookFormValues = z.infer<ReturnType<typeof getBookSchema>>
