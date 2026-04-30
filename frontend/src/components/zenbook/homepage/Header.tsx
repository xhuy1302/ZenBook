import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Search,
  User,
  Heart,
  ShoppingCart,
  MapPin,
  Bell,
  ChevronDown,
  Menu,
  X,
  ShoppingBag,
  LogOut,
  UserCircle,
  Crown,
  Zap,
  BookText,
  HelpCircle,
  PhoneCall
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import LocaleSwitcher from './LocaleSwitcher'
import { useAuth } from '@/context/AuthContext'
import type { User as UserType } from '@/context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { getAddressesApi } from '@/services/customer/customer.api'
import { useCart } from '@/context/CartContext'
import { useMenu } from '@/context/MenuContext'
import NotificationPopover from '@/pages/client/notice/NotificationPopover'
import { getWishlistCountApi } from '@/services/wishlist/wishlist.api'

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
      <div className='flex items-center gap-2 px-3 py-2 w-32'>
        <Skeleton className='w-8 h-8 rounded-full' />
        <Skeleton className='w-16 h-4' />
      </div>
    )
  }

  return (
    <div className='relative group'>
      <Link
        to={isAuthenticated ? '/customer' : '/login'}
        className='flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all cursor-pointer'
      >
        {isAuthenticated && user?.avatar ? (
          <div className='w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center overflow-hidden border border-brand-green/20 shrink-0 shadow-sm'>
            <img src={user.avatar} alt='avatar' className='w-full h-full object-cover' />
          </div>
        ) : (
          <div className='w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-brand-green/10 transition-colors'>
            <User
              className='w-5 h-5 text-slate-600 group-hover:text-brand-green transition-colors'
              strokeWidth={1.5}
            />
          </div>
        )}
        <div className='hidden lg:flex flex-col items-start justify-center max-w-[130px]'>
          <span className='text-[11px] text-slate-500 font-medium leading-none mb-1'>
            {isAuthenticated ? t('header.user.greeting') : t('header.user.login')}
          </span>
          <span className='text-sm font-semibold text-slate-700 truncate w-full leading-none'>
            {isAuthenticated ? user?.username : t('header.user.myAccount')}
          </span>
        </div>
      </Link>

      <div className='absolute top-full right-0 pt-3 w-72 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50'>
        <div className='bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden flex flex-col'>
          {!isAuthenticated ? (
            <div className='p-5 flex flex-col gap-3 bg-white'>
              <p className='text-sm text-center text-slate-500 mb-2'>
                {t('header.user.notLoggedInDesc')}
              </p>
              <Button
                onClick={() => navigate('/login')}
                className='w-full bg-brand-green hover:bg-brand-green-dark text-white rounded-xl h-11 font-semibold shadow-md shadow-brand-green/20'
              >
                {t('header.user.loginBtn')}
              </Button>
              <Button
                onClick={() => navigate('/signup')}
                variant='outline'
                className='w-full border-brand-green/30 text-brand-green hover:bg-brand-green/5 rounded-xl h-11 font-semibold'
              >
                {t('header.user.signupBtn')}
              </Button>
            </div>
          ) : (
            <>
              <div className='px-5 py-4 border-b border-slate-100 bg-slate-50/80'>
                <p className='text-base font-bold text-slate-800 truncate'>{user?.username}</p>
                <p className='text-xs text-slate-500 truncate mt-0.5'>{user?.email}</p>
              </div>
              <div className='py-2 flex flex-col'>
                <Link
                  to='/customer'
                  className='flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-brand-green/5 hover:text-brand-green transition-colors'
                >
                  <UserCircle className='w-5 h-5 text-slate-400' /> {t('header.user.myAccount')}
                </Link>
                <Link
                  to='/customer/orders'
                  className='flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-brand-green/5 hover:text-brand-green transition-colors'
                >
                  <ShoppingBag className='w-5 h-5 text-slate-400' /> {t('header.user.myOrders')}
                </Link>
                <Link
                  to='/customer/address'
                  className='flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-brand-green/5 hover:text-brand-green transition-colors'
                >
                  <MapPin className='w-5 h-5 text-slate-400' /> {t('header.user.addressBook')}
                </Link>
              </div>
              <div className='py-2 border-t border-slate-100 bg-slate-50/50'>
                <button
                  onClick={onLogout}
                  className='flex items-center gap-3 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left transition-colors'
                >
                  <LogOut className='w-5 h-5' /> {t('header.user.logout')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Header() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth()
  const { isHeroMenuOpen, setIsHeroMenuOpen } = useMenu()

  const [mobileOpen, setMobileOpen] = useState(false)
  const { totalItems } = useCart()
  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist-count'],
    queryFn: getWishlistCountApi,
    enabled: isAuthenticated
  })

  const wishlistCount = wishlistData?.count || 0

  const queryFromUrl = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(queryFromUrl)
  const [prevUrlQuery, setPrevUrlQuery] = useState(queryFromUrl)

  if (queryFromUrl !== prevUrlQuery) {
    setPrevUrlQuery(queryFromUrl)
    setSearchQuery(queryFromUrl)
  }

  const { data: addresses, isLoading: addressLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddressesApi,
    enabled: isAuthenticated
  })

  const defaultAddress = addresses?.find((addr) => addr.isDefault)

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
    navigate('/')
  }

  // 👉 Đã xóa "Tác giả nổi bật" khỏi mảng này
  const navLinks = [
    {
      label: t('header.nav.blog'),
      href: '/blog',
      icon: BookText,
      color: 'text-blue-500',
      bgColor: 'hover:bg-blue-50'
    },
    {
      label: t('header.nav.guide'),
      href: '/guide',
      icon: HelpCircle,
      color: 'text-emerald-500',
      bgColor: 'hover:bg-emerald-50'
    },
    {
      label: t('header.nav.contact'),
      href: '/contact',
      icon: PhoneCall,
      color: 'text-indigo-500',
      bgColor: 'hover:bg-indigo-50'
    }
  ]

  const activeTab = isHeroMenuOpen ? 'categories' : location.pathname

  return (
    <header
      className={`sticky top-0 z-[30] w-full bg-white shadow-sm border-b border-slate-100 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* 1. TOP BAR */}
      <div className='bg-brand-green text-white border-b border-white/10'>
        <div className='max-w-7xl mx-auto px-4 py-1 flex items-center justify-between text-[11px] lg:text-xs font-medium'>
          <div className='flex items-center -ml-2'>
            <Link
              to={isAuthenticated ? '/customer/address' : '/login'}
              className='flex items-center gap-1.5 hover:bg-white/15 px-2.5 py-1.5 rounded-lg transition-all max-w-[300px]'
            >
              <MapPin className='w-3.5 h-3.5 shrink-0 text-white/80' />
              <span className='truncate text-white/90'>
                {!isAuthenticated ? (
                  <>
                    {t('header.delivery.label')}{' '}
                    <span className='font-bold text-white'>
                      {t('header.delivery.selectAddress')}
                    </span>
                  </>
                ) : addressLoading ? (
                  <>{t('header.delivery.loading')}</>
                ) : defaultAddress ? (
                  <>
                    {t('header.delivery.label')}{' '}
                    <span className='font-bold text-white'>
                      {defaultAddress.ward}, {defaultAddress.district}, {defaultAddress.city}
                    </span>
                  </>
                ) : (
                  <>
                    {t('header.delivery.label')}{' '}
                    <span className='font-bold text-white'>{t('header.delivery.addAddress')}</span>
                  </>
                )}
              </span>
              <ChevronDown className='w-3 h-3 shrink-0 opacity-70' />
            </Link>
          </div>

          <div className='hidden md:flex items-center gap-1 -mr-2'>
            {isAuthenticated ? (
              <NotificationPopover />
            ) : (
              <button className='flex items-center gap-1.5 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-all text-white/90'>
                <Bell className='w-3.5 h-3.5 text-white/80' />
                <span className='font-medium'>{t('header.newsletter')}</span>
              </button>
            )}

            <div className='w-[1px] h-3.5 bg-white/20 mx-1.5 rounded-full' />
            <LocaleSwitcher />
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <div className='max-w-7xl mx-auto px-4 py-4 md:py-5'>
        <div className='flex items-center gap-4 lg:gap-8'>
          <Link to='/' className='flex items-center gap-2.5 shrink-0 group'>
            <div className='w-10 h-10 rounded-xl bg-brand-green flex items-center justify-center shadow-md shadow-brand-green/20 group-hover:scale-105 transition-transform'>
              <BookOpen className='w-6 h-6 text-white' />
            </div>
            <div className='hidden sm:block'>
              <div className='font-serif font-black text-2xl text-slate-800 leading-none tracking-tight'>
                ZenBook
              </div>
              <div className='text-[11px] font-medium text-slate-500 leading-none mt-1 tracking-wider uppercase'>
                The Wise Owl
              </div>
            </div>
          </Link>

          {/* Search bar */}
          <div className='flex-1 flex justify-center max-w-3xl mx-auto'>
            <div className='relative flex items-stretch w-full max-w-2xl h-11 border-2 border-brand-green rounded-xl bg-white overflow-hidden'>
              <div className='relative flex-1 flex items-center'>
                <Search className='absolute left-3.5 w-4 h-4 text-slate-400' />
                <Input
                  type='search'
                  placeholder={t('header.searchPlaceholder')}
                  className='pl-10 pr-4 h-full w-full border-none focus-visible:ring-0 bg-transparent text-[14px]'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <Button
                onClick={handleSearch}
                className='h-full px-7 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-[13px] transition-colors'
              >
                {t('header.search')}
              </Button>
            </div>
          </div>

          <div className='flex items-center gap-1 sm:gap-2 shrink-0'>
            {/* 👉 SẮP XẾP LẠI: VIP -> Wishlist -> Cart -> UserSection */}

            {/* 1. Link VIP */}
            {isAuthenticated && (
              <Link
                to='/zenbokvip'
                className='hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all group shrink-0'
              >
                <div className='w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors'>
                  <Crown className='w-5 h-5 text-amber-500' strokeWidth={2} />
                </div>
                <span className='text-sm font-bold text-amber-600 hidden xl:block'>
                  {t('header.vip')}
                </span>
              </Link>
            )}

            {/* 2. Link Wishlist */}
            <Link
              to='/wish-list'
              className='flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-xl hover:bg-slate-100 transition-all group shrink-0'
            >
              <div className='relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 group-hover:bg-rose-50 transition-colors'>
                <Heart
                  className='w-5 h-5 text-slate-600 group-hover:text-rose-500 transition-colors'
                  strokeWidth={1.5}
                />
                {wishlistCount > 0 && (
                  <span className='absolute -top-1 -right-1 bg-rose-500 text-white min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full border-2 border-white'>
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className='text-sm font-semibold text-slate-700 hidden lg:block'>
                {t('header.wishlist')}
              </span>
            </Link>

            {/* 3. Link Giỏ hàng */}
            <Link
              to={isAuthenticated ? '/cart' : '/login'}
              className='flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-xl hover:bg-slate-100 transition-all shrink-0'
            >
              <div className='relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 group-hover:bg-brand-green/10 transition-colors'>
                <ShoppingCart
                  className='w-5 h-5 text-slate-600 group-hover:text-brand-green transition-colors'
                  strokeWidth={1.5}
                />
                {totalItems > 0 && (
                  <span className='absolute -top-1 -right-1 bg-brand-green text-white min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full border-2 border-white'>
                    {totalItems}
                  </span>
                )}
              </div>
              <span className='text-sm font-semibold text-slate-700 hidden lg:block'>
                {t('header.cart')}
              </span>
            </Link>

            {/* 4. Tài khoản (UserSection) */}
            <UserSection
              authLoading={authLoading}
              isAuthenticated={isAuthenticated}
              user={user}
              onLogout={handleLogout}
            />

            <button
              className='ml-1 p-2 rounded-xl hover:bg-slate-100 transition-colors md:hidden bg-slate-50'
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className='w-6 h-6 text-slate-700' />
              ) : (
                <Menu className='w-6 h-6 text-slate-700' />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION BAR */}
      <nav className='border-t border-slate-100 bg-white relative z-20'>
        <div className='max-w-7xl mx-auto px-4'>
          <ul className='hidden md:flex items-center gap-3 relative'>
            <li className='relative mt-1'>
              {activeTab === 'categories' && (
                <motion.div
                  layoutId='nav-background'
                  className='absolute inset-0 bg-brand-green rounded-t-lg shadow-inner'
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <button
                onClick={() => setIsHeroMenuOpen(!isHeroMenuOpen)}
                className={`relative z-10 flex items-center justify-start gap-3 px-5 py-3 w-[300px] text-[14px] font-bold transition-colors duration-300 ${
                  activeTab === 'categories'
                    ? 'text-white'
                    : 'text-slate-700 hover:text-brand-green bg-slate-50 rounded-t-lg'
                }`}
              >
                {isHeroMenuOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
                {t('header.allCategories')}
              </button>
            </li>

            <div className='flex items-center gap-1 ml-4'>
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = activeTab === link.href
                return (
                  <li key={link.label} className='relative flex items-center'>
                    {isActive && (
                      <motion.div
                        layoutId='nav-background'
                        className='absolute inset-0 bg-brand-green rounded-full shadow-sm'
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Link
                      to={link.href}
                      onClick={() => setIsHeroMenuOpen(false)}
                      className={`relative z-10 group flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold transition-all duration-300 rounded-full ${
                        isActive
                          ? 'text-white'
                          : `text-slate-600 hover:text-slate-900 ${link.bgColor}`
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : link.color
                        }`}
                      />
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </div>

            <li className='ml-auto py-1.5'>
              <Link
                to='/flash-sale'
                className='flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold text-white bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 rounded-full shadow-sm hover:shadow-md transition-all group'
              >
                <Zap className='w-4 h-4 fill-white group-hover:animate-pulse' />
                {t('header.flashSale')}
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}
