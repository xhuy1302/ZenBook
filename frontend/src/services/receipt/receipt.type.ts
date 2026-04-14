import type { ReceiptStatus } from '@/defines/receipt.enum'

// ĐÃ ĐỔI TÊN: Khớp với ReceiptDetailRequest của Backend
export interface ReceiptDetailRequest {
  bookId: string
  quantity: number
  importPrice: number
}

// Khớp với ReceiptRequest của Backend
export interface ReceiptRequest {
  publisherId: string // 👉 Đổi từ supplierId
  note?: string
  attachmentUrl?: string
  details: ReceiptDetailRequest[] // 👉 Đổi kiểu dữ liệu
}

// Khớp với ReceiptDetailResponse của Backend
export interface ReceiptDetailResponse {
  id: string
  bookId: string
  bookTitle: string
  quantity: number
  importPrice: number
  subTotal: number
}

// Khớp 100% với ReceiptResponse của Backend
export interface ReceiptResponse {
  id: string
  receiptCode: string
  publisherId: string // 👉 Đổi từ supplierId
  publisherName: string // 👉 Đổi từ supplierName
  creatorId: string
  creatorName?: string
  attachmentUrl?: string
  note?: string
  totalAmount: number
  status: ReceiptStatus
  createdAt: string
  updatedAt: string
  details: ReceiptDetailResponse[]
}
