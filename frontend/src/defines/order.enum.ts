export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PACKING: 'PACKING',
  SHIPPING: 'SHIPPING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED'
} as const

export const PaymentStatus = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED'
} as const

export const ActionRole = {
  USER: 'USER',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
  SYSTEM: 'SYSTEM'
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]
export type ActionRole = (typeof ActionRole)[keyof typeof ActionRole]
