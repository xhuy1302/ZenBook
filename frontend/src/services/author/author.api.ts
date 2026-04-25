import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type {
  AuthorResponse,
  UpdateAuthorRequest,
  UpdateAuthorResponse,
  CreateAuthorRequest, // Đảm bảo bạn đã định nghĩa type này khớp với AuthorCreationRequest bên Java
  AuthorFilterResponse
} from '@/services/author/author.type'

// 1. Lấy tất cả author (Active)
export const getAllAuthorsApi = async () => {
  const res = await api.get<ApiResponse<AuthorResponse[]>>('/authors')
  return res.data.data
}

// 2. Lấy author theo id
export const getAuthorByIdApi = async (authorId: string) => {
  const res = await api.get<ApiResponse<AuthorResponse>>(`/authors/${authorId}`)
  return res.data.data
}

// 3. TẠO AUTHOR
// Sửa path thành /createAuthor và nhận Object JSON theo đúng Controller
export const createAuthorApi = async (payload: CreateAuthorRequest) => {
  const res = await api.post<ApiResponse<AuthorResponse>>('/authors/createAuthor', payload)
  return res.data.data
}

// 4. Update author (Thông tin cơ bản)
export const updateAuthorApi = async (authorId: string, payload: UpdateAuthorRequest) => {
  const res = await api.put<ApiResponse<UpdateAuthorResponse>>(`/authors/${authorId}`, payload)
  return res.data.data
}

// 5. Soft delete (Xóa tạm thời)
export const deleteSoftAuthorApi = async (authorId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/authors/soft-delete/${authorId}`)
  return res.data
}

// 6. Trash list (Danh sách thùng rác)
export const getAllAuthorInTrashApi = async () => {
  const res = await api.get<ApiResponse<AuthorResponse[]>>('/authors/trash')
  return res.data.data
}

// 7. Hard delete (Xóa vĩnh viễn)
export const deleteHardAuthorApi = async (authorId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/authors/${authorId}`)
  return res.data
}

// 8. Restore (Khôi phục)
export const restoreAuthorApi = async (authorId: string) => {
  const res = await api.patch<ApiResponse<void>>(`/authors/restore/${authorId}`)
  return res.data
}

// 9. Upload avatar (Dùng cho trường hợp CẬP NHẬT ảnh của tác giả ĐÃ CÓ ID)
// Đã khớp với @PatchMapping("/{authorId}/avatar") và @RequestParam("file")
export const uploadAuthorAvatarApi = async (authorId: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await api.patch<ApiResponse<string>>(`/authors/${authorId}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return res.data.data
}

export const getAuthorsForFilterApi = async () => {
  const res = await api.get<ApiResponse<AuthorFilterResponse[]>>('/customer/authors/filter')
  return res.data.data
}
