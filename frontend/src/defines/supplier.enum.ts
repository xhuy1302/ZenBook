export const SupplierStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED'
} as const

export type SupplierStatus = (typeof SupplierStatus)[keyof typeof SupplierStatus]
