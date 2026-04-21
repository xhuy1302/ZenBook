'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Star, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'

export interface FilterState {
  categoryIds: number[]
  authorIds: number[]
  publisherIds: number[]
  minPrice: number
  maxPrice: number
  minRating: number | null
}

interface FilterOption {
  id: number
  name: string
  count?: number
}

interface ProductFilterSidebarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  categories?: FilterOption[]
  authors?: FilterOption[] // ← prop này cần được truyền từ page
  publishers?: FilterOption[] // ← prop này cần được truyền từ page
}

const PRICE_MAX = 500000

function CollapsibleSection({
  title,
  children,
  defaultOpen = true
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className='border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0'>
      <button
        onClick={() => setOpen((o) => !o)}
        className='w-full flex items-center justify-between py-1 text-sm font-semibold text-gray-800 hover:text-brand-green transition-colors'
      >
        {title}
        {open ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />}
      </button>
      {open && <div className='mt-3'>{children}</div>}
    </div>
  )
}

export default function ProductFilterSidebar({
  filters,
  onFilterChange,
  categories = [],
  authors = [],
  publishers = []
}: ProductFilterSidebarProps) {
  const activeCount =
    filters.categoryIds.length +
    filters.authorIds.length +
    filters.publisherIds.length +
    (filters.minRating ? 1 : 0) +
    (filters.minPrice > 0 || filters.maxPrice < PRICE_MAX ? 1 : 0)

  const handleReset = () => {
    onFilterChange({
      categoryIds: [],
      authorIds: [],
      publisherIds: [],
      minPrice: 0,
      maxPrice: PRICE_MAX,
      minRating: null
    })
  }

  const toggleId = (key: 'categoryIds' | 'authorIds' | 'publisherIds', id: number) => {
    const current = filters[key]
    onFilterChange({
      ...filters,
      [key]: current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    })
  }

  return (
    <aside className='w-full'>
      <div className='bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden'>
        {/* Header */}
        <div className='px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <SlidersHorizontal className='w-4 h-4 text-gray-400' />
            <h2 className='font-bold text-gray-900 text-sm uppercase tracking-wider'>Bộ lọc</h2>
          </div>
          {activeCount > 0 && (
            <button
              onClick={handleReset}
              className='flex items-center gap-1 text-[11px] font-medium text-brand-red hover:underline'
            >
              <RotateCcw className='w-3 h-3' />
              Xóa hết
              <Badge className='bg-brand-red text-white text-[9px] px-1 py-0 ml-0.5 border-0 rounded-sm'>
                {activeCount}
              </Badge>
            </button>
          )}
        </div>

        <div className='p-4'>
          {/* ── 1. Danh mục ── */}
          {categories.length > 0 && (
            <CollapsibleSection title='Danh mục'>
              <div className='space-y-2.5 max-h-48 overflow-y-auto pr-1'>
                {categories.map((cat) => (
                  <label key={cat.id} className='flex items-center gap-2 cursor-pointer group'>
                    <Checkbox
                      checked={filters.categoryIds.includes(cat.id)}
                      onCheckedChange={() => toggleId('categoryIds', cat.id)}
                      className='w-4 h-4 border-gray-300 data-[state=checked]:bg-brand-green data-[state=checked]:border-brand-green'
                    />
                    <span className='text-sm text-gray-600 group-hover:text-brand-green transition-colors flex-1'>
                      {cat.name}
                    </span>
                    {cat.count !== undefined && (
                      <span className='text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full'>
                        {cat.count}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* ── 2. Khoảng giá ── */}
          <CollapsibleSection title='Khoảng giá'>
            <div className='px-1 pt-1'>
              <Slider
                min={0}
                max={PRICE_MAX}
                step={10000}
                value={[filters.minPrice, filters.maxPrice]}
                onValueChange={([min, max]) =>
                  onFilterChange({ ...filters, minPrice: min, maxPrice: max })
                }
                className='[&_.bg-primary]:bg-brand-green [&_[role=slider]]:border-brand-green [&_[role=slider]]:h-4 [&_[role=slider]]:w-4'
              />
              <div className='flex justify-between mt-3 text-[11px] text-gray-500 font-semibold'>
                <span className='bg-gray-100 px-2 py-0.5 rounded'>
                  {new Intl.NumberFormat('vi-VN').format(filters.minPrice)}₫
                </span>
                <span className='bg-gray-100 px-2 py-0.5 rounded'>
                  {new Intl.NumberFormat('vi-VN').format(filters.maxPrice)}₫
                </span>
              </div>
            </div>
          </CollapsibleSection>

          {/* ── 3. Đánh giá ── */}
          <CollapsibleSection title='Đánh giá'>
            <div className='space-y-1.5'>
              {[5, 4, 3].map((star) => (
                <button
                  key={star}
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      minRating: filters.minRating === star ? null : star
                    })
                  }
                  className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm transition-all border
                    ${
                      filters.minRating === star
                        ? 'bg-brand-amber/5 border-brand-amber/30 text-brand-amber'
                        : 'hover:bg-gray-50 border-transparent text-gray-600'
                    }`}
                >
                  <div className='flex items-center gap-0.5'>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < star ? 'text-brand-amber fill-brand-amber' : 'text-gray-200 fill-gray-200'}`}
                      />
                    ))}
                  </div>
                  <span className='text-[11px] font-medium'>
                    {star === 5 ? 'Tuyệt vời' : `Từ ${star} sao`}
                  </span>
                </button>
              ))}
            </div>
          </CollapsibleSection>

          {/* ── 4. Tác giả ── */}
          {authors.length > 0 && (
            <CollapsibleSection title='Tác giả' defaultOpen={false}>
              <div className='space-y-2.5 max-h-44 overflow-y-auto pr-1'>
                {authors.map((author) => (
                  <label key={author.id} className='flex items-center gap-2 cursor-pointer group'>
                    <Checkbox
                      checked={filters.authorIds.includes(author.id)}
                      onCheckedChange={() => toggleId('authorIds', author.id)}
                      className='w-4 h-4 border-gray-300 data-[state=checked]:bg-brand-green data-[state=checked]:border-brand-green'
                    />
                    <span className='text-sm text-gray-600 group-hover:text-brand-green transition-colors flex-1'>
                      {author.name}
                    </span>
                    {author.count !== undefined && (
                      <span className='text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full'>
                        {author.count}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* ── 5. Nhà xuất bản ── */}
          {publishers.length > 0 && (
            <CollapsibleSection title='Nhà xuất bản' defaultOpen={false}>
              <div className='space-y-2.5 max-h-44 overflow-y-auto pr-1'>
                {publishers.map((pub) => (
                  <label key={pub.id} className='flex items-center gap-2 cursor-pointer group'>
                    <Checkbox
                      checked={filters.publisherIds.includes(pub.id)}
                      onCheckedChange={() => toggleId('publisherIds', pub.id)}
                      className='w-4 h-4 border-gray-300 data-[state=checked]:bg-brand-green data-[state=checked]:border-brand-green'
                    />
                    <span className='text-sm text-gray-600 group-hover:text-brand-green transition-colors flex-1'>
                      {pub.name}
                    </span>
                    {pub.count !== undefined && (
                      <span className='text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full'>
                        {pub.count}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Reset button */}
          <Button
            onClick={handleReset}
            variant='ghost'
            className='w-full mt-2 text-xs h-9 text-gray-400 hover:text-brand-green hover:bg-brand-green/5'
          >
            Thiết lập lại bộ lọc
          </Button>
        </div>
      </div>
    </aside>
  )
}
