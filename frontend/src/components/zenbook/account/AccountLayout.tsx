// ─────────────────────────────────────────────────────────────────────────────
// components/zenbook/account/AccountLayout.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { Outlet, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import Sidebar from './Sidebar'

/**
 * Two-column layout: Sidebar (fixed 250 px) + <Outlet /> content area.
 * Rendered by AccountPage which wraps all /account/* nested routes.
 */
export default function AccountLayout() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        {/* Breadcrumb */}
        <nav className='flex items-center gap-2 text-sm text-muted-foreground mb-6'>
          <Link to='/' className='hover:text-brand-green transition-colors'>
            Trang chủ
          </Link>
          <ChevronRight className='w-3.5 h-3.5' />
          <span className='text-foreground font-medium'>Tài khoản của tôi</span>
        </nav>

        {/* Grid */}
        <div className='flex flex-col md:flex-row gap-6 items-start'>
          <Sidebar />

          {/* Content panel */}
          <main className='flex-1 min-w-0 rounded-2xl border border-border bg-card p-6 md:p-8'>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
