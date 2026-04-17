import { z } from 'zod'
import i18n from '@/i18n/i18n'
import { PublisherStatus } from '@/defines/publisher.enum'

export const createPublisherSchema = z.object({
  name: z.string().min(1, i18n.t('publisher:errors.name.required')),
  contactName: z.string().nullable().optional().or(z.literal('')),
  taxCode: z.string().nullable().optional().or(z.literal('')),
  email: z
    .string()
    .email(i18n.t('publisher:errors.email.invalid'))
    .nullable()
    .optional()
    .or(z.literal('')),
  phone: z.string().nullable().optional().or(z.literal('')),
  address: z.string().nullable().optional().or(z.literal('')),
  website: z.string().nullable().optional().or(z.literal('')),
  description: z.string().nullable().optional().or(z.literal(''))
})

export const editPublisherSchema = createPublisherSchema.extend({
  status: z.nativeEnum(PublisherStatus)
})

export type CreatePublisherFormValues = z.infer<typeof createPublisherSchema>
export type EditPublisherFormValues = z.infer<typeof editPublisherSchema>
