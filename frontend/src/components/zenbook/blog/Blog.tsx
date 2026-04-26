import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Flame,
  Eye,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { getPublicNewsApi, getNewsStatsApi, getPublicCategoriesApi } from '@/services/news/news.api'

import type {
  NewsResponse,
  NewsPageResponse,
  NewsStatsResponse,
  NewsQueryParams
} from '@/services/news/news.type'

import type { CategoryResponse } from '@/services/category/category.type'
import BreadcrumbHeader from '../breadcrumb/BreadCrumbHeader'

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 9

// Bảng màu badge theo index danh mục (vòng lặp khi vượt quá 6)
const BADGE_PALETTE = [
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface CategoryBadgeProps {
  color: string
  label?: string | null
  small?: boolean
}

function CategoryBadge({ color, label, small = false }: CategoryBadgeProps) {
  if (!label) return null
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${
        small ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${color}`}
    >
      {label}
    </span>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function FeaturedSkeleton() {
  return (
    <div className='rounded-2xl border border-border bg-card overflow-hidden mb-8 animate-pulse'>
      <div className='flex flex-col md:flex-row'>
        <div className='md:w-[55%] h-56 md:h-64 bg-muted shrink-0' />
        <div className='flex-1 p-6 md:p-8 flex flex-col gap-4'>
          <div className='h-5 w-28 bg-muted rounded-full' />
          <div className='space-y-2'>
            <div className='h-6 bg-muted rounded-lg w-full' />
            <div className='h-6 bg-muted rounded-lg w-4/5' />
          </div>
          <div className='space-y-1.5 mt-2'>
            <div className='h-4 bg-muted rounded w-full' />
            <div className='h-4 bg-muted rounded w-3/4' />
          </div>
          <div className='flex gap-4 mt-auto'>
            <div className='h-3 w-20 bg-muted rounded' />
            <div className='h-3 w-16 bg-muted rounded' />
          </div>
        </div>
      </div>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className='rounded-2xl border border-border bg-card overflow-hidden animate-pulse flex flex-col'>
      <div className='h-44 bg-muted shrink-0' />
      <div className='p-4 flex flex-col gap-3 flex-1'>
        <div className='h-4 w-20 bg-muted rounded-full' />
        <div className='space-y-1.5'>
          <div className='h-4 bg-muted rounded w-full' />
          <div className='h-4 bg-muted rounded w-3/4' />
        </div>
        <div className='h-3 bg-muted rounded w-full mt-1' />
        <div className='h-3 bg-muted rounded w-2/3' />
        <div className='flex justify-between mt-auto pt-3 border-t border-border'>
          <div className='h-3 w-16 bg-muted rounded' />
          <div className='h-3 w-14 bg-muted rounded' />
        </div>
      </div>
    </div>
  )
}

// ── Featured Post ─────────────────────────────────────────────────────────────

interface FeaturedPostProps {
  post: NewsResponse
  categoryColor: string
  onRead: (post: NewsResponse) => void
}

function FeaturedPost({ post, categoryColor, onRead }: FeaturedPostProps) {
  return (
    <div
      onClick={() => onRead(post)}
      className='group relative rounded-2xl overflow-hidden border border-border bg-card hover:shadow-md transition-all cursor-pointer mb-8'
    >
      <div className='flex flex-col md:flex-row'>
        {/* Image */}
        <div className='relative md:w-[55%] shrink-0 overflow-hidden'>
          {post.thumbnail ? (
            <img
              src={post.thumbnail}
              alt={post.title}
              className='w-full h-56 md:h-full object-cover group-hover:scale-105 transition-transform duration-500'
            />
          ) : (
            <div className='w-full h-56 md:h-full bg-muted flex items-center justify-center'>
              <BookOpen className='w-12 h-12 text-muted-foreground/30' />
            </div>
          )}

          {post.isTrending && (
            <div className='absolute top-4 left-4 flex items-center gap-1.5 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full'>
              <Flame className='w-3.5 h-3.5' />
              Trending
            </div>
          )}
          <div className='absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full'>
            Nổi bật
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 p-6 md:p-8 flex flex-col justify-between'>
          <div>
            <CategoryBadge color={categoryColor} label={post.categoryName} />
            <h2 className='text-xl md:text-2xl font-bold text-foreground mt-3 mb-3 leading-tight group-hover:text-brand-green transition-colors line-clamp-3'>
              {post.title}
            </h2>
            {post.summary && (
              <p className='text-sm text-muted-foreground leading-relaxed line-clamp-3'>
                {post.summary}
              </p>
            )}
          </div>

          <div className='flex items-center justify-between mt-6'>
            <div className='flex items-center gap-4 text-xs text-muted-foreground'>
              <span className='flex items-center gap-1.5'>
                <Eye className='w-3.5 h-3.5' />
                {post.viewCount.toLocaleString('vi-VN')} lượt xem
              </span>
              <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
            </div>
            <button className='flex items-center gap-1.5 text-sm font-semibold text-brand-green group-hover:gap-2.5 transition-all'>
              Đọc ngay
              <ArrowRight className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Post Card ─────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: NewsResponse
  categoryColor: string
  onRead: (post: NewsResponse) => void
}

function PostCard({ post, categoryColor, onRead }: PostCardProps) {
  return (
    <div
      onClick={() => onRead(post)}
      className='group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col'
    >
      {/* Image */}
      <div className='relative overflow-hidden h-44 shrink-0'>
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.title}
            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
          />
        ) : (
          <div className='w-full h-full bg-muted flex items-center justify-center'>
            <BookOpen className='w-8 h-8 text-muted-foreground/30' />
          </div>
        )}
        {post.isTrending && (
          <div className='absolute top-3 left-3 flex items-center gap-1 bg-orange-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full'>
            <Flame className='w-3 h-3' />
            Hot
          </div>
        )}
      </div>

      {/* Content */}
      <div className='flex flex-col flex-1 p-4'>
        <CategoryBadge color={categoryColor} label={post.categoryName} small />
        <h3 className='text-sm font-semibold text-foreground mt-2 mb-2 leading-snug line-clamp-2 group-hover:text-brand-green transition-colors'>
          {post.title}
        </h3>
        {post.summary && (
          <p className='text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1'>
            {post.summary}
          </p>
        )}

        <div className='flex items-center justify-between mt-4 pt-3 border-t border-border'>
          <div className='flex items-center gap-3 text-[11px] text-muted-foreground'>
            <span className='flex items-center gap-1'>
              <Eye className='w-3 h-3' />
              {formatViews(post.viewCount)}
            </span>
          </div>
          <span className='text-[11px] text-muted-foreground'>
            {formatDate(post.publishedAt ?? post.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Error State ───────────────────────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className='flex flex-col items-center justify-center py-20 text-center'>
      <div className='w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4'>
        <AlertCircle className='w-9 h-9 text-destructive' />
      </div>
      <h3 className='font-semibold text-foreground mb-1'>Không thể tải bài viết</h3>
      <p className='text-sm text-muted-foreground mb-4'>Đã có lỗi xảy ra, vui lòng thử lại.</p>
      <button
        onClick={onRetry}
        className='px-6 py-2.5 rounded-xl bg-brand-green text-white text-sm font-medium hover:bg-brand-green/90 transition-colors'
      >
        Thử lại
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className='flex flex-col items-center justify-center py-20 text-center'>
      <div className='w-20 h-20 rounded-full bg-brand-green/10 flex items-center justify-center mb-4'>
        <Search className='w-9 h-9 text-brand-green' />
      </div>
      <h3 className='font-semibold text-foreground mb-1'>Không tìm thấy bài viết</h3>
      <p className='text-sm text-muted-foreground'>Thử thay đổi từ khoá hoặc danh mục khác nhé!</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Blog() {
  const navigate = useNavigate()

  // ── Filter state ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(0)

  // ── Data state ────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [posts, setPosts] = useState<NewsResponse[]>([])
  const [featuredPost, setFeaturedPost] = useState<NewsResponse | null>(null)
  const [stats, setStats] = useState<NewsStatsResponse | null>(null)
  const [pageInfo, setPageInfo] = useState<Omit<NewsPageResponse, 'content'> | null>(null)

  // ── Loading / error ───────────────────────────────────────────────────────
  const [loadingInit, setLoadingInit] = useState(true)
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(false)

  // ── Debounce ref ──────────────────────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Category color map (theo index, vòng lặp palette) ────────────────────
  const categoryColorMap = useRef<Map<string, string>>(new Map())

  function getCategoryColor(categoryId?: string | null): string {
    if (!categoryId) return BADGE_PALETTE[0]
    if (!categoryColorMap.current.has(categoryId)) {
      const idx = categoryColorMap.current.size % BADGE_PALETTE.length
      categoryColorMap.current.set(categoryId, BADGE_PALETTE[idx])
    }
    return categoryColorMap.current.get(categoryId)!
  }

  // ── Initial load: categories + stats + featured ───────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoadingInit(true)
      setError(false)
      try {
        const [cats, statsData] = await Promise.all([
          getPublicCategoriesApi(),
          getNewsStatsApi(),
          getPublicNewsApi({ page: 0, size: 1 }) // featured post — lấy bài đầu để kiểm tra
        ])
        setCategories(cats)
        setStats(statsData)

        // Tìm featured riêng: gọi thêm 1 request hoặc lọc từ list
        // Ở đây dùng cách lọc từ posts đầu tiên (trang 0, không lọc)
        const firstPage = await getPublicNewsApi({ page: 0, size: PAGE_SIZE })
        const featured = firstPage.content.find((p) => p.isFeatured) ?? null
        setFeaturedPost(featured)

        // Posts chính (loại trừ featured)
        const mainContent = firstPage.content.filter((p) => !p.isFeatured)
        setPosts(mainContent)
        const { content: _, ...info } = firstPage
        setPageInfo(info)
      } catch {
        setError(true)
      } finally {
        setLoadingInit(false)
      }
    }
    init()
  }, [])

  // ── Fetch posts khi filter thay đổi (debounced search) ───────────────────
  const fetchPosts = useCallback(
    async (page: number, append = false) => {
      if (page === 0 && !append) setLoadingPosts(true)
      else setLoadingMore(true)

      setError(false)
      try {
        const params: NewsQueryParams = {
          page,
          size: PAGE_SIZE,
          search: searchQuery.trim() || undefined,
          categoryId: activeCategoryId === 'all' ? undefined : activeCategoryId
        }
        const res = await getPublicNewsApi(params)

        // Chỉ show featured khi ở tab "tất cả" và không có search
        const shouldShowFeatured = activeCategoryId === 'all' && !searchQuery.trim()
        const filtered = shouldShowFeatured
          ? res.content.filter((p) => p.id !== featuredPost?.id)
          : res.content

        setPosts((prev) => (append ? [...prev, ...filtered] : filtered))
        const info = (({ content, ...rest }) => rest)(res)
        setPageInfo(info)
      } catch {
        setError(true)
      } finally {
        setLoadingPosts(false)
        setLoadingMore(false)
      }
    },
    [searchQuery, activeCategoryId, featuredPost?.id]
  )

  // Khi category thay đổi → reset page, fetch ngay
  useEffect(() => {
    setCurrentPage(0)
    fetchPosts(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategoryId])

  // Khi search thay đổi → debounce 350ms rồi fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setCurrentPage(0)
      fetchPosts(0)
    }, 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  // ── Load more ─────────────────────────────────────────────────────────────
  const handleLoadMore = () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    fetchPosts(nextPage, true)
  }

  // ── Navigate to post detail ───────────────────────────────────────────────
  const handleRead = async (post: NewsResponse) => {
    navigate(`/blog/${post.slug}`)
  }

  // ── Retry ─────────────────────────────────────────────────────────────────
  const handleRetry = () => {
    fetchPosts(currentPage)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const isFirstLoad = loadingInit
  const showFeatured = featuredPost && activeCategoryId === 'all' && !searchQuery.trim()

  return (
    <div className='flex-1 min-w-0 w-full flex flex-col'>
      <BreadcrumbHeader />

      <div className='max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6'>
        {/* Header (Đã xóa breadcrumb cứng đi) */}
        <div className='mb-6'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div>
              <h1 className='text-2xl font-bold text-foreground'>Blog & Bài viết</h1>
              <p className='text-sm text-muted-foreground mt-0.5'>
                Kiến thức dinh dưỡng, công thức nấu ăn và lối sống lành mạnh
              </p>
            </div>

            <div className='relative sm:w-64'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <input
                type='text'
                placeholder='Tìm kiếm bài viết...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-green/40 placeholder:text-muted-foreground'
              />
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className='flex items-center gap-6 mb-6 px-4 py-3 rounded-xl bg-brand-green/5 border border-brand-green/10'>
          <div className='flex items-center gap-2 text-sm'>
            <BookOpen className='w-4 h-4 text-brand-green' />
            {stats ? (
              <>
                <span className='font-semibold text-foreground'>{stats.totalPosts}</span>
                <span className='text-muted-foreground'>bài viết</span>
              </>
            ) : (
              <div className='h-4 w-20 bg-muted rounded animate-pulse' />
            )}
          </div>
          <div className='w-px h-4 bg-border' />
          <div className='flex items-center gap-2 text-sm'>
            <TrendingUp className='w-4 h-4 text-brand-green' />
            {stats ? (
              <>
                <span className='font-semibold text-foreground'>{stats.trendingPosts}</span>
                <span className='text-muted-foreground'>đang trending</span>
              </>
            ) : (
              <div className='h-4 w-24 bg-muted rounded animate-pulse' />
            )}
          </div>
          <div className='w-px h-4 bg-border' />
          <div className='flex items-center gap-2 text-sm'>
            <Eye className='w-4 h-4 text-brand-green' />
            {stats ? (
              <>
                <span className='font-semibold text-foreground'>
                  {formatViews(stats.totalViews)}
                </span>
                <span className='text-muted-foreground'>lượt đọc</span>
              </>
            ) : (
              <div className='h-4 w-16 bg-muted rounded animate-pulse' />
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className='flex items-center gap-2 flex-wrap mb-6'>
          {/* Tab "Tất cả" */}
          <button
            onClick={() => setActiveCategoryId('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              activeCategoryId === 'all'
                ? 'bg-brand-green text-white border-brand-green'
                : 'border-border text-muted-foreground hover:border-brand-green/50 hover:text-brand-green bg-transparent'
            }`}
          >
            Tất cả
          </button>

          {/* Skeleton categories khi chưa load */}
          {isFirstLoad
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='h-9 w-28 bg-muted rounded-full animate-pulse' />
              ))
            : categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    activeCategoryId === cat.id
                      ? 'bg-brand-green text-white border-brand-green'
                      : 'border-border text-muted-foreground hover:border-brand-green/50 hover:text-brand-green bg-transparent'
                  }`}
                >
                  {cat.categoryName}
                </button>
              ))}
        </div>

        {/* Error */}
        {error && !isFirstLoad && <ErrorState onRetry={handleRetry} />}

        {/* Content */}
        {!error && (
          <>
            {/* Featured Post */}
            {isFirstLoad ? (
              <FeaturedSkeleton />
            ) : (
              showFeatured && (
                <FeaturedPost
                  post={featuredPost!}
                  categoryColor={getCategoryColor(featuredPost!.categoryId)}
                  onRead={handleRead}
                />
              )
            )}

            {/* Post Grid */}
            {isFirstLoad || loadingPosts ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <EmptyState />
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    categoryColor={getCategoryColor(post.categoryId)}
                    onRead={handleRead}
                  />
                ))}
              </div>
            )}

            {/* Load more */}
            {!isFirstLoad && !loadingPosts && posts.length > 0 && pageInfo && !pageInfo.last && (
              <div className='flex justify-center mt-10'>
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className='flex items-center gap-2 px-8 py-3 rounded-xl border border-brand-green text-brand-green text-sm font-semibold hover:bg-brand-green hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className='w-4 h-4 animate-spin' />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      Xem thêm bài viết
                      <ArrowRight className='w-4 h-4' />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
