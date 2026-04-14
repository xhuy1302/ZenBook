import { BookFormat, BookStatus } from '@/defines/book.enum'

export interface BookResponse {
  id: string
  title: string
  slug: string
  isbn?: string
  description?: string
  originalPrice: number
  salePrice: number
  stockQuantity: number
  thumbnail?: string

  status: BookStatus
  format?: BookFormat
  pageCount?: number
  publicationYear?: number
  dimensions?: string
  weight?: number
  language?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null

  // 👉 THÊM MỚI: Thông tin Nhà xuất bản
  publisher?: { id: string; name: string }

  categories?: { id: string; categoryName: string }[]
  authors?: { id: string; name: string }[]
  tags?: { id: string; name: string }[]
  images?: string[]
}

export interface BookRequest {
  title: string
  isbn?: string
  description?: string
  originalPrice: number
  salePrice: number
  stockQuantity: number
  status: BookStatus

  // 👉 THÊM MỚI: ID Nhà xuất bản
  publisherId?: string

  categoryIds?: string[]
  authorIds?: string[]
  tagIds?: string[]

  format?: BookFormat
  pageCount?: number
  publicationYear?: number
  dimensions?: string
  weight?: number
  language?: string

  thumbnailFile?: File | null
  galleryFiles?: File[]
}
