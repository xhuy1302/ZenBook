import { z } from 'zod'

type TValidator = (key: string) => string

export const getReceiptDetailSchema = (t: TValidator) =>
  z.object({
    // Bắt buộc chọn sách
    bookId: z.string().trim().min(1, t('receipt.validation.bookRequired')),

    // Bắt buộc nhập số lượng, ít nhất là 1
    quantity: z.preprocess(
      (val) => (val === '' || val === null ? undefined : Number(val)),
      z
        .number({ message: t('receipt.validation.numberInvalid') })
        .min(1, t('receipt.validation.quantityMin'))
    ),

    // Giá nhập không được âm (có thể bằng 0 nếu được tặng/khuyến mãi)
    importPrice: z.preprocess(
      (val) => (val === '' || val === null ? undefined : Number(val)),
      z
        .number({ message: t('receipt.validation.numberInvalid') })
        .min(0, t('receipt.validation.priceNegative'))
    )
  })

export const getReceiptSchema = (t: TValidator) =>
  z.object({
    // Bắt buộc chọn nhà cung cấp
    supplierId: z.string().trim().min(1, t('receipt.validation.supplierRequired')),

    note: z.string().optional(),

    // Mảng chi tiết, bắt buộc phải có ít nhất 1 dòng
    details: z.array(getReceiptDetailSchema(t)).min(1, t('receipt.validation.detailsRequired'))
  })

export type ReceiptFormValues = z.infer<ReturnType<typeof getReceiptSchema>>
