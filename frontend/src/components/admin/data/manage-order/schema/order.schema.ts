// components/admin/data/manage-order/schema/order.schema.ts
import { z } from 'zod'
import i18n from '@/i18n/i18n'

const orderItemSchema = z.object({
  bookId: z.string().min(1, i18n.t('order:validation.bookRequired')),
  quantity: z.number().int().positive(i18n.t('order:validation.quantityPositive'))
})

export const orderFormSchema = z.object({
  customerName: z.string().min(1, i18n.t('order:validation.customerNameRequired')),
  customerPhone: z.string().regex(/^[0-9]{10,11}$/, i18n.t('order:validation.phoneInvalid')),
  customerEmail: z.string().email(i18n.t('order:validation.emailInvalid')),
  shippingAddress: z.string().min(5, i18n.t('order:validation.addressRequired')),
  paymentMethod: z.string().min(1, i18n.t('order:validation.paymentMethodRequired')),
  note: z.string().optional(),
  items: z.array(orderItemSchema).min(1, i18n.t('order:validation.itemsRequired'))
})

export type OrderFormValues = z.infer<typeof orderFormSchema>
