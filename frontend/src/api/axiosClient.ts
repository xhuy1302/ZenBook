import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'

// 1. Tạo một instance của axios với cấu hình mặc định
const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1', // Trỏ đến Backend Spring Boot
  headers: {
    'Content-Type': 'application/json'
  }
})

// 2. INTERCEPTOR REQUEST: Chạy TRƯỚC KHI request được gửi lên server
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Tìm thẻ thông hành (token) đang lưu trong máy
    const token = localStorage.getItem('token')

    // Nếu có token, tự động đính kèm vào Header Authorization
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// 3. INTERCEPTOR RESPONSE: Chạy SAU KHI server trả dữ liệu về
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Backend trả về dạng { code, message, data }. Ta bóc luôn phần "data" để code UI cho ngắn
    if (response.data && response.data.data !== undefined) {
      return response.data.data
    }
    return response.data
  },
  (error: AxiosError) => {
    // Nếu server báo lỗi 403 (Không có quyền / Token hết hạn)
    if (error.response?.status === 403) {
      // eslint-disable-next-line no-console
      console.error('Token hết hạn hoặc bạn không có quyền truy cập!')
      // Sau này có thể thêm code tự động xóa token và đá về trang login ở đây
    }
    return Promise.reject(error)
  }
)

export default axiosClient
