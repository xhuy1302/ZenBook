import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type { BookRequest, BookResponse, GetBooksParams, PageResponse } from './book.type'

// ==================================================
// 🌟 API CHO KHÁCH HÀNG (TRANG CHỦ & TÌM KIẾM)
// ==================================================

export const incrementBookViewApi = async (id: string) => {
  const res = await api.post<ApiResponse<void>>(`/books/${id}/view`)
  return res.data
}

// 👉 1. API TỔNG HỢP: Lấy danh sách, Lọc, Phân trang, Tìm kiếm
export const getBooksApi = async (params: GetBooksParams) => {
  // Xử lý mảng categoryIds thành chuỗi cách nhau bởi dấu phẩy (nếu Spring Boot yêu cầu format đó)
  const queryParams = {
    ...params,
    categoryIds: params.categoryIds?.length ? params.categoryIds.join(',') : undefined
  }

  // Chú ý: Trả về PageResponse (có content, totalPages...) thay vì mảng []
  const res = await api.get<ApiResponse<PageResponse<BookResponse>>>('/books', {
    params: queryParams
  })
  return res.data.data
}

// 👉 2. API: Lấy chi tiết sách theo Slug (Dùng cho trang Chi tiết sản phẩm)
export const getBookBySlugApi = async (slug: string) => {
  const res = await api.get<ApiResponse<BookResponse>>(`/books/${slug}`)
  return res.data.data
}

// 👉 3. API: Lấy chi tiết sách theo ID (Dự phòng cho khách hàng)
export const getBookByIdPublicApi = async (id: string) => {
  const res = await api.get<ApiResponse<BookResponse>>(`/books/id/${id}`)
  return res.data.data
}

// Các hàm cũ giữ nguyên...
export const getRecentBooksApi = async () => {
  const res = await api.get<ApiResponse<BookResponse[]>>('/books/recent')
  return res.data.data
}

export const getTrendingBooksApi = async () => {
  const res = await api.get<ApiResponse<BookResponse[]>>('/books/trending')
  return res.data.data
}

export const getAwardBooksApi = async () => {
  const res = await api.get<ApiResponse<BookResponse[]>>('/books/awards')
  return res.data.data
}

// ==================================================
// 🛡️ API CHO ADMIN (QUẢN LÝ SÁCH)
// ==================================================

// 1. LẤY DANH SÁCH
export const getAllBooksApi = async () => {
  const res = await api.get<ApiResponse<BookResponse[]>>('/admin/books')
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
  const res = await api.post<ApiResponse<BookResponse>>('/admin/books', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

// 3. CẬP NHẬT
export const updateBookApi = async (
  id: string,
  payload: BookRequest & { deleteImageIds?: string[] }
) => {
  const formData = createFormData(payload)

  if (payload.deleteImageIds && payload.deleteImageIds.length > 0) {
    payload.deleteImageIds.forEach((imgId) => {
      formData.append('deleteImageIds', imgId)
    })
  }

  const res = await api.put<ApiResponse<BookResponse>>(`/admin/books/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

// 4. XÓA MỀM
export const deleteBookApi = async (id: string) => {
  const res = await api.delete<ApiResponse<void>>(`/admin/books/${id}`)
  return res.data
}

// ================= API CHO THÙNG RÁC =================

// 5. LẤY DANH SÁCH TRONG THÙNG RÁC
export const getBooksInTrashApi = async () => {
  const res = await api.get<ApiResponse<BookResponse[]>>('/admin/books/trash')
  return res.data.data
}

// 6. KHÔI PHỤC
export const restoreBookApi = async (id: string) => {
  const res = await api.patch<ApiResponse<void>>(`/admin/books/restore/${id}`)
  return res.data
}

// 7. XÓA VĨNH VIỄN
export const hardDeleteBookApi = async (id: string) => {
  const res = await api.delete<ApiResponse<void>>(`/admin/books/hard-delete/${id}`)
  return res.data
}
