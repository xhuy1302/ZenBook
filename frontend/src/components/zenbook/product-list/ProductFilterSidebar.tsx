'use client'

import { useState, useCallback } from 'react'
import {
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  X,
  Tag,
  Banknote,
  Star,
  BookOpen,
  Globe,
  UserRound,
  Building2
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterOption {
  id: string
  name: string
  count?: number
  children?: FilterOption[] // 👉 ĐÃ THÊM: Hỗ trợ danh mục cha - con
}

export type BookFormat = 'soft' | 'hard' | 'ebook' | 'audio'
export type BookLanguage = 'vi' | 'en' | 'ja' | 'zh' | 'ko' | 'other'

export interface FilterState {
  categoryIds: string[]
  authorIds: string[]
  publisherIds: string[]
  formats: BookFormat[]
  languages: BookLanguage[]
  minPrice: number
  maxPrice: number
  minRating: number | null
}

export const DEFAULT_FILTER: FilterState = {
  categoryIds: [],
  authorIds: [],
  publisherIds: [],
  formats: [],
  languages: [],
  minPrice: 0,
  maxPrice: 99999999, // Cờ đánh dấu maxPrice
  minRating: null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHECKLIST_DEFAULT_SHOW = 5

const FORMAT_OPTIONS: { value: BookFormat; label: string }[] = [
  { value: 'soft', label: 'Bìa mềm' },
  { value: 'hard', label: 'Bìa cứng' },
  { value: 'ebook', label: 'Sách điện tử' },
  { value: 'audio', label: 'Audiobook' }
]

const LANGUAGE_OPTIONS: { value: BookLanguage; label: string }[] = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'Tiếng Anh' },
  { value: 'ja', label: 'Tiếng Nhật' },
  { value: 'zh', label: 'Tiếng Trung' },
  { value: 'ko', label: 'Tiếng Hàn' },
  { value: 'other', label: 'Khác' }
]

const STAR_OPTIONS = [
  { value: 5, label: 'Tuyệt vời (5 sao)' },
  { value: 4, label: 'Từ 4 sao trở lên' },
  { value: 3, label: 'Từ 3 sao trở lên' }
]

const PRICE_PRESETS: { label: string; min: number; max?: number }[] = [
  { label: 'Dưới 100K', min: 0, max: 100000 },
  { label: '100 – 200K', min: 100000, max: 200000 },
  { label: 'Trên 200K', min: 200000 }
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + '₫'
}

type ActiveChip =
  | { type: 'category'; id: string; label: string }
  | { type: 'author'; id: string; label: string }
  | { type: 'publisher'; id: string; label: string }
  | { type: 'format'; value: BookFormat; label: string }
  | { type: 'language'; value: BookLanguage; label: string }
  | { type: 'rating'; label: string }
  | { type: 'price'; label: string }

// ─── Sub-components ───────────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  icon,
  defaultOpen = true,
  children
}: {
  title: string
  icon: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className='border-b border-slate-100 last:border-0'>
      <button
        onClick={() => setOpen((o) => !o)}
        className='w-full flex items-center justify-between px-5 py-4 text-[15px] font-bold text-slate-800 hover:bg-slate-50 transition-colors'
      >
        <div className='flex items-center gap-2.5'>
          <span className='text-brand-green'>{icon}</span>
          <span>{title}</span>
        </div>
        {open ? (
          <ChevronUp className='w-4 h-4 text-slate-400' />
        ) : (
          <ChevronDown className='w-4 h-4 text-slate-400' />
        )}
      </button>
      {open && <div className='px-5 pb-5 pt-1'>{children}</div>}
    </div>
  )
}

function CheckList({
  items,
  selectedIds,
  onToggle
}: {
  items: FilterOption[]
  selectedIds: string[]
  onToggle: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const hasMore = items.length > CHECKLIST_DEFAULT_SHOW

  const visible = expanded ? items : items.slice(0, CHECKLIST_DEFAULT_SHOW)

  // 👉 ĐÃ THÊM: Hàm đệ quy để render Danh mục Cha - Con
  const renderNode = (item: FilterOption, depth = 0) => (
    <div key={item.id} className='flex flex-col gap-3.5'>
      <label
        className={`flex items-center gap-3 cursor-pointer group ${
          depth > 0 ? 'ml-6 pl-3 border-l-2 border-slate-100' : ''
        }`}
      >
        <Checkbox
          checked={selectedIds.includes(item.id)}
          onCheckedChange={() => onToggle(item.id)}
          className='w-[18px] h-[18px] border-slate-300 data-[state=checked]:bg-brand-green data-[state=checked]:border-brand-green shrink-0 rounded-md'
        />
        <span
          className={`text-[14px] flex-1 group-hover:text-brand-green transition-colors leading-snug ${
            depth === 0 ? 'font-bold text-slate-800' : 'font-semibold text-slate-600'
          }`}
        >
          {item.name}
        </span>
        {item.count !== undefined && (
          <span className='text-[12px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0 font-bold'>
            {item.count}
          </span>
        )}
      </label>
      {/* Hiển thị con nếu có */}
      {item.children && item.children.length > 0 && (
        <div className='flex flex-col gap-3.5 mt-0.5'>
          {item.children.map((child) => renderNode(child, depth + 1))}
        </div>
      )}
    </div>
  )

  return (
    <div className='space-y-3.5'>
      <div className='space-y-3.5'>{visible.map((item) => renderNode(item))}</div>

      {hasMore && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className='flex items-center gap-1.5 text-[13px] font-bold text-brand-green hover:text-brand-green/70 transition-colors mt-3'
        >
          {expanded ? (
            <>
              <ChevronUp className='w-4 h-4' /> Thu gọn
            </>
          ) : (
            <>
              <ChevronDown className='w-4 h-4' /> Xem thêm ({items.length - CHECKLIST_DEFAULT_SHOW})
            </>
          )}
        </button>
      )}
    </div>
  )
}

function PriceRangeSlider({
  min,
  max,
  step,
  minVal,
  maxVal,
  onChange
}: {
  min: number
  max: number
  step: number
  minVal: number
  maxVal: number
  onChange: (min: number, max: number) => void
}) {
  const range = max - min === 0 ? 1 : max - min
  const leftPct = ((minVal - min) / range) * 100
  const rightPct = ((maxVal - min) / range) * 100

  return (
    <div className='relative h-6 flex items-center select-none'>
      <div className='absolute w-full h-1.5 rounded-full bg-slate-200' />
      <div
        className='absolute h-1.5 rounded-full bg-brand-green'
        style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
      />
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={(e) => {
          const v = Math.min(Number(e.target.value), maxVal - step)
          onChange(v, maxVal)
        }}
        className='absolute w-full h-full appearance-none bg-transparent cursor-pointer z-10 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[2.5px] [&::-webkit-slider-thumb]:border-brand-green [&::-webkit-slider-thumb]:shadow-md'
      />
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={(e) => {
          const v = Math.max(Number(e.target.value), minVal + step)
          onChange(minVal, v)
        }}
        className='absolute w-full h-full appearance-none bg-transparent cursor-pointer z-10 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[2.5px] [&::-webkit-slider-thumb]:border-brand-green [&::-webkit-slider-thumb]:shadow-md'
      />
    </div>
  )
}

const STAR_SHOW_DEFAULT = 2

function StarRatingList({
  minRating,
  onToggle
}: {
  minRating: number | null
  onToggle: (star: number) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? STAR_OPTIONS : STAR_OPTIONS.slice(0, STAR_SHOW_DEFAULT)

  return (
    <div className='space-y-2'>
      {visible.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onToggle(value)}
          className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl transition-all border
            ${
              minRating === value
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'hover:bg-slate-50 border-transparent text-slate-700'
            }`}
        >
          <div className='flex gap-0.5'>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                viewBox='0 0 12 12'
                className={`w-4 h-4 ${
                  i < value ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'
                }`}
              >
                <path d='M6 1l1.3 2.7 3 .4-2.2 2.1.5 3L6 7.8 3.4 9.2l.5-3L1.7 4.1l3-.4z' />
              </svg>
            ))}
          </div>
          <span className='text-[14px] font-bold'>{label}</span>
        </button>
      ))}

      {STAR_OPTIONS.length > STAR_SHOW_DEFAULT && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className='flex items-center gap-1.5 text-[13px] font-bold text-brand-green hover:text-brand-green/70 transition-colors mt-1 px-1.5'
        >
          {expanded ? (
            <>
              <ChevronUp className='w-4 h-4' /> Thu gọn
            </>
          ) : (
            <>
              <ChevronDown className='w-4 h-4' /> Xem thêm
            </>
          )}
        </button>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ProductFilterSidebarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  categories?: FilterOption[]
  authors?: FilterOption[]
  publishers?: FilterOption[]
  maxPriceAllowed?: number
}

export default function ProductFilterSidebar({
  filters,
  onFilterChange,
  categories = [],
  authors = [],
  publishers = [],
  maxPriceAllowed = 500000
}: ProductFilterSidebarProps) {
  const activeCount =
    (filters.categoryIds ?? []).length +
    (filters.authorIds ?? []).length +
    (filters.publisherIds ?? []).length +
    (filters.formats ?? []).length +
    (filters.languages ?? []).length +
    (filters.minRating ? 1 : 0) +
    ((filters.minPrice ?? 0) > 0 || filters.maxPrice < maxPriceAllowed ? 1 : 0)

  // Hàm helper tìm tên nhãn cho Chip (tìm cả cha và con)
  const findLabel = (items: FilterOption[], id: string): string | undefined => {
    for (const item of items) {
      if (item.id === id) return item.name
      if (item.children) {
        const found = findLabel(item.children, id)
        if (found) return found
      }
    }
    return undefined
  }

  const chips: ActiveChip[] = []
  ;(filters.categoryIds ?? []).forEach((id) => {
    const name = findLabel(categories, id)
    if (name) chips.push({ type: 'category', id, label: name })
  })
  ;(filters.authorIds ?? []).forEach((id) => {
    const opt = authors.find((a) => a.id === id)
    if (opt) chips.push({ type: 'author', id, label: opt.name })
  })
  ;(filters.publisherIds ?? []).forEach((id) => {
    const opt = publishers.find((p) => p.id === id)
    if (opt) chips.push({ type: 'publisher', id, label: opt.name })
  })
  ;(filters.formats ?? []).forEach((value) => {
    const opt = FORMAT_OPTIONS.find((f) => f.value === value)
    if (opt) chips.push({ type: 'format', value, label: opt.label })
  })
  ;(filters.languages ?? []).forEach((value) => {
    const opt = LANGUAGE_OPTIONS.find((l) => l.value === value)
    if (opt) chips.push({ type: 'language', value, label: opt.label })
  })
  if (filters.minRating) {
    const opt = STAR_OPTIONS.find((s) => s.value === filters.minRating)
    if (opt) chips.push({ type: 'rating', label: opt.label })
  }
  if ((filters.minPrice ?? 0) > 0 || filters.maxPrice < maxPriceAllowed) {
    chips.push({
      type: 'price',
      label: `${formatVND(filters.minPrice)} – ${formatVND(filters.maxPrice)}`
    })
  }

  // ── Actions ──
  const update = useCallback(
    (patch: Partial<FilterState>) => onFilterChange({ ...filters, ...patch }),
    [filters, onFilterChange]
  )

  const toggleIdList = useCallback(
    (key: 'categoryIds' | 'authorIds' | 'publisherIds', id: string) => {
      const current = filters[key]
      update({ [key]: current.includes(id) ? current.filter((x) => x !== id) : [...current, id] })
    },
    [filters, update]
  )

  const toggleFormat = useCallback(
    (value: BookFormat) => {
      const current = filters.formats ?? []
      update({
        formats: current.includes(value) ? current.filter((x) => x !== value) : [...current, value]
      })
    },
    [filters.formats, update]
  )

  const toggleLanguage = useCallback(
    (value: BookLanguage) => {
      const current = filters.languages ?? []
      update({
        languages: current.includes(value)
          ? current.filter((x) => x !== value)
          : [...current, value]
      })
    },
    [filters.languages, update]
  )

  const toggleRating = useCallback(
    (star: number) => update({ minRating: filters.minRating === star ? null : star }),
    [filters.minRating, update]
  )

  const removeChip = useCallback(
    (chip: ActiveChip) => {
      switch (chip.type) {
        case 'category':
          update({ categoryIds: filters.categoryIds.filter((x) => x !== chip.id) })
          break
        case 'author':
          update({ authorIds: filters.authorIds.filter((x) => x !== chip.id) })
          break
        case 'publisher':
          update({ publisherIds: filters.publisherIds.filter((x) => x !== chip.id) })
          break
        case 'format':
          update({ formats: (filters.formats ?? []).filter((x) => x !== chip.value) })
          break
        case 'language':
          update({ languages: (filters.languages ?? []).filter((x) => x !== chip.value) })
          break
        case 'rating':
          update({ minRating: null })
          break
        case 'price':
          update({ minPrice: 0, maxPrice: 99999999 })
          break
      }
    },
    [filters, update]
  )

  const handleReset = useCallback(() => onFilterChange(DEFAULT_FILTER), [onFilterChange])

  return (
    <aside className='w-full'>
      <div className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
        {/* ── Header ── */}
        <div className='px-5 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <SlidersHorizontal className='w-5 h-5 text-slate-600' strokeWidth={2.5} />
            <h2 className='text-[16px] font-black text-slate-900 uppercase tracking-widest'>
              Bộ lọc
            </h2>
          </div>
          {activeCount > 0 && (
            <button
              onClick={handleReset}
              className='flex items-center gap-1.5 text-[13px] font-bold text-red-600 hover:text-red-700 transition-colors bg-red-50 px-2.5 py-1 rounded-lg'
            >
              <RotateCcw className='w-3.5 h-3.5' strokeWidth={2.5} />
              Xóa hết
              <Badge className='bg-red-500 text-white text-[11px] px-1.5 py-0 ml-0.5 border-0 rounded-full'>
                {activeCount}
              </Badge>
            </button>
          )}
        </div>

        {/* ── Active chips ── */}
        {chips.length > 0 && (
          <div className='px-4 py-3 flex flex-wrap gap-2 border-b border-slate-100 bg-white'>
            {chips.map((chip, i) => (
              <button
                key={i}
                onClick={() => removeChip(chip)}
                className='flex items-center gap-1.5 bg-brand-green/10 text-brand-green text-[13px] font-bold px-3 py-1.5 rounded-full hover:bg-brand-green/20 transition-colors'
              >
                {chip.label}
                <X className='w-3.5 h-3.5 opacity-70' strokeWidth={2.5} />
              </button>
            ))}
          </div>
        )}

        {/* ── Filter sections ── */}
        <div>
          {/* Danh mục */}
          {categories.length > 0 && (
            <CollapsibleSection title='Danh mục' icon={<Tag className='w-4 h-4' />}>
              <CheckList
                items={categories}
                selectedIds={filters.categoryIds}
                onToggle={(id) => toggleIdList('categoryIds', id)}
              />
            </CollapsibleSection>
          )}

          {/* Khoảng giá */}
          <CollapsibleSection title='Khoảng giá' icon={<Banknote className='w-4 h-4' />}>
            <div className='px-1'>
              <div className='flex justify-between mb-5'>
                <span className='text-[13px] font-bold text-brand-green bg-brand-green/10 px-3 py-1.5 rounded-xl border border-brand-green/20'>
                  {formatVND(filters.minPrice)}
                </span>
                <span className='text-[13px] font-bold text-brand-green bg-brand-green/10 px-3 py-1.5 rounded-xl border border-brand-green/20'>
                  {formatVND(filters.maxPrice)}
                </span>
              </div>

              <PriceRangeSlider
                min={0}
                max={maxPriceAllowed}
                step={10000}
                minVal={filters.minPrice}
                maxVal={filters.maxPrice}
                onChange={(min, max) => update({ minPrice: min, maxPrice: max })}
              />

              <div className='flex flex-wrap gap-2 mt-6'>
                {PRICE_PRESETS.map((p) => {
                  const targetMax = p.max || maxPriceAllowed
                  const isActive = filters.minPrice === p.min && filters.maxPrice === targetMax
                  return (
                    <button
                      key={p.label}
                      onClick={() => update({ minPrice: p.min, maxPrice: targetMax })}
                      className={`flex-1 text-[13px] font-bold px-2 py-2.5 rounded-xl border transition-all
                        ${
                          isActive
                            ? 'bg-brand-green/10 border-brand-green/40 text-brand-green'
                            : 'border-slate-200 text-slate-600 hover:border-brand-green/40 hover:text-brand-green hover:bg-brand-green/5'
                        }`}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </CollapsibleSection>

          {/* Đánh giá */}
          <CollapsibleSection title='Đánh giá' icon={<Star className='w-4 h-4' />}>
            <StarRatingList minRating={filters.minRating} onToggle={toggleRating} />
          </CollapsibleSection>

          {/* Định dạng */}
          <CollapsibleSection title='Định dạng' icon={<BookOpen className='w-4 h-4' />}>
            <div className='grid grid-cols-2 gap-2.5'>
              {FORMAT_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => toggleFormat(value)}
                  className={`py-3 px-2 rounded-xl text-[14px] font-bold border transition-all
                    ${
                      filters.formats?.includes(value)
                        ? 'bg-brand-green/10 border-brand-green/40 text-brand-green'
                        : 'border-slate-200 text-slate-600 hover:border-brand-green/40 hover:text-brand-green hover:bg-brand-green/5'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </CollapsibleSection>

          {/* Ngôn ngữ */}
          <CollapsibleSection title='Ngôn ngữ' icon={<Globe className='w-4 h-4' />}>
            <div className='flex flex-wrap gap-2.5'>
              {LANGUAGE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => toggleLanguage(value)}
                  className={`px-4 py-2 rounded-full text-[13px] font-bold border transition-all
                    ${
                      filters.languages?.includes(value)
                        ? 'bg-brand-green/10 border-brand-green/40 text-brand-green'
                        : 'border-slate-200 text-slate-600 hover:border-brand-green/40 hover:text-brand-green hover:bg-brand-green/5'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </CollapsibleSection>

          {/* Tác giả */}
          {authors.length > 0 && (
            <CollapsibleSection
              title='Tác giả'
              icon={<UserRound className='w-4 h-4' />}
              defaultOpen={false}
            >
              <CheckList
                items={authors}
                selectedIds={filters.authorIds}
                onToggle={(id) => toggleIdList('authorIds', id)}
              />
            </CollapsibleSection>
          )}

          {/* Nhà xuất bản */}
          {publishers.length > 0 && (
            <CollapsibleSection
              title='Nhà xuất bản'
              icon={<Building2 className='w-4 h-4' />}
              defaultOpen={false}
            >
              <CheckList
                items={publishers}
                selectedIds={filters.publisherIds}
                onToggle={(id) => toggleIdList('publisherIds', id)}
              />
            </CollapsibleSection>
          )}
        </div>

        {/* ── Bottom reset ── */}
        <div className='px-5 py-4 border-t border-slate-100 bg-slate-50/50'>
          <Button
            onClick={handleReset}
            variant='ghost'
            className='w-full h-11 text-[14px] font-bold text-slate-500 hover:text-brand-green hover:bg-brand-green/10 gap-2.5 rounded-xl border border-slate-200 bg-white'
          >
            <RotateCcw className='w-4 h-4' strokeWidth={2.5} />
            Thiết lập lại bộ lọc
          </Button>
        </div>
      </div>
    </aside>
  )
}
