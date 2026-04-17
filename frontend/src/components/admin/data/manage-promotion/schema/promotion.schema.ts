import { z } from 'zod'
import { DiscountType } from '@/defines/promotion.enum'

type TValidator = (key: string) => string

export const getPromotionSchema = (t: TValidator) =>
  z
    .object({
      // Bỏ 'promotion.' ở đầu các key
      name: z.string().trim().min(1, t('validation.nameRequired')),

      description: z.string().optional().nullable().or(z.literal('')),

      discountType: z.nativeEnum(DiscountType, {
        message: t('validation.discountTypeRequired')
      }),

      discountValue: z.preprocess(
        (val) => (val === '' || val === null ? undefined : Number(val)),
        z
          .number({ message: t('validation.discountValueRequired') })
          .min(1, t('validation.discountValueNegative'))
      ),

      startDate: z.string().min(1, t('validation.startDateRequired')),

      endDate: z.string().min(1, t('validation.endDateRequired')),

      bookIds: z.array(z.string()).min(1, t('validation.bookRequired'))
    })
    .refine(
      (data) => {
        if (!data.startDate || !data.endDate) return true
        const start = new Date(data.startDate).getTime()
        const end = new Date(data.endDate).getTime()
        return start < end
      },
      {
        message: t('validation.dateInvalid'),
        path: ['endDate']
      }
    )
    .refine(
      (data) => {
        if (data.discountType === DiscountType.PERCENTAGE && data.discountValue > 100) {
          return false
        }
        return true
      },
      {
        message: t('validation.percentMax'),
        path: ['discountValue']
      }
    )

export type PromotionFormValues = z.infer<ReturnType<typeof getPromotionSchema>>
