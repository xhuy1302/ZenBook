import type { ReceiptStatus } from '@/defines/receipt.enum'

// Khớp với ReceiptDetailRequest của Backend
export interface ReceiptDetailItem {
  bookId: string
  quantity: number
  importPrice: number
}

// Khớp với ReceiptRequest của Backend
export interface ReceiptRequest {
  supplierId: string
  note?: string
  attachmentUrl?: string
  details: ReceiptDetailItem[]
}

// MỚI: Thêm interface này khớp với ReceiptDetailResponse của Backend
export interface ReceiptDetailResponse {
  id: string
  bookId: string
  bookTitle: string
  quantity: number
  importPrice: number
  subTotal: number
}

// ĐÃ SỬA: Khớp 100% với ReceiptResponse của Backend
export interface ReceiptResponse {
  id: string
  receiptCode: string
  supplierId: string
  supplierName: string
  creatorId: string
  creatorName?: string
  attachmentUrl?: string
  note?: string
  totalAmount: number
  status: ReceiptStatus
  createdAt: string
  updatedAt: string
  details: ReceiptDetailResponse[] // Lúc nãy cưng thiếu cái này
}
