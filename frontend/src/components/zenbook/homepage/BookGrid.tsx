'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom' // 👉 Đã sửa: Import từ react-router-dom
import { ChevronRight, Loader2 } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import BookCard from './BookCard'

import { getTrendingBooksApi, getAwardBooksApi, getRecentBooksApi } from '@/services/book/book.api'
import type { BookResponse } from '@/services/book/book.type'

export default function BookGrid() {
  const { t } = useTranslation('common')

  // State quản lý Tab hiện tại
  const [activeTab, setActiveTab] = useState<string>('trending')

  // --- FETCH DATA BẰNG REACT QUERY ---
  const { data: trendingBooks, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['books', 'trending'],
    queryFn: getTrendingBooksApi,
    enabled: activeTab === 'trending',
    staleTime: 5 * 60 * 1000
  })

  const { data: awardBooks, isLoading: isLoadingAwards } = useQuery({
    queryKey: ['books', 'awards'],
    queryFn: getAwardBooksApi,
    enabled: activeTab === 'awards',
    staleTime: 5 * 60 * 1000
  })

  const { data: recentBooks, isLoading: isLoadingRecent } = useQuery({
    queryKey: ['books', 'recent'],
    queryFn: getRecentBooksApi,
    enabled: activeTab === 'recent',
    staleTime: 5 * 60 * 1000
  })

  // Cấu hình các Tabs
  const tabs = [
    {
      value: 'trending',
      label: t('bookGrid.trending', 'Thịnh hành'),
      books: trendingBooks || [],
      isLoading: isLoadingTrending
    },
    {
      value: 'awards',
      label: t('bookGrid.awards', 'Giải thưởng'),
      books: awardBooks || [],
      isLoading: isLoadingAwards
    },
    {
      value: 'recent',
      label: t('bookGrid.recent', 'Mới nhất'),
      books: recentBooks || [],
      isLoading: isLoadingRecent
    }
  ]

  return (
    <section className='max-w-7xl mx-auto px-4 py-6'>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='block w-full'>
        <div className='flex items-center justify-between mb-6'>
          {/* Danh sách Tab */}
          <TabsList className='bg-neutral-100 p-1 h-auto gap-1'>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className='text-sm px-4 py-1.5 data-[state=active]:bg-brand-green data-[state=active]:text-white data-[state=active]:shadow-none rounded font-medium transition-all'
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Nút Xem tất cả - Đã sửa lỗi hiển thị và điều hướng */}
          <Button
            variant='ghost'
            size='sm'
            className='text-brand-green hover:text-brand-green-dark hover:bg-brand-green/10 text-sm gap-1 font-semibold group'
            asChild
          >
            <Link to='/products'>
              {t('bookGrid.viewAll', 'Xem tất cả')}
              <ChevronRight className='w-4 h-4 transition-transform group-hover:translate-x-1' />
            </Link>
          </Button>
        </div>

        {/* Nội dung các Tab */}
        {tabs.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className='mt-0 min-h-[350px] outline-none'
          >
            {tab.isLoading ? (
              <div className='flex flex-col justify-center items-center h-[300px] gap-3'>
                <Loader2 className='h-10 w-10 animate-spin text-brand-green' />
                <p className='text-sm text-muted-foreground animate-pulse'>Đang tải dữ liệu...</p>
              </div>
            ) : tab.books.length > 0 ? (
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
                {tab.books.map((book: BookResponse) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className='flex flex-col justify-center items-center h-[300px] text-muted-foreground border-2 border-dashed rounded-xl bg-slate-50/50'>
                <p className='font-medium'>
                  {t('bookGrid.noBooks', 'Chưa có sách nào trong mục này')}
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
