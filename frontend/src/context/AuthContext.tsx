import React, { createContext, useState, type ReactNode } from 'react'
import axiosClient from '@/api/axiosClient'

// 1. Khai báo khung dữ liệu của một User (Chấp nhận null cho các trường không bắt buộc)
export interface User {
  id: string
  username: string
  email: string
  fullName: string | null
  avatar: string | null
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
  login: (email: string, password: string) => Promise<AuthResponseData>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user')
    try {
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

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
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
