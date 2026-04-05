import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
      // eslint-disable-next-line no-console
      console.log('Đã gắn token vào request!')
    }
    return config
  },
  (error) => Promise.reject(error)
)
