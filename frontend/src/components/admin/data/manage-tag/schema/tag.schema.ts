import { z } from 'zod'
import i18n from '@/i18n/i18n'

export const tagSchema = z.object({
  name: z.string().min(2, i18n.t('tag:form.name_min', 'Tên nhãn phải có ít nhất 2 ký tự')),
  description: z.string().nullable().optional().or(z.literal('')),
  // Color có thể validate theo chuẩn HEX (#RRGGBB)
  color: z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i, i18n.t('tag:form.color_invalid', 'Mã màu không hợp lệ'))
    .nullable()
    .optional()
    .or(z.literal(''))
})

export type TagFormValues = z.infer<typeof tagSchema>
