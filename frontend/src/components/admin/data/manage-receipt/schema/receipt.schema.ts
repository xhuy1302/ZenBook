import { z } from 'zod'

type TValidator = (key: string, fallback?: string) => string

// Định nghĩa type nhỏ gọn cho books truyền vào để tránh lỗi TypeScript
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
    // ======================================================
    // 👉 VALIDATE CHÉO: Giá nhập <= Giá bán
    // ======================================================
    .refine(
      (data) => {
        // Nếu chưa chọn sách hoặc chưa nhập giá thì bỏ qua (để các validate trên xử lý)
        if (!data.bookId || data.importPrice === undefined) return true

        // Tìm sách đang chọn trong danh sách books
        const selectedBook = books.find((b) => b.id === data.bookId)

        // Nếu tìm thấy và sách có giá bán, so sánh 2 giá
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
        path: ['importPrice'] // Báo lỗi ngay dưới ô nhập Giá
      }
    )

export const getReceiptSchema = (t: TValidator, books: MinimalBook[] = []) =>
  z.object({
    publisherId: z
      .string()
      .trim()
      .min(1, t('receipt.validation.publisherRequired', 'Vui lòng chọn Nhà xuất bản')),
    note: z.string().optional(),
    details: z
      .array(getReceiptDetailSchema(t, books))
      .min(1, t('receipt.validation.detailsRequired', 'Phải có ít nhất 1 sản phẩm'))
  })

export type ReceiptFormValues = z.infer<ReturnType<typeof getReceiptSchema>>
