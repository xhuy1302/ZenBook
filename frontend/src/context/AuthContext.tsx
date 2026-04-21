import React, { createContext, useState, useContext, type ReactNode } from 'react'
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
  isAuthenticated: boolean // Thêm để Header nhận diện
  isLoading: boolean // Thêm trạng thái loading
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

  // Vì lấy từ localStorage nên render ra là có luôn (chưa gọi API verify token)
  const [isLoading] = useState(false)
  const isAuthenticated = !!user

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

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
