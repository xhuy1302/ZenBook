import type { CategoryStatus } from '@/defines/category.enum'

/**
 * Interface phản hồi đầy đủ từ API dành cho danh sách và chi tiết
 * Khớp với CategoryResponse.java trong Spring Boot
 */
export interface CategoryResponse {
  id: string
  categoryName: string
  slug: string
  categoryDesc: string | null
  parentId: string | null
  level: number
  thumbnailUrl: string | null
  displayOrder: number
  isFeatured: boolean
  status: CategoryStatus
  // Format: dd-MM-yyyy HH:mm:ss từ @JsonFormat
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  // Cấu trúc đệ quy cho cây danh mục
  children?: CategoryResponse[]
}

/**
 * Payload dùng cho việc tạo mới danh mục
 * Khớp với CategoryCreationRequest.java
 */
export type CategoryCreationRequest = {
  categoryName: string // @NotBlank
  slug?: string | null // Nếu để trống Backend sẽ tự generate
  categoryDesc?: string | null
  parentId?: string | null
  displayOrder?: number // Backend mặc định 0 nếu không gửi
  thumbnailUrl?: string | null
  isFeatured: boolean // @NotNull (Nên bắt buộc gửi true/false từ form)
}

/**
 * Payload dùng cho việc cập nhật thông tin danh mục
 * Khớp với CategoryUpdateRequest.java
 */
export type CategoryUpdateRequest = {
  categoryName: string // @NotBlank
  slug: string | null
  categoryDesc: string | null
  parentId: string | null
  thumbnailUrl: string | null
  displayOrder: number
  isFeatured: boolean
  status: CategoryStatus
}

/**
 * Phản hồi sau khi cập nhật thành công (thường dùng để cập nhật state cục bộ)
 * Khớp với CategoryUpdateResponse.java
 */
export type CategoryUpdateResponse = {
  id: string
  categoryName: string
  slug: string
  categoryDesc: string | null
  parentId: string | null
  level: number
  thumbnailUrl: string | null
  displayOrder: number
  isFeatured: boolean
  status: CategoryStatus
  updatedAt: string
}
