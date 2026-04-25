export interface CartItemRequest {
  bookId: string
  quantity: number
}

// 2. Kiểu dữ liệu chi tiết của 1 cuốn sách trả về từ Server
export interface CartDetailResponse {
  id: string // Mã chi tiết giỏ hàng
  bookId: string // Mã sách
  bookSlug?: string // Slug sách (để SEO URL, có thể không có)
  bookTitle: string // Tên sách
  bookThumbnail: string // Ảnh bìa
  price: number // Giá bán
  originalPrice?: number // Giá gốc (để gạch ngang)
  author?: string // Tên tác giả
  quantity: number // Số lượng khách đặt
  stock: number // Số lượng tồn kho (để chặn mua lố)
}

// 3. Kiểu dữ liệu Giỏ hàng tổng trả về từ Server
export interface CartResponse {
  id: string // Mã giỏ hàng
  details: CartDetailResponse[] // Danh sách sản phẩm
  totalPrice: number // Tổng tiền
}

// 4. (Giữ lại) Type cũ dành cho UI State và LocalStorage của khách Vãng lai
export interface CartItemType {
  id: string
  slug?: string
  title: string
  thumbnail: string
  price: number
  quantity: number
  selected: boolean // Trạng thái tick chọn (chỉ Frontend dùng)
  stock: number
  originalPrice?: number
  author?: string
  variant?: string
}
