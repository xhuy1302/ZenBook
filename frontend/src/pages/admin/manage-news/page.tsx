'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'

// Import API & Loading Skeleton
import { getAllNewsApi } from '@/services/news/news.api'
import { UserTableSkeleton } from '@/components/common/LoadingTable'
import type { NewsResponse } from '@/services/news/news.type' // Nhớ import dòng này

// Import components của Table
import { getColumns } from './columns' // 👉 Import hàm getColumns
import { DataTable } from './data-table'

// Import components của chức năng Tạo/Sửa
import { CreateNewsButton } from '@/components/admin/data/manage-news/create/CreateNewsDialog'
import { CreateNewsForm } from '@/components/admin/data/manage-news/create/CreateNewsForm'
import { EditNewsForm } from '@/components/admin/data/manage-news/update/EditNewsForm' // 👉 Import form Sửa

// Import Button của UI
import { Button } from '@/components/ui/button'

export default function NewsPage() {
  const { t } = useTranslation('news')

  // States quản lý màn hình
  const [isAdding, setIsAdding] = useState(false)
  const [editingNews, setEditingNews] = useState<NewsResponse | null>(null) // 👉 State lưu bài viết đang sửa

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['news'],
    queryFn: getAllNewsApi
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. MÀN HÌNH THÊM MỚI
  // ─────────────────────────────────────────────────────────────────────────────
  if (isAdding) {
    return (
      <div className='p-4 space-y-4 h-full flex flex-col animate-in fade-in duration-300'>
        <div className='flex items-center gap-4 px-4 py-3 bg-white border rounded-xl shadow-sm shrink-0'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsAdding(false)}
            className='hover:bg-slate-100 text-slate-600'
          >
            <ChevronLeft className='w-4 h-4 mr-1.5' /> Quay lại
          </Button>
          <h1 className='text-xl font-bold tracking-tight text-slate-800'>Thêm bài viết mới</h1>
        </div>
        <div className='bg-white rounded-xl shadow-sm border overflow-hidden flex-1'>
          <CreateNewsForm
            onSuccess={() => {
              setIsAdding(false)
              refetch()
            }}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. MÀN HÌNH CẬP NHẬT (GIỐNG HỆT THÊM MỚI)
  // ─────────────────────────────────────────────────────────────────────────────
  if (editingNews) {
    return (
      <div className='p-4 space-y-4 h-full flex flex-col animate-in fade-in duration-300'>
        <div className='bg-white rounded-xl shadow-sm border overflow-hidden flex-1'>
          <EditNewsForm
            news={editingNews}
            onSuccess={() => {
              setEditingNews(null)
              refetch()
            }}
            onCancel={() => setEditingNews(null)}
          />
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. MÀN HÌNH BẢNG DANH SÁCH (MẶC ĐỊNH)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className='p-4 space-y-4 h-full flex flex-col animate-in fade-in duration-300'>
      <div className='flex items-center justify-between gap-4 p-4 border rounded-xl bg-white shadow-sm shrink-0'>
        <h1 className='text-xl font-bold tracking-tight text-slate-800'>
          Quản lý Bài viết / Tin tức
        </h1>
        <div className='flex items-center gap-3'>
          <CreateNewsButton onClick={() => setIsAdding(true)} />
        </div>
      </div>

      <div className='flex-1 rounded-xl border bg-white shadow-sm overflow-hidden p-4'>
        {/* 👉 Gọi getColumns và truyền hàm setEditingNews vào */}
        {isLoading ? (
          <UserTableSkeleton />
        ) : (
          <DataTable columns={getColumns(setEditingNews)} data={data || []} />
        )}
      </div>
    </div>
  )
}
