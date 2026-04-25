// Định nghĩa kiểu dữ liệu cho từng cuốn sách trong giỏ hàng
export interface OrderItemRequest {
  bookId: string
  quantity: number
}

// Định nghĩa kiểu dữ liệu Frontend gửi lên (Request)
export interface ShippingFeeRequest {
  addressId?: string // Có thể undefined nếu khách chưa có địa chỉ
  items: OrderItemRequest[]
  shippingVoucherCode?: string // Mã Freeship
  orderVoucherCode?: string // Mã giảm tiền sách
}

// Định nghĩa kiểu dữ liệu Backend trả về (Response - Giống hệt file Java của bạn)
export interface ShippingFeeResponse {
  rawOrderTotal: number // Tổng tiền sách gốc
  orderDiscount: number // Số tiền được giảm từ mã Shop
  finalOrderTotal: number // Tiền sách sau khi giảm

  baseShippingFee: number // Phí ship gốc từ GHN báo về
  shippingDiscount: number // Số tiền ship được giảm từ mã Freeship
  finalShippingFee: number // Phí ship khách thực trả

  totalPayment: number // TỔNG TIỀN CUỐI CÙNG KHÁCH PHẢI TRẢ
}
