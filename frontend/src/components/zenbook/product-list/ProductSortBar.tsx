import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'bestseller' | 'rating'
export type ViewMode = 'grid' | 'list'

interface ProductSortBarProps {
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  total: number
  isLoading?: boolean
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'bestseller', label: 'Bán chạy' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' }
]

export default function ProductSortBar({
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  total,
  isLoading
}: ProductSortBarProps) {
  return (
    <div className='flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-2.5 mb-4'>
      {/* Left: result count + sort */}
      <div className='flex items-center gap-3 flex-wrap'>
        <div className='flex items-center gap-1.5 text-gray-500 text-sm'>
          <SlidersHorizontal className='w-3.5 h-3.5' />
          <span>Sắp xếp:</span>
        </div>

        <div className='flex items-center gap-1'>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all
                ${
                  sort === opt.value
                    ? 'bg-brand-green text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: total + view toggle */}
      <div className='flex items-center gap-3'>
        {!isLoading && (
          <span className='text-xs text-gray-400 hidden md:block'>
            {new Intl.NumberFormat('vi-VN').format(total)} sản phẩm
          </span>
        )}

        <div className='flex items-center gap-1 border border-gray-200 rounded-lg p-0.5'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onViewModeChange('grid')}
            className={`w-7 h-7 rounded-md ${viewMode === 'grid' ? 'bg-brand-green text-white hover:bg-brand-green' : 'text-gray-400 hover:text-gray-700'}`}
          >
            <LayoutGrid className='w-3.5 h-3.5' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onViewModeChange('list')}
            className={`w-7 h-7 rounded-md ${viewMode === 'list' ? 'bg-brand-green text-white hover:bg-brand-green' : 'text-gray-400 hover:text-gray-700'}`}
          >
            <List className='w-3.5 h-3.5' />
          </Button>
        </div>
      </div>
    </div>
  )
}
