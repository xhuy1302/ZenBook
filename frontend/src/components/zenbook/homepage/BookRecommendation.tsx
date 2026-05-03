import React, { useEffect, useState } from 'react'
import axiosClient from '@/api/axiosClient'
import BookCard from './BookCard'
import type { BookResponse } from '@/services/book/book.type'
import { Sparkles, BookOpen } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

// ============================================================================
// 1. ĐỊNH NGHĨA INTERFACE
// ============================================================================
export interface RecommendationSection {
  title: string
  books: BookResponse[]
}

export interface ApiResponse<T> {
  code: number
  message?: string
  data: T
}

// ============================================================================
// 2. MAIN COMPONENT
// ============================================================================
const PersonalizedRecommendations: React.FC = () => {
  const { user } = useAuth()
  const [sections, setSections] = useState<RecommendationSection[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const currentUserId = user?.id

        const url = currentUserId
          ? `/recommendations/for-you?userId=${currentUserId}`
          : `/recommendations/for-you`

        // 👉 Dùng unknown thay cho any để fix lỗi ESLint
        const response = await axiosClient.get<unknown, ApiResponse<RecommendationSection[]>>(url)
        const responseData = response.data || response

        if (Array.isArray(responseData)) {
          setSections(responseData)
        }
      } catch {
        if (user?.id) {
          toast.error('Lỗi khi lấy sách gợi ý')
        }
        setError('Không thể tải dữ liệu gợi ý lúc này.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [user?.id])

  // --- RENDERING TRẠNG THÁI LOADING ---
  if (isLoading) {
    return (
      <div className='w-full max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center space-y-4'>
        <div className='relative flex items-center justify-center'>
          <div className='absolute w-12 h-12 border-4 border-[#22c55e]/20 rounded-full'></div>
          <div className='w-12 h-12 border-4 border-[#22c55e] rounded-full border-t-transparent animate-spin'></div>
        </div>
        <p className='text-[#22c55e] font-semibold text-sm animate-pulse tracking-wide'>
          ZenBook đang tìm sách hợp gu với bạn... ✨
        </p>
      </div>
    )
  }

  if (error || sections.length === 0) {
    return null
  }

  // --- RENDERING GIAO DIỆN CHÍNH ---
  return (
    <div className='flex flex-col gap-8 my-8 max-w-7xl mx-auto px-4 w-full'>
      {sections.map((section, index) => (
        <section
          key={index}
          className='relative rounded-xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.1)] border border-emerald-100/50 overflow-hidden bg-white'
        >
          {/* HEADER BANNER */}
          <div className='relative bg-gradient-to-r from-[#22c55e] to-[#16a34a] py-3.5 px-4 flex items-center justify-center overflow-hidden'>
            <div className='absolute inset-0 opacity-10 flex items-center justify-center space-x-20 pointer-events-none'>
              <BookOpen className='w-24 h-24 -rotate-12 transform scale-150' />
              <BookOpen className='w-24 h-24 rotate-12 transform scale-150' />
            </div>

            <h2 className='relative z-10 text-[17px] md:text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wide drop-shadow-sm'>
              <Sparkles className='w-5 h-5 text-yellow-300 animate-pulse' />
              {section.title}
              <Sparkles className='w-5 h-5 text-yellow-300 animate-pulse' />
            </h2>
          </div>

          {/* BODY */}
          <div className='p-3 md:p-4 bg-white/80'>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4'>
              {section.books.map((book) => (
                <div
                  key={book.id}
                  className='transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rounded-xl bg-white'
                >
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}

export default PersonalizedRecommendations
