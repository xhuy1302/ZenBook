// ── User Profile ─────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string
  username: string
  email: string
  fullname?: string // Khớp với UserEntity/Mapper
  phone?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER' // Nên để chữ HOA khớp với Enum Java
  dateOfBirth?: string
  nationality?: string
  avatar?: string // Backend dùng 'avatar', FE mapping là 'avatarUrl' nếu cần
  roles: string[]
}

// ── Update requests ───────────────────────────────────────────────────────────
export interface CustomerProfileUpdateRequest {
  fullname?: string
  username?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  dateOfBirth?: string // "YYYY-MM-DD"
  nationality?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface PhoneUpdateRequest {
  phone: string
}

// ── Order & Order Details (XÓA BỎ ANY) ────────────────────────────────────────

export interface OrderDetail {
  id: string
  bookId: string
  bookTitle: string
  bookImage: string // Khớp với Mapping: book.thumbnail -> bookImage
  quantity: number
  price: number // Giá lúc mua
}

export interface Order {
  id: string
  orderCode: string // Khớp với OrderResponse.orderCode
  createdAt: string // Khớp với OrderResponse.createdAt
  finalTotal: number // Khớp với OrderResponse.finalTotal
  status: 'PENDING' | 'CONFIRMED' | 'PACKING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED' | 'RETURNED'
  details: OrderDetail[] // Đã thay thế any[] bằng interface cụ thể
}

// ── Address ───────────────────────────────────────────────────────────────────

export interface Address {
  id: string
  recipientName: string
  phone: string
  street: string
  ward: string
  district: string
  city: string
  districtId: number // 👉 Thêm mã Quận/Huyện từ API GHN
  wardCode: string // 👉 Thêm mã Phường/Xã từ API GHN
  isDefault: boolean // Thống nhất dùng isDefault giống Backend
}

// Dùng cho API thêm mới/cập nhật địa chỉ
export interface AddressRequest {
  recipientName: string
  phone: string
  street: string
  ward: string
  district: string
  city: string
  districtId?: number // Dùng optional (?) vì trong form lúc mới khởi tạo có thể chưa có
  wardCode?: string // Dùng optional (?) vì trong form lúc mới khởi tạo có thể chưa có
  isDefault: boolean
}
// ── Tab ───────────────────────────────────────────────────────────────────────

export type AccountTab = 'profile' | 'orders' | 'address' | 'password'
