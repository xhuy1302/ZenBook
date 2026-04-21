import { Skeleton } from '@/components/ui/skeleton'
import BookCard from '@/components/zenbook/homepage/BookCard' // Đổi đường dẫn import này cho đúng với dự án của bạn
import type { BookResponse } from '@/services/book/book.type'
import type { ViewMode } from './ProductSortBar'

interface ProductGridProps {
  books: BookResponse[]
  isLoading?: boolean
  viewMode: ViewMode
}

function BookCardSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === 'list') {
    return (
      <div className='flex gap-4 bg-white rounded-xl border border-gray-100 p-4'>
        <Skeleton className='w-28 h-40 rounded-lg flex-shrink-0' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-5 w-3/4' />
          <Skeleton className='h-4 w-1/3' />
          <Skeleton className='h-4 w-1/4' />
          <Skeleton className='h-6 w-1/4 mt-3' />
        </div>
      </div>
    )
  }
  return (
    <div className='bg-white rounded-xl border border-gray-100 p-3'>
      <Skeleton className='w-full aspect-[3/4] rounded-lg mb-3' />
      <Skeleton className='h-4 w-full mb-1' />
      <Skeleton className='h-4 w-2/3 mb-2' />
      <Skeleton className='h-5 w-1/2' />
    </div>
  )
}

export default function ProductGrid({ books, isLoading, viewMode }: ProductGridProps) {
  if (isLoading) {
    return (
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
            : 'flex flex-col gap-3'
        }
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <BookCardSkeleton key={i} viewMode={viewMode} />
        ))}
      </div>
    )
  }

  if (!books || books.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-center'>
        <img
          src='/images/empty-books.svg'
          alt='Không có sản phẩm'
          className='w-32 h-32 opacity-40 mb-4'
        />
        <p className='text-gray-500 font-medium'>Không tìm thấy sản phẩm nào</p>
        <p className='text-gray-400 text-sm mt-1'>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
      </div>
    )
  }

  return (
    <div
      className={
        viewMode === 'list'
          ? 'flex flex-col gap-3'
          : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
      }
    >
      {books.map((book) => (
        // Sử dụng BookCard dùng chung và truyền viewMode vào đây
        <BookCard key={book.id} book={book} viewMode={viewMode} />
      ))}
    </div>
  )
}
