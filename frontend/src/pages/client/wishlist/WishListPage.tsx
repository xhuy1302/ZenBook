'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Search, Grid, List, HeartCrack, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { getMyWishlistApi } from '@/services/wishlist/wishlist.api'
import BookCard from '@/components/zenbook/homepage/BookCard'
import type { BookResponse } from '@/services/book/book.type'
import BreadcrumbHeader from '@/components/zenbook/breadcrumb/BreadCrumbHeader'

// ==========================================
// SUB-COMPONENTS
// ==========================================

function WishlistHeader({ totalItems }: { totalItems: number }) {
  const { t } = useTranslation('wishlist')
  return (
    <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10'>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className='space-y-4'
      >
        <BreadcrumbHeader />
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-foreground mb-2'>{t('title')}</h1>
          <p className='text-sm text-muted-foreground'>{t('description')}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className='flex gap-4'
      >
        <Card className='p-4 rounded-2xl flex items-center gap-4 bg-emerald-50/50 border-emerald-100/50 shadow-sm'>
          <div className='p-3 bg-white rounded-xl shadow-sm text-emerald-600'>
            <Heart className='w-5 h-5 fill-emerald-600' />
          </div>
          <div>
            <p className='text-sm font-medium text-muted-foreground'>{t('totalItems')}</p>
            <p className='text-xl font-bold text-emerald-950'>{totalItems}</p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

function WishlistToolbar({
  viewMode,
  setViewMode,
  keyword,
  setKeyword,
  sortBy,
  setSortBy
}: {
  viewMode: string
  setViewMode: (v: string) => void
  keyword: string
  setKeyword: (v: string) => void
  sortBy: string
  setSortBy: (v: string) => void
}) {
  const { t } = useTranslation('wishlist')
  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100'>
      <div className='flex items-center gap-2 w-full sm:w-auto flex-1'>
        <div className='relative w-full max-w-sm'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={t('toolbar.searchPlaceholder')}
            className='pl-9 bg-slate-50/50 border-none rounded-xl focus-visible:ring-emerald-500 h-10 text-sm'
          />
        </div>
      </div>

      <div className='flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end'>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className='w-[160px] rounded-xl bg-slate-50/50 border-none text-sm'>
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>
          <SelectContent className='rounded-xl text-sm'>
            <SelectItem value='newest'>{t('toolbar.sortBy.newest')}</SelectItem>
            <SelectItem value='price-asc'>{t('toolbar.sortBy.priceAsc')}</SelectItem>
            <SelectItem value='price-desc'>{t('toolbar.sortBy.priceDesc')}</SelectItem>
          </SelectContent>
        </Select>

        <Tabs value={viewMode} onValueChange={setViewMode} className='w-[100px]'>
          <TabsList className='grid w-full grid-cols-2 rounded-xl h-10 bg-slate-50'>
            <TabsTrigger value='grid' className='rounded-lg'>
              <Grid className='w-4 h-4' />
            </TabsTrigger>
            <TabsTrigger value='list' className='rounded-lg'>
              <List className='w-4 h-4' />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}

function WishlistEmpty() {
  const { t } = useTranslation('wishlist')
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className='flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200'
    >
      <div className='w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6'>
        <HeartCrack className='w-12 h-12 text-rose-300' />
      </div>
      <h2 className='text-xl font-bold text-slate-900 mb-2'>{t('empty.title')}</h2>
      <p className='text-sm text-slate-500 max-w-md mb-8'>{t('empty.description')}</p>

      <Link to='/products'>
        <Button className='rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-8 text-sm'>
          {t('empty.cta')}
        </Button>
      </Link>
    </motion.div>
  )
}

// ==========================================
// MAIN PAGE
// ==========================================

export default function WishlistPage() {
  const { t } = useTranslation('wishlist')
  const [viewMode, setViewMode] = useState<string>('grid')

  // State tìm kiếm và sắp xếp
  const [keyword, setKeyword] = useState<string>('')
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('newest')

  // Debounce tìm kiếm (Tránh gọi API liên tục)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword)
    }, 500)
    return () => clearTimeout(timer)
  }, [keyword])

  // Lấy dữ liệu với React Query
  const {
    data: wishlistItems,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['my-wishlist', debouncedKeyword, sortBy],
    queryFn: () => getMyWishlistApi({ keyword: debouncedKeyword, sortBy })
  })

  if (isLoading) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-emerald-600' />
      </div>
    )
  }

  if (isError) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center text-rose-500 text-sm'>
        {t('error.loginRequired')}
      </div>
    )
  }

  const items = wishlistItems || []

  return (
    <div className='min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-200 selection:text-emerald-900'>
      <div className='max-w-7xl mx-auto'>
        <WishlistHeader totalItems={items.length} />

        {items.length > 0 || debouncedKeyword ? (
          <>
            <WishlistToolbar
              viewMode={viewMode}
              setViewMode={setViewMode}
              keyword={keyword}
              setKeyword={setKeyword}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            {items.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
                    : 'flex flex-col gap-4'
                }
              >
                {items.map((item) => {
                  const mappedBook = {
                    id: item.bookId,
                    title: item.title,
                    slug: item.slug,
                    salePrice: item.salePrice,
                    originalPrice: item.originalPrice,
                    discount: item.discount,
                    stockQuantity: item.stockQuantity,
                    soldQuantity: item.soldQuantity,
                    thumbnail: item.thumbnail,
                    status: item.status,

                    // Các trường dưới đây mock vì API wishlist không trả về
                    rating: 5,
                    reviews: 0,
                    authors: []
                  } as unknown as BookResponse

                  return (
                    <BookCard
                      key={item.bookId}
                      book={mappedBook}
                      viewMode={viewMode as 'grid' | 'list'}
                    />
                  )
                })}
              </div>
            ) : (
              <div className='py-20 text-center text-sm text-slate-500'>
                {`Không tìm thấy kết quả nào phù hợp với "${keyword}"`}
              </div>
            )}
          </>
        ) : (
          <WishlistEmpty />
        )}
      </div>
    </div>
  )
}
