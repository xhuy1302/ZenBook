import type { BookStatus } from '@/defines/book.enum'

export interface WishlistResponse {
  bookId: string
  title: string
  slug: string
  salePrice: number
  stockQuantity: number
  originalPrice: number
  soldQuantity?: number
  status: BookStatus
  discount?: number
  thumbnail: string | null
}

export interface WishlistRequest {
  bookId: string
}

export interface WishlistCheckResponse {
  inWishlist: boolean
}

export interface WishlistCountResponse {
  count: number
}

export interface WishlistToggleResponse {
  status: 'added' | 'removed'
}
