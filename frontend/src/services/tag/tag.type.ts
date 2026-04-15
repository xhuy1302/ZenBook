export interface TagResponse {
  id: string
  name: string
  slug: string
  description?: string | null
  color?: string | null
  createdAt: string
  deletedAt?: string | null
}

// Dùng chung cho cả Create và Update vì Tag truyền lên giống nhau
export type TagRequest = {
  name: string
  description?: string | null
  color?: string | null
}
