export const BookStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  DELETED: 'DELETED'
} as const

export const BookFormat = {
  PAPERBACK: 'PAPERBACK', // Bìa mềm
  HARDCOVER: 'HARDCOVER', // Bìa cứng
  EBOOK: 'EBOOK'
} as const

export type BookStatus = (typeof BookStatus)[keyof typeof BookStatus]
export type BookFormat = (typeof BookFormat)[keyof typeof BookFormat]
