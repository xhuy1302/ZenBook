import type { NewsStatus } from '@/defines/news.enum'

export interface NewsResponse {
  id: string
  title: string
  slug: string
  summary?: string | null
  content: string
  thumbnail?: string | null
  status: NewsStatus
  viewCount: number

  // SEO
  metaTitle?: string | null
  metaDescription?: string | null

  // Quan hệ
  authorId?: string | null
  authorName?: string | null
  categoryId?: string | null
  categoryName?: string | null

  // Thời gian
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type NewsRequest = {
  title: string
  summary?: string | null
  content: string
  status: NewsStatus

  categoryId?: string | null
  tagIds?: string[]
  bookIds?: string[]

  metaTitle?: string | null
  metaDescription?: string | null

  // Xử lý file ảnh bìa gửi lên từ Form
  thumbnailFile?: File | null
  deleteThumbnail?: boolean
}
