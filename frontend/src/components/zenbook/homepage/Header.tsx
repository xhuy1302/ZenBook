import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  Search,
  User,
  Heart,
  ShoppingCart,
  MapPin,
  Package,
  Bell,
  ChevronDown,
  Menu,
  X,
  ShoppingBag,
  LogOut,
  UserCircle,
  Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import LocaleSwitcher from './LocaleSwitcher'
import { useAuth } from '@/context/AuthContext'
import type { User as UserType } from '@/context/AuthContext'

// ── User Section (Hover Menu) ─────────────────────────────────────────────────

interface UserSectionProps {
  authLoading: boolean
  isAuthenticated: boolean
  user: UserType | null
  onLogout: () => void
}

function UserSection({ authLoading, isAuthenticated, user, onLogout }: UserSectionProps) {
  const { t } = useTranslation('common')
  const navigate = useNavigate()

  if (authLoading) {
    return (
      <div className='flex items-center gap-2 px-2 py-1 w-32'>
        <Skeleton className='w-6 h-6 rounded-full' />
        <Skeleton className='w-16 h-3' />
      </div>
    )
  }

  return (
    <div className='relative group'>
      {/* 👉 TRIGGER: Icon + Chữ nằm ngang */}
      <Link
        to={isAuthenticated ? '/customer' : '/login'} // 👉 Sửa thành /customer theo App.tsx
        className='flex items-center gap-2 px-2 py-2 rounded hover:bg-neutral-100 transition-colors cursor-pointer'
      >
        {isAuthenticated && user?.avatar ? (
          <div className='w-6 h-6 rounded-full bg-brand-green flex items-center justify-center overflow-hidden border border-gray-200 shrink-0'>
            <img src={user.avatar} alt='avatar' className='w-full h-full object-cover' />
          </div>
        ) : (
          <User
            className='w-6 h-6 text-gray-700 group-hover:text-brand-green transition-colors shrink-0'
            strokeWidth={1.5}
          />
        )}
        <span className='text-sm font-medium text-gray-700 max-w-[90px] truncate hidden sm:block'>
          {isAuthenticated ? user?.username : t('header.account', 'Tài khoản')}
        </span>
      </Link>

      {/* 👉 DROPDOWN MENU */}
      <div className='absolute top-full right-0 pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'>
        <div className='bg-white border border-gray-100 shadow-xl rounded-lg overflow-hidden flex flex-col'>
          {!isAuthenticated ? (
            <div className='p-4 flex flex-col gap-3'>
              <p className='text-sm text-center text-gray-500 mb-1'>
                Đăng nhập để theo dõi đơn hàng và nhận ưu đãi.
              </p>
              <Button
                onClick={() => navigate('/login')}
                className='w-full bg-brand-green hover:bg-brand-green-dark text-white'
              >
                Đăng nhập
              </Button>
              <Button
                onClick={() => navigate('/signup')}
                variant='outline'
                className='w-full border-brand-green text-brand-green hover:bg-brand-green-light'
              >
                Tạo tài khoản
              </Button>
            </div>
          ) : (
            <>
              <div className='px-4 py-3 border-b border-gray-100 bg-gray-50/50'>
                <p className='text-sm font-bold text-gray-900 truncate'>{user?.username}</p>
                <p className='text-xs text-gray-500 truncate'>{user?.email}</p>
              </div>
              <div className='py-2 flex flex-col'>
                {/* 👉 ĐÃ SỬA CÁC ĐƯỜNG LINK DƯỚI ĐÂY CHO KHỚP VỚI APP.TSX */}

                <Link
                  to='/customer'
                  className='flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-green transition-colors'
                >
                  <UserCircle className='w-4 h-4 text-gray-400' /> Tài khoản của tôi
                </Link>
                <Link
                  to='/customer/orders'
                  className='flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-green transition-colors'
                >
                  <ShoppingBag className='w-4 h-4 text-gray-400' /> Đơn hàng của tôi
                </Link>
                <Link
                  to='/customer/address'
                  className='flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-green transition-colors'
                >
                  <MapPin className='w-4 h-4 text-gray-400' /> Sổ địa chỉ
                </Link>
              </div>
              <div className='py-2 border-t border-gray-100'>
                <button
                  onClick={onLogout}
                  className='flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors'
                >
                  <LogOut className='w-4 h-4' /> Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Header() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth()

  const [mobileOpen, setMobileOpen] = useState(false)

  // Fake data for UI matching
  const cartCount = 3
  const wishlistCount = 7

  const queryFromUrl = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(queryFromUrl)
  const [prevUrlQuery, setPrevUrlQuery] = useState(queryFromUrl)

  if (queryFromUrl !== prevUrlQuery) {
    setPrevUrlQuery(queryFromUrl)
    setSearchQuery(queryFromUrl)
  }

  const handleSearch = () => {
    const query = searchQuery.trim()
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
      setMobileOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsVisible(currentScrollY <= lastScrollY.current || currentScrollY <= 100)
      lastScrollY.current = currentScrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = [
    { label: t('header.nav.hot', 'Sách HOT'), href: '#' },
    { label: t('header.nav.newArrivals', 'Hàng Mới'), href: '#' },
    { label: t('header.nav.bestSellers', 'Bán Chạy'), href: '#' },
    { label: t('header.nav.promotion', 'Khuyến Mãi'), href: '#' }
  ]

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-card shadow-sm border-b border-border transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className='bg-brand-green text-primary-foreground'>
        <div className='max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between text-xs'>
          <div className='flex items-center gap-4'>
            <button className='flex items-center gap-1 hover:opacity-80 transition-opacity'>
              <MapPin className='w-3 h-3' />
              <span>
                {t('header.deliverTo')} {t('header.location')}
              </span>
              <ChevronDown className='w-3 h-3' />
            </button>
          </div>
          <div className='flex items-center gap-4'>
            <button className='flex items-center gap-1 hover:opacity-80 transition-opacity'>
              <Package className='w-3 h-3' />
              <span>{t('header.trackOrder')}</span>
            </button>
            <button className='flex items-center gap-1 hover:opacity-80 transition-opacity'>
              <Bell className='w-3 h-3' />
              <span>{t('header.newsletter')}</span>
            </button>
            <LocaleSwitcher />
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 py-3'>
        <div className='flex items-center gap-4'>
          <Link to='/' className='flex items-center gap-2 shrink-0'>
            <div className='w-9 h-9 rounded-lg bg-brand-green flex items-center justify-center'>
              <BookOpen className='w-5 h-5 text-primary-foreground' />
            </div>
            <div className='hidden sm:block'>
              <div className='font-serif font-bold text-lg text-foreground leading-none'>
                ZenBook
              </div>
              <div className='text-[10px] text-muted-foreground leading-none'>The Wise Owl</div>
            </div>
          </Link>

          <div className='flex-1 flex items-center gap-0 max-w-2xl'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input
                type='search'
                placeholder={t('header.searchPlaceholder')}
                className='pl-9 pr-4 h-10 rounded-r-none border-r-0 focus-visible:ring-brand-green/40 bg-neutral-50'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button
              onClick={handleSearch}
              className='h-10 px-5 rounded-l-none bg-brand-green hover:bg-brand-green-dark text-primary-foreground font-medium shrink-0'
            >
              {t('header.search')}
            </Button>
          </div>

          {/* 👉 KHU VỰC ACTION BAR 👈 */}
          <div className='flex items-center gap-1 shrink-0 ml-2'>
            {/* Nút Tài khoản */}
            <UserSection
              authLoading={authLoading}
              isAuthenticated={isAuthenticated}
              user={user}
              onLogout={handleLogout}
            />

            {/* ZenBook VIP */}
            {isAuthenticated && (
              <div className='hidden lg:flex items-center gap-2 px-2 py-2 rounded hover:bg-neutral-100 transition-colors cursor-pointer shrink-0'>
                <Crown className='w-6 h-6 text-[#d48806]' strokeWidth={1.5} />
                <span className='text-sm font-medium text-[#d48806]'>ZenBook VIP</span>
              </div>
            )}

            {/* Nút Yêu thích */}
            <button className='flex items-center gap-2 px-2 py-2 rounded hover:bg-neutral-100 transition-colors group shrink-0'>
              <div className='relative'>
                <Heart
                  className='w-6 h-6 text-gray-700 group-hover:text-brand-green transition-colors'
                  strokeWidth={1.5}
                />
                {wishlistCount > 0 && (
                  <span className='absolute -top-1.5 -right-2 bg-[#ff424e] text-white min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold rounded-full px-1 border border-white'>
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className='text-sm font-medium text-gray-700 hidden sm:block'>Yêu thích</span>
            </button>

            {/* Nút Giỏ hàng */}
            <Link
              to='/cart'
              className='flex items-center justify-center px-2 py-2 rounded hover:bg-neutral-100 transition-colors group shrink-0'
            >
              <div className='relative'>
                <ShoppingCart
                  className='w-6 h-6 text-gray-700 group-hover:text-brand-green transition-colors'
                  strokeWidth={1.5}
                />
                {cartCount > 0 && (
                  <span className='absolute -top-1.5 -right-2 bg-[#fadb14] text-[#876800] min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold rounded-full px-1 border border-white'>
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>

            <button
              className='ml-1 p-2 rounded hover:bg-neutral-100 transition-colors md:hidden'
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label='Toggle menu'
            >
              {mobileOpen ? (
                <X className='w-6 h-6 text-gray-700' />
              ) : (
                <Menu className='w-6 h-6 text-gray-700' />
              )}
            </button>
          </div>
        </div>
      </div>

      <nav className='border-t border-border bg-card'>
        <div className='max-w-7xl mx-auto px-4'>
          <ul className='hidden md:flex items-center'>
            <li>
              <button className='flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-primary-foreground bg-brand-green hover:bg-brand-green-dark transition-colors'>
                <Menu className='w-4 h-4' />
                {t('header.allCategories')}
              </button>
            </li>
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className='block px-4 py-2.5 text-sm font-medium text-foreground hover:text-brand-green hover:bg-brand-green-light transition-colors'
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className='ml-auto'>
              <Link
                to='/flash-sale'
                className='block px-4 py-2.5 text-sm font-medium text-brand-red hover:opacity-80 transition-opacity'
              >
                {t('header.flashSale', 'Khuyến mãi hot')}
              </Link>
            </li>
          </ul>

          {mobileOpen && (
            <ul className='md:hidden py-2 flex flex-col gap-1'>
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className='block px-3 py-2 text-sm text-foreground hover:text-brand-green hover:bg-brand-green-light rounded transition-colors'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>
    </header>
  )
}
