import { z } from 'zod'
import i18n from '@/i18n/i18n'
import { SupplierStatus } from '@/defines/supplier.enum'

export const createSupplierSchema = z.object({
  name: z.string().min(1, i18n.t('supplier:errors.name.required')),
  contactName: z.string().nullable().optional().or(z.literal('')),
  taxCode: z.string().nullable().optional().or(z.literal('')),
  email: z
    .string()
    .email(i18n.t('supplier:errors.email.invalid'))
    .nullable()
    .optional()
    .or(z.literal('')),
  phone: z.string().nullable().optional().or(z.literal('')),
  address: z.string().nullable().optional().or(z.literal('')),
  description: z.string().nullable().optional().or(z.literal(''))
})

export const editSupplierSchema = createSupplierSchema.extend({
  status: z.nativeEnum(SupplierStatus)
})

export type CreateSupplierFormValues = z.infer<typeof createSupplierSchema>
export type EditSupplierFormValues = z.infer<typeof editSupplierSchema>
