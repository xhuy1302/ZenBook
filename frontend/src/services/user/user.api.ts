import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type {
  SignUpRequest,
  UpdateUserRequest,
  UpdateUserResponse,
  UserResponse
} from '@/services/user/user.type'

export const getAllUsersApi = async () => {
  const res = await api.get<ApiResponse<UserResponse[]>>('/users')
  return res.data.data
}

export const updateUserApi = async (userId: string, payload: UpdateUserRequest) => {
  const res = await api.put<ApiResponse<UpdateUserResponse>>(`/users/${userId}`, payload)
  return res.data.data
}

export const deleteSoftUserApi = async (userId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/users/soft-delete/${userId}`)
  return res.data
}

export const getAllUserInTrashApi = async () => {
  const res = await api.get<ApiResponse<UserResponse[]>>(`/users/trash`)
  return res.data.data
}

export const deleteHardUserApi = async (userId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/users/${userId}`)
  return res.data
}

export const restoreUserApi = async (userId: string) => {
  // Thường dùng PUT hoặc PATCH để cập nhật lại trạng thái/deletedAt về null
  const res = await api.patch<ApiResponse<void>>(`/users/restore/${userId}`)
  return res.data
}

export const uploadAvatarApi = (userId: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file) // 'file' này phải khớp với @RequestParam("file") bên Java

  // Xóa /api/v1 nếu axios đã có baseURL, chỉ để lại /users/...
  return api.patch(`/users/${userId}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data' // Ép kiểu để axios gửi đúng định dạng file
    }
  })
}

export const signUpApi = async (data: SignUpRequest) => {
  const res = await api.post<ApiResponse<UserResponse>>('/users/register', data)
  return res.data
}
