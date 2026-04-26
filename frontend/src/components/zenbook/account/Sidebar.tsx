import { Link, useLocation, useNavigate } from 'react-router-dom'
import { User, ShoppingBag, MapPin, LogOut, ChevronRight, Star } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'

// ── Menu config ───────────────────────────────────────────────────────────────

const menuItems = [
  {
    label: 'Thông tin tài khoản',
    href: '/customer',
    exact: true,
    icon: <User className='w-4 h-4' />
  },
  {
    label: 'Đơn hàng của tôi',
    href: '/customer/orders',
    exact: false,
    icon: <ShoppingBag className='w-4 h-4' />
  },
  {
    label: 'Sổ địa chỉ',
    href: '/customer/address',
    exact: false,
    icon: <MapPin className='w-4 h-4' />
  },
  {
    label: 'Đánh giá của tôi',
    href: '/customer/myreviews', // Đảm bảo route này khớp với cấu hình Router của bạn
    exact: false,
    icon: <Star className='w-4 h-4' />
  }
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name?: string) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { user, isLoading, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (href: string, exact: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href)

  return (
    <aside className='w-full md:w-[250px] shrink-0 md:sticky md:top-28 h-fit z-10'>
      <div className='rounded-2xl border border-border bg-card overflow-hidden'>
        <div className='flex flex-col items-center gap-3 px-6 py-8 bg-brand-green/5 border-b border-border'>
          {isLoading ? (
            <>
              <Skeleton className='w-16 h-16 rounded-full' />
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-3 w-40' />
            </>
          ) : (
            <>
              {/* Avatar */}
              <div className='w-16 h-16 rounded-full bg-brand-green flex items-center justify-center overflow-hidden ring-2 ring-brand-green/30 ring-offset-2'>
                {user?.avatar ? (
                  <img src={user.avatar} alt='avatar' className='w-full h-full object-cover' />
                ) : (
                  <span className='text-xl font-bold text-primary-foreground select-none'>
                    {getInitials(user?.username)}
                  </span>
                )}
              </div>

              {/* Name + email */}
              <div className='text-center'>
                <p className='font-semibold text-foreground'>{user?.username ?? '—'}</p>
                <p className='text-xs text-muted-foreground mt-0.5 truncate max-w-[190px]'>
                  {user?.email}
                </p>
              </div>
            </>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className='p-2'>
          <ul className='flex flex-col gap-0.5'>
            {menuItems.map((item) => {
              const active = isActive(item.href, item.exact)
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                      active
                        ? 'bg-brand-green text-primary-foreground'
                        : 'text-foreground hover:bg-brand-green/10 hover:text-brand-green'
                    }`}
                  >
                    {/* Icon */}
                    <span
                      className={
                        active
                          ? 'text-primary-foreground'
                          : 'text-muted-foreground group-hover:text-brand-green'
                      }
                    >
                      {item.icon}
                    </span>

                    {/* Label */}
                    <span className='flex-1'>{item.label}</span>

                    {/* Arrow */}
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        active
                          ? 'opacity-100 text-primary-foreground'
                          : 'opacity-0 group-hover:opacity-60'
                      }`}
                    />
                  </Link>
                </li>
              )
            })}

            {/* Logout */}
            <li className='mt-1 pt-1 border-t border-border'>
              <button
                onClick={handleLogout}
                className='w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all'
              >
                <LogOut className='w-4 h-4' />
                <span>Đăng xuất</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  )
}
