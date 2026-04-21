'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Loader2 } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import BookCard from './BookCard'

// BƯỚC 1: IMPORT CÁC HÀM GỌI API TỪ SERVICES (Hãy chắc chắn đường dẫn này đúng với dự án của bạn)
import { getTrendingBooksApi, getAwardBooksApi, getRecentBooksApi } from '@/services/book/book.api'

// Thêm type (tuỳ chọn nhưng nên có để code chặt chẽ)
import type { BookResponse } from '@/services/book/book.type'

export default function BookGrid() {
  const { t } = useTranslation('common')

  // State quản lý Tab hiện tại để tối ưu API (chỉ gọi API của tab đang mở)
  const [activeTab, setActiveTab] = useState<string>('trending')

  // --- FETCH DATA BẰNG REACT QUERY ---
  const { data: trendingBooks, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['books', 'trending'],
    queryFn: getTrendingBooksApi,
    enabled: activeTab === 'trending', // Chỉ lấy dữ liệu khi tab này đang active
    staleTime: 5 * 60 * 1000 // Cache 5 phút
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

  // Cấu trúc lại mảng tabs với dữ liệu thật
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
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab} // Thay đổi tab thì sẽ trigger gọi API tương ứng
        className='block w-full'
      >
        <div className='flex items-center justify-between mb-4'>
          <TabsList className='bg-neutral-100 p-1 h-auto gap-1'>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className='text-sm px-4 py-1.5 data-[state=active]:bg-brand-green data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded font-medium'
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            variant='ghost'
            size='sm'
            className='text-brand-green hover:text-brand-green-dark hover:bg-brand-green-light text-sm gap-1'
          >
            {t('bookGrid.viewAll')}
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>

        {/* Hiển thị nội dung dựa trên trạng thái Loading và Data */}
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className='mt-0 min-h-[300px]'>
            {/* Nếu đang gọi API -> Hiện loading mượt mà */}
            {tab.isLoading ? (
              <div className='flex justify-center items-center h-[200px]'>
                <Loader2 className='h-8 w-8 animate-spin text-brand-green' />
              </div>
            ) : tab.books.length > 0 ? (
              // Nếu có dữ liệu -> Hiện lưới sách
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'>
                {tab.books.map((book: BookResponse) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              // Nếu API trả về mảng rỗng -> Hiện thông báo trống
              <div className='flex justify-center items-center h-[200px] text-muted-foreground border-2 border-dashed rounded-lg'>
                {t('bookGrid.noBooks', 'Chưa có sách nào trong mục này')}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
