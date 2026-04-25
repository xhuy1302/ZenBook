import { z } from 'zod'

type TValidator = (key: string, fallback?: string) => string
type MinimalBook = { id: string; salePrice?: number }

export const getReceiptDetailSchema = (t: TValidator, books: MinimalBook[] = []) =>
  z
    .object({
      bookId: z.string().trim().min(1, t('receipt.validation.bookRequired', 'Vui lòng chọn sách')),

      quantity: z.preprocess(
        (val) => (val === '' || val === null ? undefined : Number(val)),
        z
          .number({ message: t('receipt.validation.numberInvalid', 'Vui lòng nhập số hợp lệ') })
          .min(1, t('receipt.validation.quantityMin', 'Số lượng phải từ 1 trở lên'))
      ),

      importPrice: z.preprocess(
        (val) => (val === '' || val === null ? undefined : Number(val)),
        z
          .number({ message: t('receipt.validation.numberInvalid', 'Vui lòng nhập số hợp lệ') })
          .min(0, t('receipt.validation.priceNegative', 'Giá nhập không được âm'))
      )
    })
    .refine(
      (data) => {
        if (!data.bookId || data.importPrice === undefined) return true
        const selectedBook = books.find((b) => b.id === data.bookId)
        if (selectedBook && selectedBook.salePrice) {
          return data.importPrice <= selectedBook.salePrice
        }
        return true
      },
      {
        message: t(
          'receipt.validation.importPriceTooHigh',
          'Giá nhập không được lớn hơn Giá bán hiện tại!'
        ),
        path: ['importPrice']
      }
    )

export const getReceiptSchema = (t: TValidator, books: MinimalBook[] = []) =>
  z.object({
    // 👉 Đã sửa thành supplierId
    supplierId: z
      .string()
      .trim()
      .min(1, t('receipt.validation.supplierRequired', 'Vui lòng chọn Nhà cung cấp')),
    note: z.string().optional(),
    details: z
      .array(getReceiptDetailSchema(t, books))
      .min(1, t('receipt.validation.detailsRequired', 'Phải có ít nhất 1 sản phẩm'))
  })

export type ReceiptFormValues = z.infer<ReturnType<typeof getReceiptSchema>>
