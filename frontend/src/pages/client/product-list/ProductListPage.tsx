import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SidebarProvider } from '@/components/ui/sidebar'
import BreadcrumbHeader from '@/components/zenbook/breadcrumb/BreadCrumbHeader'
import { ProductListArea } from '@/components/zenbook/product-list'

export default function ProductListPage() {
  const { t } = useTranslation('common')
  const [searchParams] = useSearchParams()
  const keyword = searchParams.get('q') || ''

  // State lưu tổng số kết quả từ component con báo lên
  const [totalResults, setTotalResults] = useState(0)

  return (
    <SidebarProvider>
      <div className='flex flex-col w-full'>
        <BreadcrumbHeader />

        <main className='min-h-screen bg-gray-50 w-full'>
          {keyword && (
            <div className='max-w-7xl mx-auto px-4 pt-6 pb-2'>
              <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-3'>
                {/* 1. Tiêu đề hiển thị đúng format bạn yêu cầu */}
                <h1 className='text-base md:text-lg font-bold text-gray-800 uppercase flex flex-wrap items-center gap-1.5'>
                  {t('search.resultsTitle', 'KẾT QUẢ TÌM KIẾM:')}
                  <span className='text-blue-500 font-normal normal-case'>
                    {keyword} ({totalResults} {t('search.countUnit')})
                  </span>
                </h1>

                {/* 2. Phần Tag lọc phía dưới */}
                <div className='flex flex-wrap gap-2'>
                  <div className='inline-flex items-center px-3 py-1.5 bg-[#dff0fa] text-[#108ee9] text-sm rounded cursor-pointer hover:bg-[#cde6f7] transition-colors'>
                    {t('search.vietnameseBooks', 'Sách tiếng Việt')} ({totalResults})
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Component danh sách sản phẩm */}
          <ProductListArea onTotalChange={setTotalResults} />
        </main>
      </div>
    </SidebarProvider>
  )
}
