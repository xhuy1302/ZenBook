import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
// Nhớ điều chỉnh lại đường dẫn import này cho đúng với thư mục của bạn nhé
import BreadcrumbHeader from '@/components/zenbook/breadcrumb/BreadCrumbHeader'

export default function AccountLayout() {
  return (
    <div className='min-h-screen bg-background'>
      {/* 1. Thay thế phần <nav> code cứng bằng component BreadcrumbHeader */}
      <BreadcrumbHeader />

      <div className='max-w-7xl mx-auto px-4 py-8'>
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
