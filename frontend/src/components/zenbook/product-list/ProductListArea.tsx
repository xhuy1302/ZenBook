'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

import {
  ProductFilterSidebar,
  ProductGrid,
  ProductPagination,
  ProductSortBar
} from '@/components/zenbook/product-list'
import type { FilterState, SortOption, ViewMode } from '@/components/zenbook/product-list'

import { getBooksApi, getStorePriceRangeApi } from '@/services/book/book.api'
import { getAuthorsForFilterApi } from '@/services/author/author.api'
import { getCategoriesForFilterApi } from '@/services/category/category.api'
import { getPublishersForFilterApi } from '@/services/publisher/publisher.api'

const PAGE_SIZE = 12

const DEFAULT_FILTERS: FilterState = {
  categoryIds: [],
  authorIds: [],
  publisherIds: [],
  formats: [],
  languages: [],
  minPrice: 0,
  maxPrice: 99999999, // Mặc định là vô cực để làm cờ đánh dấu
  minRating: null
}

interface ProductListAreaProps {
  onTotalChange?: (total: number) => void
}

export default function ProductListArea({ onTotalChange }: ProductListAreaProps) {
  const [searchParams, setSearchParams] = useSearchParams()

  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const keyword = searchParams.get('q') || ''

  // 1. LẤY KHOẢNG GIÁ ĐỘNG TỪ BACKEND
  const { data: priceRangeData } = useQuery({
    queryKey: ['storePriceRange'],
    queryFn: getStorePriceRangeApi,
    staleTime: 60 * 60 * 1000
  })

  const dynamicMaxPrice = priceRangeData?.maxPrice || 500000

  // 2. GIẢI PHÁP THAY THẾ USE-EFFECT: TẠO DISPLAY FILTERS
  const displayFilters = useMemo(
    () => ({
      ...filters,
      maxPrice: filters.maxPrice === 99999999 ? dynamicMaxPrice : filters.maxPrice
    }),
    [filters, dynamicMaxPrice]
  )

  useEffect(() => {
    const params: Record<string, string> = {}
    if (page > 1) params.page = String(page)
    if (sort !== 'newest') params.sort = sort
    if (keyword) params.q = keyword
    setSearchParams(params, { replace: true })
  }, [page, sort, keyword, setSearchParams])

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

  const { data: booksResponse, isLoading: booksLoading } = useQuery({
    queryKey: ['books', page, sort, displayFilters, keyword],
    queryFn: () =>
      getBooksApi({
        page,
        size: PAGE_SIZE,
        sortBy: sortParams.sortBy,
        sortDir: sortParams.sortDir,
        keyword: keyword || undefined,
        minPrice: displayFilters.minPrice > 0 ? displayFilters.minPrice : undefined,
        maxPrice: displayFilters.maxPrice < dynamicMaxPrice ? displayFilters.maxPrice : undefined,
        minRating: displayFilters.minRating || undefined,
        categoryIds: displayFilters.categoryIds.length > 0 ? displayFilters.categoryIds : undefined,
        authorIds: displayFilters.authorIds.length > 0 ? displayFilters.authorIds : undefined,
        publisherIds:
          displayFilters.publisherIds.length > 0 ? displayFilters.publisherIds : undefined,
        formats: displayFilters.formats.length > 0 ? displayFilters.formats : undefined,
        languages: displayFilters.languages.length > 0 ? displayFilters.languages : undefined
      }),
    staleTime: 2 * 60 * 1000
  })

  const booksToDisplay = booksResponse?.content || []
  const totalPages = booksResponse?.page?.totalPages || 0
  const totalElements = booksResponse?.page?.totalElements || 0

  useEffect(() => {
    if (onTotalChange) {
      onTotalChange(totalElements)
    }
  }, [totalElements, onTotalChange])

  const { data: authorsData } = useQuery({
    queryKey: ['authorsSidebar'],
    queryFn: getAuthorsForFilterApi,
    staleTime: 5 * 60 * 1000
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categoriesSidebar'],
    queryFn: getCategoriesForFilterApi,
    staleTime: 5 * 60 * 1000
  })

  const { data: publishersData } = useQuery({
    queryKey: ['publishersSidebar'],
    queryFn: getPublishersForFilterApi,
    staleTime: 5 * 60 * 1000
  })

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort)
    setPage(1)
  }

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

  if (displayFilters.minPrice > 0 || displayFilters.maxPrice < dynamicMaxPrice) {
    activeFilterTags.push({
      label: `${new Intl.NumberFormat('vi-VN').format(displayFilters.minPrice)}₫ – ${new Intl.NumberFormat('vi-VN').format(displayFilters.maxPrice)}₫`,
      onRemove: () => handleFilterChange({ ...filters, minPrice: 0, maxPrice: 99999999 })
    })
  }

  return (
    <div className='max-w-7xl mx-auto px-4 pt-4 pb-12'>
      <div className='flex flex-col lg:flex-row gap-6 items-start'>
        {/* CỘT TRÁI - SIDEBAR LỌC (Đã mở rộng xl:w-[280px] để Sidebar mới có không gian) */}
        <div className='hidden lg:block w-[260px] xl:w-[280px] shrink-0 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
          <ProductFilterSidebar
            filters={displayFilters}
            onFilterChange={handleFilterChange}
            categories={categoriesData || []}
            authors={authorsData || []}
            publishers={publishersData || []}
            maxPriceAllowed={dynamicMaxPrice}
          />
        </div>

        <div className='flex-1 min-w-0'>
          <ProductSortBar
            sort={sort}
            onSortChange={handleSortChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            total={totalElements}
            isLoading={booksLoading}
          />

          <div className='mt-4 flex flex-col gap-4'>
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant='outline'
                  className='h-10 px-4 border-slate-200 rounded-xl lg:hidden w-fit text-[13px] font-bold text-slate-700 hover:bg-slate-50'
                >
                  <SlidersHorizontal className='w-4 h-4 mr-2' strokeWidth={2.5} /> Lọc sản phẩm
                </Button>
              </SheetTrigger>
              <SheetContent side='left' className='w-[320px] p-0 overflow-y-auto bg-slate-50'>
                <SheetHeader className='p-5 bg-white border-b border-slate-200 sticky top-0 z-10'>
                  <SheetTitle className='text-left font-black tracking-tight text-slate-900'>
                    Bộ Lọc Sản Phẩm
                  </SheetTitle>
                </SheetHeader>
                <div className='p-4'>
                  <ProductFilterSidebar
                    filters={displayFilters}
                    onFilterChange={(f) => {
                      handleFilterChange(f)
                      setMobileFilterOpen(false)
                    }}
                    categories={categoriesData || []}
                    authors={authorsData || []}
                    publishers={publishersData || []}
                    maxPriceAllowed={dynamicMaxPrice}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          {booksLoading ? (
            <div className='h-[400px] flex items-center justify-center bg-white rounded-2xl border border-slate-200 mt-5 shadow-sm'>
              <div className='flex flex-col items-center gap-3'>
                <Loader2 className='w-8 h-8 animate-spin text-brand-green' />
                <span className='text-[14px] font-semibold text-slate-500'>Đang tải sách...</span>
              </div>
            </div>
          ) : (
            <div className='mt-5'>
              <ProductGrid books={booksToDisplay} isLoading={false} viewMode={viewMode} />
              <div className='mt-12 mb-6 flex justify-center'>
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
