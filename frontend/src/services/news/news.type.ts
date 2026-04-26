import type { NewsStatus } from '@/defines/news.enum'

// 1. Cập nhật NewsResponse (Bổ sung isFeatured và isTrending)
export interface NewsResponse {
  id: string
  title: string
  slug: string
  summary?: string | null
  content: string
  thumbnail?: string | null
  status: NewsStatus
  viewCount: number

  // Bổ sung các cờ đánh dấu bài viết
  isFeatured: boolean
  isTrending: boolean

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

// 2. Bổ sung Interface cho Thống kê (Stats Bar)
export interface NewsStatsResponse {
  totalPosts: number
  trendingPosts: number
  totalViews: number
}

// 3. Bổ sung Type cho Query Params (Dùng khi gọi API lấy danh sách)
export interface NewsQueryParams {
  page?: number
  size?: number
  search?: string
  categoryId?: string
}

// 4. Bổ sung Interface cho Phân trang (Mapping với Page object của Spring Data)
export interface NewsPageResponse {
  content: NewsResponse[]
  totalElements: number
  totalPages: number
  size: number
  number: number // Trang hiện tại (0-indexed trong Spring)
  first: boolean
  last: boolean
  empty: boolean
}

// 5. NewsRequest (Giữ nguyên hoặc bổ sung nếu Admin cần chỉnh sửa Featured/Trending)
export type NewsRequest = {
  title: string
  summary?: string | null
  content: string
  status: NewsStatus

  // Bổ sung nếu Admin có quyền set các cờ này
  isFeatured?: boolean
  isTrending?: boolean

  categoryId?: string | null
  tagIds?: string[]
  bookIds?: string[]

  metaTitle?: string | null
  metaDescription?: string | null

  thumbnailFile?: File | null
  deleteThumbnail?: boolean
}
