import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type { TagRequest, TagResponse } from '@/services/tag/tag.type' // Sửa lại đường dẫn import cho khớp dự án của bạn

// 1. Tạo mới Tag
export const createTagApi = async (payload: TagRequest) => {
  const res = await api.post<ApiResponse<TagResponse>>('/tags', payload)
  return res.data.data
}

// 2. Lấy danh sách toàn bộ Tag (Active)
export const getAllTagsApi = async () => {
  const res = await api.get<ApiResponse<TagResponse[]>>('/tags')
  return res.data.data
}

// 3. Cập nhật Tag
export const updateTagApi = async (tagId: string, payload: TagRequest) => {
  const res = await api.put<ApiResponse<TagResponse>>(`/tags/${tagId}`, payload)
  return res.data.data
}

// 4. Xóa mềm Tag (Cho vào thùng rác)
export const deleteSoftTagApi = async (tagId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/tags/soft-delete/${tagId}`)
  return res.data
}

// 5. Lấy danh sách Tag trong thùng rác
export const getAllTagInTrashApi = async () => {
  const res = await api.get<ApiResponse<TagResponse[]>>(`/tags/trash`)
  return res.data.data
}

// 6. Xóa vĩnh viễn Tag
export const deleteHardTagApi = async (tagId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/tags/${tagId}`)
  return res.data
}

// 7. Khôi phục Tag từ thùng rác
export const restoreTagApi = async (tagId: string) => {
  const res = await api.patch<ApiResponse<void>>(`/tags/restore/${tagId}`)
  return res.data
}
