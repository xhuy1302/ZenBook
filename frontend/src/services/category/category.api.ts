import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type {
  CategoryCreationRequest,
  CategoryResponse,
  CategoryUpdateRequest,
  CategoryUpdateResponse
} from './category.type'

// 1. Tạo mới danh mục (Trả về data để lấy ID sau khi tạo)
export const createCategoryApi = async (payload: CategoryCreationRequest) => {
  const res = await api.post<ApiResponse<CategoryResponse>>('/categories', payload)
  return res.data.data // Trả về object CategoryResponse chứa ID
}

// 2. Lấy toàn bộ danh sách phẳng (Active)
export const getAllCategoriesApi = async () => {
  const res = await api.get<ApiResponse<CategoryResponse[]>>('/categories')
  return res.data.data
}

// 3. Lấy cấu trúc cây (Tree)
export const getCategoryTreeApi = async () => {
  const res = await api.get<ApiResponse<CategoryResponse[]>>('/categories/tree')
  return res.data.data
}

// 4. Lấy chi tiết một danh mục
export const getCategoryByIdApi = async (id: string) => {
  const res = await api.get<ApiResponse<CategoryResponse>>(`/categories/${id}`)
  return res.data.data
}

// 5. Cập nhật danh mục
export const updateCategoryApi = async (id: string, payload: CategoryUpdateRequest) => {
  const res = await api.put<ApiResponse<CategoryUpdateResponse>>(`/categories/${id}`, payload)
  return res.data.data
}

// 6. Xóa vĩnh viễn (Hard Delete)
export const deleteHardCategoryApi = async (id: string) => {
  const res = await api.delete<ApiResponse<void>>(`/categories/${id}`)
  return res.data
}

// 7. Xóa mềm (Vào thùng rác)
export const deleteSoftCategoryApi = async (id: string) => {
  const res = await api.delete<ApiResponse<void>>(`/categories/soft-delete/${id}`)
  return res.data
}

// 8. Lấy danh sách trong thùng rác
export const getCategoriesInTrashApi = async () => {
  const res = await api.get<ApiResponse<CategoryResponse[]>>('/categories/trash')
  return res.data.data
}

// 9. Khôi phục từ thùng rác
export const restoreCategoryApi = async (id: string) => {
  const res = await api.patch<ApiResponse<void>>(`/categories/restore/${id}`)
  return res.data
}

// 10. Upload Thumbnail cho danh mục
// Sửa lỗi: Đổi axiosClient thành api, và thêm /api/v1 (nếu config api chưa có)
// Đảm bảo khớp với route @PostMapping("/{id}/thumbnail") bên Backend
export const uploadCategoryThumbApi = async (categoryId: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await api.post<ApiResponse<string>>(`/categories/${categoryId}/thumbnail`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return res.data
}
