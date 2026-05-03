import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react'
import axiosClient from '@/api/axiosClient'

// 1. Khai báo khung dữ liệu của một User
export interface User {
  id: string
  username: string
  email: string
  fullName: string | null
  avatar: string | null // Tên trường là avatar
  phone?: string | null
  roles: string[]
  status: string
}

export interface AuthResponseData {
  token: string
  user: User
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthResponseData>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

// 👉 TẠO CUSTOM HOOK ĐỂ DÙNG NHANH
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user')
    try {
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  const [isLoading] = useState(false)
  const isAuthenticated = !!user

  // 👉 HÀM LOGIN: Nhận thẳng Token và User, không qua bước OTP
  const login = async (email: string, password: string): Promise<AuthResponseData> => {
    const response = await axiosClient.post<AuthResponseData, AuthResponseData>('/auth/login', {
      email,
      password
    })

    const { token, user: userData } = response
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return response
  }

  // 👉 ĐÃ TỐI ƯU: Sử dụng callback của setUser để luôn lấy data mới nhất
  const updateUser = (userData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null
      const updatedUser = { ...prevUser, ...userData }
      localStorage.setItem('user', JSON.stringify(updatedUser)) // Cập nhật luôn LocalStorage
      return updatedUser
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // =======================================================================
  // 👉 BỘ LẮNG NGHE SỰ KIỆN TOÀN CỤC (GLOBAL EVENT LISTENERS)
  // =======================================================================
  useEffect(() => {
    // 1. Lắng nghe khi Upload Avatar thành công
    const handleAvatarUpdate = (event: Event) => {
      // Ép kiểu về CustomEvent chứa string (URL ảnh)
      const customEvent = event as CustomEvent<string>
      const newAvatarUrl = customEvent.detail
      updateUser({ avatar: newAvatarUrl })
    }

    // 2. Lắng nghe khi Lưu Profile thành công (Đổi tên, biệt danh...)
    const handleProfileUpdate = (event: Event) => {
      // Ép kiểu về CustomEvent chứa Object thông tin user
      const customEvent = event as CustomEvent<{
        fullName?: string | null
        username?: string
        phone?: string | null
      }>
      const updatedProfile = customEvent.detail

      updateUser({
        fullName: updatedProfile.fullName,
        username: updatedProfile.username,
        phone: updatedProfile.phone
      })
    }

    // Đăng ký bộ thu sóng
    window.addEventListener('onAvatarUpdated', handleAvatarUpdate)
    window.addEventListener('onProfileUpdated', handleProfileUpdate)

    // Gỡ bộ thu sóng khi component unmount
    return () => {
      window.removeEventListener('onAvatarUpdated', handleAvatarUpdate)
      window.removeEventListener('onProfileUpdated', handleProfileUpdate)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
