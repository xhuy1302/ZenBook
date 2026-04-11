import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type { BookRequest, BookResponse } from './book.type' // Đã xóa PageResponse

// 1. LẤY DANH SÁCH
export const getAllBooksApi = async () => {
  const res = await api.get<ApiResponse<BookResponse[]>>('/books')
  return res.data.data
}

// Hàm hỗ trợ tạo FormData (Dùng chung cho Create và Update)
const createFormData = (payload: BookRequest) => {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      !Array.isArray(value) &&
      !(value instanceof File)
    ) {
      formData.append(key, value.toString())
    }
  })

  payload.categoryIds?.forEach((id) => formData.append('categoryIds', id))
  payload.authorIds?.forEach((id) => formData.append('authorIds', id))
  payload.tagIds?.forEach((id) => formData.append('tagIds', id))

  if (payload.thumbnailFile) formData.append('thumbnailFile', payload.thumbnailFile)
  payload.galleryFiles?.forEach((file) => formData.append('galleryFiles', file))

  return formData
}

// 2. THÊM MỚI
export const createBookApi = async (payload: BookRequest) => {
  const formData = createFormData(payload)
  const res = await api.post<ApiResponse<BookResponse>>('/books', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

// 3. CẬP NHẬT
export const updateBookApi = async (id: string, payload: BookRequest) => {
  const formData = createFormData(payload)
  const res = await api.put<ApiResponse<BookResponse>>(`/books/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

// 4. XÓA MỀM
export const deleteBookApi = async (id: string) => {
  const res = await api.delete<ApiResponse<void>>(`/books/${id}`)
  return res.data
}

// ================= API CHO THÙNG RÁC =================

// 5. LẤY DANH SÁCH TRONG THÙNG RÁC (Đã bỏ phân trang)
export const getBooksInTrashApi = async () => {
  const res = await api.get<ApiResponse<BookResponse[]>>('/books/trash')
  return res.data.data
}

// 6. KHÔI PHỤC
export const restoreBookApi = async (id: string) => {
  const res = await api.patch<ApiResponse<void>>(`/books/restore/${id}`)
  return res.data
}

// 7. XÓA VĨNH VIỄN
export const hardDeleteBookApi = async (id: string) => {
  const res = await api.delete<ApiResponse<void>>(`/books/hard-delete/${id}`)
  return res.data
}
