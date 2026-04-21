'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

import {
  ProductFilterSidebar,
  ProductGrid,
  ProductPagination,
  ProductSortBar
} from '@/components/zenbook/product-list'
import type { FilterState, SortOption, ViewMode } from '@/components/zenbook/product-list'

// 👉 ĐÃ SỬA: Import API lọc và phân trang từ Backend
import { getBooksApi } from '@/services/book/book.api'

// Import các API lấy danh mục, tác giả (Nếu bạn đã có file API này, hãy mở comment ra)
// import { getCategoriesApi } from '@/services/category/category.api'
// import { getAuthorsApi } from '@/services/author/author.api'
// import { getPublishersApi } from '@/services/publisher/publisher.api'

const PAGE_SIZE = 12 // Hiển thị 12 cuốn sách 1 trang cho đẹp (dạng lưới 4x3)

const DEFAULT_FILTERS: FilterState = {
  categoryIds: [],
  authorIds: [],
  publisherIds: [],
  minPrice: 0,
  maxPrice: 500000,
  minRating: null
}

// 👉 THÊM MỚI: Định nghĩa interface để nhận prop onTotalChange từ component cha
interface ProductListAreaProps {
  onTotalChange?: (total: number) => void
}

export default function ProductListArea({ onTotalChange }: ProductListAreaProps) {
  const [searchParams, setSearchParams] = useSearchParams()

  // 1. STATES
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const keyword = searchParams.get('q') || ''

  // 2. ĐỒNG BỘ URL PARAMS
  useEffect(() => {
    const params: Record<string, string> = {}
    if (page > 1) params.page = String(page)
    if (sort !== 'newest') params.sort = sort
    if (keyword) params.q = keyword
    setSearchParams(params, { replace: true })
  }, [page, sort, keyword, setSearchParams])

  // 3. CHUYỂN ĐỔI SORT OPTION CỦA FRONTEND THÀNH THAM SỐ CHO BACKEND
  const sortParams = useMemo(() => {
    switch (sort) {
      case 'price_asc':
        return { sortBy: 'salePrice', sortDir: 'asc' as const }
      case 'price_desc':
        return { sortBy: 'salePrice', sortDir: 'desc' as const }
      case 'bestseller':
        return { sortBy: 'soldQuantity', sortDir: 'desc' as const }
      case 'rating':
        return { sortBy: 'rating', sortDir: 'desc' as const }
      case 'newest':
      default:
        return { sortBy: 'createdAt', sortDir: 'desc' as const }
    }
  }, [sort])

  // 4. GỌI API LẤY SÁCH TỪ DATABASE (Server-side Pagination & Filtering)
  const { data: booksResponse, isLoading: booksLoading } = useQuery({
    queryKey: ['books', page, sort, filters, keyword],
    queryFn: () =>
      getBooksApi({
        page,
        size: PAGE_SIZE,
        sortBy: sortParams.sortBy,
        sortDir: sortParams.sortDir,
        keyword: keyword || undefined,
        minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
        maxPrice: filters.maxPrice < 500000 ? filters.maxPrice : undefined,
        // API Backend của bạn đang nhận List<String> categoryIds, nên map từ number sang string
        categoryIds: filters.categoryIds.length > 0 ? filters.categoryIds.map(String) : undefined
      }),
    staleTime: 2 * 60 * 1000 // Cache 2 phút
  })

  // Bóc tách dữ liệu từ API trả về (Dựa theo PageResponse của Spring Boot)
  const booksToDisplay = booksResponse?.content || []
  const totalPages = booksResponse?.page?.totalPages || 0
  const totalElements = booksResponse?.page?.totalElements || 0

  // 👉 THÊM MỚI: Báo cáo tổng số kết quả lên component cha (ProductListPage)
  useEffect(() => {
    if (onTotalChange) {
      onTotalChange(totalElements)
    }
  }, [totalElements, onTotalChange])

  // 5. GỌI API LẤY DANH MỤC, TÁC GIẢ CHO SIDEBAR LỌC
  // (Tạm thời Mock nếu chưa có API, nếu có thì thay bằng useQuery)
  const { data: categoriesData } = useQuery({
    queryKey: ['categoriesSidebar'],
    queryFn: async () => {
      // return await getCategoriesApi()
      return [
        { id: 1, name: 'Văn học' },
        { id: 2, name: 'Kinh tế' },
        { id: 3, name: 'Tâm lý - Kỹ năng' }
      ] // Dữ liệu giả định tạm thời
    }
  })

  // 6. XỬ LÝ SỰ KIỆN
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1) // Quay về trang 1 khi đổi bộ lọc
  }

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort)
    setPage(1)
  }

  // 7. HIỂN THỊ TAG ĐANG LỌC
  const activeFilterTags: { label: string; onRemove: () => void }[] = []
  if (keyword) {
    activeFilterTags.push({
      label: `Từ khóa: "${keyword}"`,
      onRemove: () => {
        const params = new URLSearchParams(searchParams)
        params.delete('q')
        setSearchParams(params)
      }
    })
  }
  if (filters.minPrice > 0 || filters.maxPrice < 500000) {
    activeFilterTags.push({
      label: `${new Intl.NumberFormat('vi-VN').format(filters.minPrice)}₫ – ${new Intl.NumberFormat('vi-VN').format(filters.maxPrice)}₫`,
      onRemove: () => handleFilterChange({ ...filters, minPrice: 0, maxPrice: 500000 })
    })
  }
  // Nếu bạn lọc thêm category thì có thể push thêm tag ở đây

  return (
    <div className='max-w-7xl mx-auto px-4 pt-4 pb-12'>
      <div className='flex flex-col lg:flex-row gap-6 items-start'>
        {/* CỘT TRÁI - SIDEBAR LỌC */}
        <div className='hidden lg:block w-[260px] shrink-0 sticky top-4'>
          <ProductFilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            categories={categoriesData || []}
            // authors={authorsData}
            // publishers={publishersData}
          />
        </div>

        {/* CỘT PHẢI - SẢN PHẨM */}
        <div className='flex-1 min-w-0'>
          {/* Thanh Sắp xếp */}
          <ProductSortBar
            sort={sort}
            onSortChange={handleSortChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            total={totalElements}
            isLoading={booksLoading}
          />

          {/* Lọc trên Mobile */}
          <div className='mt-3 flex flex-col gap-3'>
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant='outline'
                  className='h-9 px-3 border-gray-200 rounded-lg lg:hidden w-fit'
                >
                  <SlidersHorizontal className='w-4 h-4 mr-2' /> Lọc
                </Button>
              </SheetTrigger>
              <SheetContent side='left' className='w-80 p-4 overflow-y-auto'>
                <SheetHeader className='mb-4'>
                  <SheetTitle>Lọc sản phẩm</SheetTitle>
                </SheetHeader>
                <ProductFilterSidebar
                  filters={filters}
                  onFilterChange={(f) => {
                    handleFilterChange(f)
                    setMobileFilterOpen(false)
                  }}
                  categories={categoriesData || []}
                />
              </SheetContent>
            </Sheet>

            {/* Tags đang lọc */}
            {activeFilterTags.length > 0 && (
              <div className='flex items-center gap-2 flex-wrap'>
                <span className='text-[10px] font-bold text-gray-400 uppercase'>Đang lọc:</span>
                {activeFilterTags.map((tag, i) => (
                  <Badge
                    key={i}
                    variant='outline'
                    className='flex items-center gap-1 text-[11px] border-brand-green/30 text-brand-green bg-brand-green/5'
                  >
                    {tag.label}
                    <button onClick={tag.onRemove} className='ml-1 hover:text-brand-red'>
                      <X className='w-3 h-3' />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Lưới sản phẩm tải từ Backend */}
          {booksLoading ? (
            <div className='h-[400px] flex items-center justify-center bg-white rounded-xl border border-gray-100 mt-4 shadow-sm'>
              <div className='flex flex-col items-center gap-2'>
                <Loader2 className='w-8 h-8 animate-spin text-brand-green' />
                <span className='text-sm text-gray-500'>Đang tải sách...</span>
              </div>
            </div>
          ) : (
            <div className='mt-4'>
              <ProductGrid books={booksToDisplay} isLoading={false} viewMode={viewMode} />

              {/* Phân trang */}
              <div className='mt-10 mb-4 flex justify-center'>
                <ProductPagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
