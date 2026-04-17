import { z } from 'zod'
import { BookFormat, BookStatus } from '@/defines/book.enum'

// Cập nhật type để hỗ trợ fallback message cho hàm t()
type TValidator = (key: string, fallback?: string) => string

export const getBookSchema = (t: TValidator) =>
  z
    .object({
      // Bắt buộc nhập tên
      title: z.string().trim().min(1, t('book.validation.titleRequired')),

      // 👉 CHUẨN HÓA: Giá bán
      salePrice: z.preprocess(
        (val) => (val === '' || val === null ? undefined : Number(val)),
        z
          .number({ message: t('book.validation.priceRequired', 'Vui lòng nhập giá hợp lệ') })
          .min(1, t('book.validation.priceNegative', 'Giá phải lớn hơn 0'))
      ),

      // 👉 CHUẨN HÓA: Giá gốc
      originalPrice: z.preprocess(
        (val) => (val === '' || val === null ? undefined : Number(val)),
        z
          .number({ message: t('book.validation.priceRequired', 'Vui lòng nhập giá hợp lệ') })
          .min(1, t('book.validation.priceNegative', 'Giá phải lớn hơn 0'))
      ),

      // Số lượng tồn kho
      stockQuantity: z.preprocess(
        (val) => (val === '' || val === null ? undefined : Number(val)),
        z
          .number({ message: t('book.validation.stockInvalid') })
          .min(0, t('book.validation.stockNegative'))
      ),

      // Các thông số kỹ thuật (Optional)
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
          // 👉 Không cho phép nhập năm xuất bản ở tương lai
          .max(
            new Date().getFullYear(),
            t('book.validation.yearFuture', 'Năm XB không lớn hơn năm hiện tại')
          )
          .optional()
      ),

      weight: z.preprocess(
        (val) => (val === '' || val === null ? undefined : Number(val)),
        z
          .number({ message: t('book.validation.priceInvalid') })
          .min(1, t('book.validation.weightInvalid'))
          .optional()
      ),

      status: z.nativeEnum(BookStatus),
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
    // ======================================================
    // 👉 VALIDATE CHÉO (CROSS-VALIDATION) CHO GIÁ
    // ======================================================
    .refine(
      (data) => {
        // Chỉ kiểm tra khi cả 2 giá trị đều đã được nhập thành công (là số)
        if (data.salePrice && data.originalPrice) {
          return data.salePrice <= data.originalPrice
        }
        return true
      },
      {
        // Nếu logic trên trả về false, lỗi này sẽ xuất hiện dưới ô Giá bán
        message: t('book.validation.salePriceTooHigh', 'Giá bán KHÔNG ĐƯỢC lớn hơn Giá gốc!'),
        path: ['salePrice']
      }
    )

export type BookFormValues = z.infer<ReturnType<typeof getBookSchema>>
