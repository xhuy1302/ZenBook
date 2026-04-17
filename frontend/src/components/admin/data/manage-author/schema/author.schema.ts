import { z } from 'zod'
import { AuthorStatus } from '@/defines/author.enum'

export const editAuthorSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên tác giả phải có ít nhất 2 ký tự')
    .max(100, 'Tên tác giả không được quá 100 ký tự'),

  // ✅ Thêm Quốc tịch
  nationality: z
    .string()
    .min(1, 'Vui lòng nhập quốc tịch')
    .max(50, 'Quốc tịch không được quá 50 ký tự'),

  // ✅ Thêm Ngày sinh (Dạng chuỗi từ input date: YYYY-MM-DD)
  dateOfBirth: z.string().min(1, 'Vui lòng chọn ngày sinh'),

  biography: z.string().optional().nullable(),

  avatar: z.any().optional().nullable(),

  status: z.nativeEnum(AuthorStatus)
})

export type EditAuthorFormValues = z.infer<typeof editAuthorSchema>
