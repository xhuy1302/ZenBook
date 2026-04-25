import type { ReceiptStatus } from '@/defines/receipt.enum'

// Khớp với ReceiptDetailRequest của Backend
export interface ReceiptDetailRequest {
  bookId: string
  quantity: number
  importPrice: number
  note?: string // 👉 Bổ sung trường note
}

// Khớp với ReceiptRequest của Backend
export interface ReceiptRequest {
  supplierId: string // 👉 Đổi từ publisherId sang supplierId
  note?: string
  attachmentUrl?: string
  details: ReceiptDetailRequest[]
}

// Khớp với ReceiptDetailResponse của Backend
export interface ReceiptDetailResponse {
  id: string
  bookId: string
  bookTitle: string
  quantity: number
  importPrice: number
  subTotal: number
  note?: string // 👉 Bổ sung trường note
}

// Khớp 100% với ReceiptResponse của Backend
export interface ReceiptResponse {
  id: string
  receiptCode: string
  supplierId: string // 👉 Đổi từ publisherId sang supplierId
  supplierName: string // 👉 Đổi từ publisherName sang supplierName
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

// Dữ liệu chi tiết từng dòng khi xem trước
export interface PreviewReceiptDetailResponse {
  rowNumber: number
  bookId: string
  bookTitle?: string
  thumbnail?: string
  quantity: number
  importPrice: number
  salePrice?: number // Để nhân viên so sánh giá nhập/bán
  subTotal: number
  isValid: boolean
  errorMessages: string[] // Chứa danh sách lỗi: "Giá nhập > Giá bán", "Sách không tồn tại",...
}

// Tổng thể kết quả trả về từ API Preview
export interface PreviewReceiptResponse {
  details: PreviewReceiptDetailResponse[]
  totalAmount: number
  totalRows: number
  validRows: number
  invalidRows: number
  isValidAll: boolean // Nếu cái này true mới cho hiện nút "Nhập kho"
}
