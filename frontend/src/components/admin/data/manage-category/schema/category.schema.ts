import { z } from 'zod'
import { CategoryStatus } from '@/defines/category.enum'

export const categorySchema = z.object({
  // Backend: @NotBlank, @Size(min = 2, max = 255)
  categoryName: z
    .string()
    .trim()
    .min(2, { message: 'Tên danh mục phải có ít nhất 2 ký tự' })
    .max(255, { message: 'Tên danh mục không quá 255 ký tự' }),

  // Backend: @Column(unique = true), cho phép string rỗng nếu để Backend tự generate slug
  slug: z.string().trim().default(''),

  // Backend: TEXT, nullable. Chấp nhận string rỗng hoặc null
  categoryDesc: z.string().trim().nullable().default(''),

  // Backend: VARCHAR(36), nullable. Lưu ý: parentId không được trùng với id của chính nó (check ở Service)
  parentId: z.string().nullable().default(null),

  // thumbnail có thể là URL (string) hoặc File khi upload.
  // Dùng .union để linh hoạt hơn giữa hiển thị và submit.
  thumbnailUrl: z.union([z.string(), z.any()]).nullable().default(''),

  displayOrder: z
    .number({
      error: 'Thứ tự phải là một số'
    })
    .min(0, 'Thứ tự không được nhỏ hơn 0'),

  // Backend: Boolean, nullable = false
  isFeatured: z.boolean().default(false),

  // Backend: Enum CategoryStatus (ACTIVE/INACTIVE)
  status: z.nativeEnum(CategoryStatus).default(CategoryStatus.ACTIVE)
})

export type CategoryFormValues = z.infer<typeof categorySchema>
