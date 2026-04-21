import { BookFormat, BookStatus } from '@/defines/book.enum'
import { type TagResponse } from '@/services/tag/tag.type'

// 1. THÊM INTERFACE CHO PHÂN TRANG CỦA SPRING BOOT (Page<T>)
export interface PageResponse<T> {
  content: T[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

// 2. THÊM INTERFACE CHO THAM SỐ LỌC API
export interface GetBooksParams {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  keyword?: string
  minPrice?: number
  maxPrice?: number
  categoryIds?: string[] // Mảng ID danh mục
}

// 3. CẬP NHẬT LẠI BOOK RESPONSE
export interface BookResponse {
  id: string
  title: string
  slug: string
  isbn?: string
  description?: string
  originalPrice: number
  salePrice: number
  stockQuantity: number
  soldQuantity?: number // 👉 Vừa bổ sung cho giống Backend
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

  rating?: number
  reviews?: number
  award?: string
  views?: number
  discount?: number

  publisher?: { id: string; name: string }
  categories?: { id: string; categoryName: string }[]
  authors?: { id: string; name: string }[]
  tags?: TagResponse[]
  images?: string[] // Có thể đổi thành { id: string, imageUrl: string }[] nếu cần
}

export interface BookRequest {
  title: string
  isbn?: string
  description?: string
  originalPrice: number
  salePrice: number
  stockQuantity: number
  status: BookStatus

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

export type { TagResponse }
