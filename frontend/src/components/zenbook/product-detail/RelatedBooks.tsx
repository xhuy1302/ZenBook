import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getBooksApi } from '@/services/book/book.api'
import { ProductGrid } from '@/components/zenbook/product-list'
// Import BookResponse để lấy định dạng của categories
import type { BookResponse } from '@/services/book/book.type'

interface RelatedBooksProps {
  // Sử dụng Indexed Access Types để lấy đúng type của categories từ BookResponse
  categories?: BookResponse['categories']
  currentBookId?: string // Thêm prop này để lọc bỏ cuốn sách đang xem ra khỏi danh sách gợi ý
}

export default function RelatedBooks({ categories, currentBookId }: RelatedBooksProps) {
  const { t } = useTranslation('common')

  // Lấy ID của danh mục đầu tiên
  const categoryId = categories && categories.length > 0 ? categories[0].id : undefined

  const { data: response, isLoading } = useQuery({
    queryKey: ['relatedBooks', categoryId],
    queryFn: () =>
      getBooksApi({
        categoryIds: categoryId ? [categoryId] : undefined,
        page: 1,
        // 👉 TĂNG LÊN 6: Lấy 6 cuốn để sau khi filter cuốn hiện tại còn lại tối đa 5 cuốn
        size: 6,
        sortBy: 'createdAt',
        sortDir: 'desc'
      }),
    enabled: !!categoryId
  })

  // 👉 SỬA LẠI LOGIC: Lọc bỏ cuốn sách hiện tại và lấy tối đa 5 cuốn (thay vì 4)
  const books = (response?.content ?? []).filter((b) => b.id !== currentBookId).slice(0, 5)

  if (!isLoading && books.length === 0) return null

  return (
    // 👉 GIẢM gap: Giảm gap dọc của container chính xuống gap-3
    <div className='flex flex-col gap-3'>
      <div className='flex items-center gap-2 mb-1'>
        <div className='w-1 h-5 bg-[#c92127] rounded-sm' />
        <h2 className='text-sm font-bold text-gray-900 uppercase tracking-wide'>
          {t('product.relatedBooks', 'Sản phẩm tương tự')}
        </h2>
      </div>

      {/* 👉 BỌC PRODUCTGRID VÀ ÉP CSS ĐỂ THU NHỎ CARD
          - [&>div]:grid: Tìm thẻ div trực tiếp bên trong (container của ProductGrid) và đặt là grid.
          - [&>div]:grid-cols-2: Mobile hiện 2 cột.
          - [&>div]:sm:grid-cols-3: Tablet nhỏ hiện 3 cột.
          - [&>div]:md:grid-cols-4: Tablet lớn hiện 4 cột.
          - [&>div]:lg:grid-cols-5: Desktop hiện 5 cột (giúp card nhỏ lại).
          - [&>div]:gap-3: Giảm khoảng cách giữa các card xuống còn 12px (thay vì 16px hay 24px mặc định).
      */}
      <div className='[&>div]:grid [&>div]:grid-cols-2 [&>div]:sm:grid-cols-3 [&>div]:md:grid-cols-4 [&>div]:lg:grid-cols-5 [&>div]:gap-3'>
        <ProductGrid books={books} isLoading={isLoading} viewMode='grid' />
      </div>
    </div>
  )
}
