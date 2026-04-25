'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Loader2,
  UploadCloud,
  X,
  Plus,
  Info,
  Image as ImageIcon,
  Tag as TagIcon,
  LayoutList,
  DollarSign,
  BarChart3
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

import { getBookSchema, type BookFormValues } from '../schema/book.schema'
import { createBookApi } from '@/services/book/book.api'
import { BookStatus, BookFormat } from '@/defines/book.enum'
import type { BookRequest } from '@/services/book/book.type'

import { getAllCategoriesApi } from '@/services/category/category.api'
import { getAllAuthorsApi } from '@/services/author/author.api'
import { getAllPublishersApi } from '@/services/publisher/publisher.api'
import { getAllTagsApi } from '@/services/tag/tag.api'

interface CreateBookFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function CreateBookForm({ onSuccess, onCancel }: CreateBookFormProps) {
  const { t } = useTranslation('product')
  const queryClient = useQueryClient()

  const [previewThumb, setPreviewThumb] = useState<string>('')
  const [, setGalleryFiles] = useState<File[]>([])
  const [previewGallery, setPreviewGallery] = useState<string[]>([])

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategoriesApi
  })
  const { data: authors = [], isLoading: isAuthorsLoading } = useQuery({
    queryKey: ['authors'],
    queryFn: getAllAuthorsApi
  })
  const { data: publishers = [], isLoading: isPublishersLoading } = useQuery({
    queryKey: ['publishers'],
    queryFn: getAllPublishersApi
  })
  const { data: tags = [], isLoading: isTagsLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: getAllTagsApi
  })

  const form = useForm<BookFormValues>({
    resolver: zodResolver(getBookSchema((key: string) => t(key))) as never,
    defaultValues: {
      title: '',
      isbn: '',
      description: '',
      originalPrice: undefined,
      salePrice: undefined,
      pageCount: undefined,
      publicationYear: undefined,
      dimensions: '',
      weight: undefined,
      stockQuantity: 0,
      status: BookStatus.ACTIVE,
      format: BookFormat.PAPERBACK,
      language: 'Tiếng Việt',
      publisherId: '',
      categoryIds: [],
      authorIds: [],
      tagIds: [],
      award: '',
      rating: 0.0,
      reviews: 0,
      views: 0
    }
  })

  const { errors, isSubmitting } = form.formState

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue('thumbnailFile', file)
      setPreviewThumb(URL.createObjectURL(file))
    }
  }

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      const newPreviews = files.map((f) => URL.createObjectURL(f))
      setGalleryFiles((prev) => {
        const updated = [...prev, ...files]
        form.setValue('galleryFiles', updated)
        return updated
      })
      setPreviewGallery((prev) => [...prev, ...newPreviews])
    }
  }

  const removeGalleryItem = (indexToRemove: number) => {
    setGalleryFiles((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove)
      form.setValue('galleryFiles', updated)
      return updated
    })
    setPreviewGallery((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const mutation = useMutation({
    mutationFn: (values: BookFormValues) => createBookApi(values as unknown as BookRequest),
    onSuccess: () => {
      toast.success(t('book.messages.createSuccess', 'Thêm sách thành công!'))
      queryClient.invalidateQueries({ queryKey: ['books'] })
      onSuccess()
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg = error.response?.data?.message || t('book.messages.createError', 'Có lỗi xảy ra')
      toast.error(msg)
    }
  })

  return (
    <form
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
      className='flex flex-col h-full bg-white'
    >
      {/* VÙNG CUỘN NỘI DUNG - Solid bg-slate-50 để che khuất phía dưới */}
      <div className='flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar bg-slate-50'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6'>
          {/* ========================================== */}
          {/* CỘT TRÁI: THÔNG TIN CƠ BẢN, ẢNH & THÔNG SỐ (7 Cột) */}
          {/* ========================================== */}
          <div className='lg:col-span-7 space-y-5'>
            {/* 1. THÔNG TIN CHUNG */}
            <div className='bg-white border border-slate-200 rounded-xl p-5 shadow-sm'>
              <div className='flex items-center gap-2 border-b border-slate-100 pb-3 mb-4'>
                <Info className='w-5 h-5 text-brand-green' />
                <h3 className='font-bold text-slate-800'>
                  {t('book.form.section1', 'Thông tin cơ bản')}
                </h3>
              </div>
              <div className='space-y-4'>
                <div className='space-y-1.5'>
                  <Label
                    className={`text-sm ${errors.title ? 'text-destructive' : 'text-slate-700'}`}
                  >
                    {t('book.form.title', 'Tên sách')} <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    {...form.register('title')}
                    placeholder={t('book.form.titlePlaceholder', 'Nhập tên sách...')}
                    className={errors.title ? 'border-destructive' : ''}
                  />
                  {errors.title && (
                    <p className='text-xs text-destructive'>{errors.title.message}</p>
                  )}
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-sm text-slate-700'>{t('book.form.isbn', 'Mã ISBN')}</Label>
                  <Input
                    {...form.register('isbn')}
                    className='font-mono bg-white'
                    placeholder='VD: 9786041130000'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-sm text-slate-700'>
                    {t('book.form.description', 'Mô tả sách')}
                  </Label>
                  <Textarea
                    {...form.register('description')}
                    rows={6}
                    placeholder='Viết nội dung giới thiệu về cuốn sách...'
                    className='resize-none bg-white'
                  />
                </div>
              </div>
            </div>

            {/* 2. HÌNH ẢNH */}
            <div className='bg-white border border-slate-200 rounded-xl p-5 shadow-sm'>
              <div className='flex items-center gap-2 border-b border-slate-100 pb-3 mb-4'>
                <ImageIcon className='w-5 h-5 text-brand-green' />
                <h3 className='font-bold text-slate-800'>
                  {t('book.form.section5', 'Hình ảnh sản phẩm')}
                </h3>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <Label className='text-sm font-semibold text-slate-700'>
                    Ảnh bìa chính <span className='text-destructive'>*</span>
                  </Label>
                  <div
                    className='h-[200px] w-full border-2 border-dashed border-slate-300 bg-slate-50 rounded-lg flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:bg-slate-100 transition-colors'
                    onClick={() => document.getElementById('thumb-create')?.click()}
                  >
                    {previewThumb ? (
                      <img
                        src={previewThumb}
                        alt='thumbnail'
                        className='w-full h-full object-contain p-2'
                      />
                    ) : (
                      <div className='text-center text-slate-500'>
                        <UploadCloud className='mx-auto h-8 w-8 mb-2 opacity-50 group-hover:opacity-100 transition-opacity text-brand-green' />
                        <span className='text-xs font-medium'>Click tải ảnh lên</span>
                      </div>
                    )}
                  </div>
                  <input
                    id='thumb-create'
                    type='file'
                    className='hidden'
                    accept='image/*'
                    onChange={handleThumbnailChange}
                  />
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-semibold text-slate-700'>
                    Ảnh bộ sưu tập (Gallery)
                  </Label>
                  <div className='grid grid-cols-3 gap-2'>
                    <div
                      className='aspect-square border-2 border-dashed border-slate-300 bg-slate-50 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors'
                      onClick={() => document.getElementById('gallery-create')?.click()}
                    >
                      <Plus className='h-5 w-5 text-slate-400' />
                    </div>
                    <input
                      id='gallery-create'
                      type='file'
                      multiple
                      className='hidden'
                      accept='image/*'
                      onChange={handleGalleryChange}
                    />

                    {previewGallery.map((src, idx) => (
                      <div
                        key={idx}
                        className='relative aspect-square border border-slate-200 rounded-md overflow-hidden group bg-white'
                      >
                        <img
                          src={src}
                          alt={`gallery-${idx}`}
                          className='w-full h-full object-cover'
                        />
                        <button
                          type='button'
                          onClick={() => removeGalleryItem(idx)}
                          className='absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all'
                        >
                          <X className='h-3 w-3' />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. THÔNG SỐ KỸ THUẬT */}
            <div className='bg-white border border-slate-200 rounded-xl p-5 shadow-sm'>
              <div className='flex items-center gap-2 border-b border-slate-100 pb-3 mb-4'>
                <LayoutList className='w-5 h-5 text-brand-green' />
                <h3 className='font-bold text-slate-800'>
                  {t('book.form.section4', 'Thông số kỹ thuật')}
                </h3>
              </div>
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                <div className='space-y-1.5'>
                  <Label className='text-xs text-slate-600'>
                    {t('book.form.format', 'Định dạng')}
                  </Label>
                  <Controller
                    control={form.control}
                    name='format'
                    render={({ field }) => (
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger className='h-9 text-sm bg-white'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(BookFormat).map((f) => (
                            <SelectItem key={f} value={f}>
                              {t(`fields.format.options.${f}`, f)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs text-slate-600'>
                    {t('book.form.language', 'Ngôn ngữ')}
                  </Label>
                  <Input {...form.register('language')} className='h-9 text-sm bg-white' />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs text-slate-600'>
                    {t('book.form.pageCount', 'Số trang')}
                  </Label>
                  <Input
                    type='number'
                    {...form.register('pageCount', { valueAsNumber: true })}
                    className='h-9 text-sm bg-white'
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs text-slate-600'>
                    {t('book.form.publicationYear', 'Năm XB')}
                  </Label>
                  <Input
                    type='number'
                    {...form.register('publicationYear', { valueAsNumber: true })}
                    className='h-9 text-sm bg-white'
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs text-slate-600'>
                    {t('book.form.dimensions', 'Kích thước')}
                  </Label>
                  <Input
                    {...form.register('dimensions')}
                    placeholder='14x20 cm'
                    className='h-9 text-sm bg-white'
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs text-slate-600'>
                    {t('book.form.weight', 'Khối lượng (g)')}
                  </Label>
                  <Input
                    type='number'
                    {...form.register('weight', { valueAsNumber: true })}
                    className='h-9 text-sm bg-white'
                    placeholder='300'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* CỘT PHẢI: GIÁ, PHÂN LOẠI & THỐNG KÊ (5 Cột)*/}
          {/* ========================================== */}
          <div className='lg:col-span-5 space-y-5'>
            {/* 4. KINH DOANH & TỒN KHO */}
            <div className='bg-white border border-slate-200 rounded-xl p-5 shadow-sm'>
              <div className='flex items-center gap-2 border-b border-slate-100 pb-3 mb-4'>
                <DollarSign className='w-5 h-5 text-brand-green' />
                <h3 className='font-bold text-slate-800'>
                  {t('book.form.section2', 'Giá bán & Trạng thái')}
                </h3>
              </div>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-1.5'>
                    <Label
                      className={`text-sm ${errors.salePrice ? 'text-destructive' : 'text-slate-700'}`}
                    >
                      Giá bán (đ) *
                    </Label>
                    <Input
                      type='number'
                      {...form.register('salePrice', { valueAsNumber: true })}
                      className={`font-bold text-emerald-600 bg-white ${errors.salePrice ? 'border-destructive' : ''}`}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label className='text-sm text-slate-700'>Giá bìa (đ)</Label>
                    <Input
                      type='number'
                      {...form.register('originalPrice', { valueAsNumber: true })}
                      className='text-slate-500 line-through decoration-slate-300 bg-white'
                    />
                  </div>
                </div>
                <Separator className='my-1' />
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-1.5'>
                    <Label className='text-sm text-slate-700'>Trạng thái</Label>
                    <Controller
                      control={form.control}
                      name='status'
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className='bg-white'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={BookStatus.ACTIVE}>Đang bán</SelectItem>
                            <SelectItem value={BookStatus.INACTIVE}>Ngừng bán</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label className='text-sm text-slate-700'>Tồn kho ban đầu</Label>
                    <Input
                      disabled
                      value={0}
                      className='bg-slate-100 font-semibold text-center text-slate-500'
                    />
                    <p className='text-[10px] text-slate-400 mt-1 text-center'>
                      Tự động qua phiếu nhập
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. PHÂN LOẠI & GẮN NHÃN (Select Dạng Mới) */}
            <div className='bg-white border border-slate-200 rounded-xl p-5 shadow-sm'>
              <div className='flex items-center gap-2 border-b border-slate-100 pb-3 mb-4'>
                <TagIcon className='w-5 h-5 text-brand-green' />
                <h3 className='font-bold text-slate-800'>
                  {t('book.form.section3', 'Phân loại sản phẩm')}
                </h3>
              </div>

              <div className='space-y-4'>
                {/* Nhà xuất bản */}
                <div className='space-y-1.5'>
                  <Label className='text-sm text-slate-700'>Nhà xuất bản</Label>
                  <Controller
                    control={form.control}
                    name='publisherId'
                    render={({ field }) => (
                      <Select
                        value={field.value || ''}
                        onValueChange={field.onChange}
                        disabled={isPublishersLoading}
                      >
                        <SelectTrigger className='bg-white'>
                          <SelectValue placeholder='Chọn nhà xuất bản...' />
                        </SelectTrigger>
                        <SelectContent>
                          {publishers.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Danh mục (Multi-select faked) */}
                <div className='space-y-1.5'>
                  <Label className='text-sm text-slate-700'>Danh mục</Label>
                  <Controller
                    control={form.control}
                    name='categoryIds'
                    render={({ field }) => {
                      const currentValues = (field.value as string[]) || []
                      const selectedOptions = categories.filter((c) => currentValues.includes(c.id))
                      const unselectedOptions = categories.filter(
                        (c) => !currentValues.includes(c.id)
                      )

                      return (
                        <div className='space-y-2'>
                          <Select
                            disabled={isCategoriesLoading || unselectedOptions.length === 0}
                            value='' // Always empty to act as a dropdown trigger
                            onValueChange={(val) => field.onChange([...currentValues, val])}
                          >
                            <SelectTrigger className='bg-white text-slate-500'>
                              <SelectValue
                                placeholder={
                                  unselectedOptions.length === 0
                                    ? 'Đã chọn hết'
                                    : 'Thêm danh mục...'
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {unselectedOptions.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.categoryName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Badges hiển thị */}
                          {selectedOptions.length > 0 && (
                            <div className='flex flex-wrap gap-1.5 p-2 bg-slate-50 border rounded-md min-h-[40px]'>
                              {selectedOptions.map((c) => (
                                <Badge
                                  key={c.id}
                                  variant='secondary'
                                  className='flex items-center gap-1 pr-1.5 bg-white border-slate-200 text-slate-700'
                                >
                                  {c.categoryName}
                                  <button
                                    type='button'
                                    onClick={() =>
                                      field.onChange(currentValues.filter((id) => id !== c.id))
                                    }
                                    className='hover:bg-red-100 hover:text-red-600 rounded-full p-0.5 transition-colors'
                                  >
                                    <X className='w-3 h-3' />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    }}
                  />
                </div>

                {/* Tác giả (Multi-select faked) */}
                <div className='space-y-1.5'>
                  <Label className='text-sm text-slate-700'>Tác giả</Label>
                  <Controller
                    control={form.control}
                    name='authorIds'
                    render={({ field }) => {
                      const currentValues = (field.value as string[]) || []
                      const selectedOptions = authors.filter((a) => currentValues.includes(a.id))
                      const unselectedOptions = authors.filter((a) => !currentValues.includes(a.id))

                      return (
                        <div className='space-y-2'>
                          <Select
                            disabled={isAuthorsLoading || unselectedOptions.length === 0}
                            value=''
                            onValueChange={(val) => field.onChange([...currentValues, val])}
                          >
                            <SelectTrigger className='bg-white text-slate-500'>
                              <SelectValue
                                placeholder={
                                  unselectedOptions.length === 0 ? 'Đã chọn hết' : 'Thêm tác giả...'
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {unselectedOptions.map((a) => (
                                <SelectItem key={a.id} value={a.id}>
                                  {a.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {selectedOptions.length > 0 && (
                            <div className='flex flex-wrap gap-1.5 p-2 bg-slate-50 border rounded-md min-h-[40px]'>
                              {selectedOptions.map((a) => (
                                <Badge
                                  key={a.id}
                                  variant='secondary'
                                  className='flex items-center gap-1 pr-1.5 bg-white border-slate-200 text-slate-700'
                                >
                                  {a.name}
                                  <button
                                    type='button'
                                    onClick={() =>
                                      field.onChange(currentValues.filter((id) => id !== a.id))
                                    }
                                    className='hover:bg-red-100 hover:text-red-600 rounded-full p-0.5 transition-colors'
                                  >
                                    <X className='w-3 h-3' />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    }}
                  />
                </div>

                {/* Tags */}
                <div className='space-y-1.5'>
                  <Label className='text-sm text-slate-700'>Nhãn nổi bật (Tùy chọn)</Label>
                  <Controller
                    control={form.control}
                    name='tagIds'
                    render={({ field }) => {
                      const currentValues = (field.value as string[]) || []
                      const selectedOptions = tags.filter((tItem) =>
                        currentValues.includes(tItem.id)
                      )
                      const unselectedOptions = tags.filter(
                        (tItem) => !currentValues.includes(tItem.id)
                      )

                      return (
                        <div className='space-y-2'>
                          <Select
                            disabled={isTagsLoading || unselectedOptions.length === 0}
                            value=''
                            onValueChange={(val) => field.onChange([...currentValues, val])}
                          >
                            <SelectTrigger className='bg-white text-slate-500'>
                              <SelectValue placeholder='Chọn nhãn đính kèm...' />
                            </SelectTrigger>
                            <SelectContent>
                              {unselectedOptions.map((tItem) => (
                                <SelectItem key={tItem.id} value={tItem.id}>
                                  <div className='flex items-center gap-2'>
                                    <div
                                      className='w-3 h-3 rounded-full'
                                      style={{ backgroundColor: tItem.color }}
                                    ></div>
                                    {tItem.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {selectedOptions.length > 0 && (
                            <div className='flex flex-wrap gap-1.5 p-2 bg-slate-50 border rounded-md min-h-[40px]'>
                              {selectedOptions.map((tItem) => (
                                <Badge
                                  key={tItem.id}
                                  variant='outline'
                                  className='flex items-center gap-1 pr-1.5'
                                  style={{
                                    borderColor: tItem.color,
                                    color: tItem.color,
                                    backgroundColor: `${tItem.color}10`
                                  }}
                                >
                                  {tItem.name}
                                  <button
                                    type='button'
                                    onClick={() =>
                                      field.onChange(currentValues.filter((id) => id !== tItem.id))
                                    }
                                    className='hover:bg-red-100 hover:text-red-600 rounded-full p-0.5 transition-colors'
                                  >
                                    <X className='w-3 h-3' />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 6. THÔNG KÊ (LÀM NHẠT MÀU) */}
            <div className='bg-slate-50 border border-slate-200 text-slate-600 rounded-xl p-5 shadow-sm opacity-90'>
              <div className='flex items-center gap-2 border-b border-slate-200 pb-3 mb-4'>
                <BarChart3 className='w-4 h-4 text-slate-400' />
                <h3 className='font-bold text-sm text-slate-500 uppercase tracking-wider'>
                  Thông tin hệ thống
                </h3>
              </div>
              <div className='space-y-4'>
                <div className='space-y-1.5'>
                  <Label className='text-xs text-slate-500'>
                    Thành tích / Giải thưởng (Nếu có)
                  </Label>
                  <Input
                    {...form.register('award')}
                    placeholder='VD: Bestseller 2025'
                    className='h-9 bg-white border-slate-200 placeholder:text-slate-300'
                  />
                </div>
                <div className='grid grid-cols-3 gap-2 pt-2'>
                  <div className='text-center bg-white border border-slate-100 rounded-lg p-2'>
                    <p className='text-[10px] text-slate-400 mb-1'>Đánh giá</p>
                    <div className='text-sm font-semibold text-slate-400'>0.0</div>
                  </div>
                  <div className='text-center bg-white border border-slate-100 rounded-lg p-2'>
                    <p className='text-[10px] text-slate-400 mb-1'>Lượt mua</p>
                    <div className='text-sm font-semibold text-slate-400'>0</div>
                  </div>
                  <div className='text-center bg-white border border-slate-100 rounded-lg p-2'>
                    <p className='text-[10px] text-slate-400 mb-1'>Lượt xem</p>
                    <div className='text-sm font-semibold text-slate-400'>0</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER CỐ ĐỊNH */}
      <div className='px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3 shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]'>
        <Button type='button' variant='outline' onClick={onCancel} className='px-6 text-slate-600'>
          {t('common.cancel', 'Hủy')}
        </Button>
        <Button
          type='submit'
          disabled={mutation.isPending || isSubmitting}
          className='px-8 bg-brand-green hover:bg-brand-green-dark text-white'
        >
          {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {t('book.form.btnCreate', 'Lưu Sản Phẩm')}
        </Button>
      </div>
    </form>
  )
}
