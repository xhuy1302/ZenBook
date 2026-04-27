import type { ActionRole, OrderStatus, PaymentStatus } from '@/defines/order.enum'

export interface OrderDetail {
  id: string
  bookId: string
  bookSlug: string
  bookTitle: string
  bookImage?: string
  quantity: number
  priceAtPurchase: number
  subTotal: number
  isReviewed: boolean
}

export interface OrderHistory {
  id: string
  fromStatus?: OrderStatus
  toStatus?: OrderStatus
  actionBy?: string
  role?: ActionRole
  note?: string
  createdAt: string
}

export interface Order {
  id: string
  orderCode: string
  userId?: string
  customerName: string
  customerPhone: string
  customerEmail: string
  shippingAddress: string
  totalItemsPrice: number
  shippingFee: number
  orderDiscount: number
  shippingDiscount: number
  finalTotal: number
  paymentMethod: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  note?: string
  createdAt: string
  updatedAt: string
  details: OrderDetail[]
  histories: OrderHistory[]
}

export interface OrderItemRequest {
  bookId: string
  quantity: number
}

// 👉 ĐÃ SỬA: Thay getCountPending bằng một alias cho number
// (Vì Backend trả về Long, Frontend nhận là number)
export type OrderCountResponse = number

export interface OrderCreateRequest {
  addressId: string
  customerName: string
  customerPhone: string
  customerEmail: string
  shippingAddress: string
  paymentMethod: string
  orderCouponCode?: string
  shippingCouponCode?: string
  orderDiscount: number
  shippingDiscount: number
  note?: string
  items: OrderItemRequest[]
}

export interface OrderUpdateRequest {
  customerName: string
  customerPhone: string
  shippingAddress: string
  note?: string
  items: OrderItemRequest[]
}

export interface OrderStatusUpdateRequest {
  newStatus: OrderStatus
  note?: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
