export const ReceiptStatus = {
  DRAFT: 'DRAFT',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const

export type ReceiptStatus = (typeof ReceiptStatus)[keyof typeof ReceiptStatus]
