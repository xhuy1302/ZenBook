'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Loader2,
  UploadCloud,
  Plus,
  X,
  BookText,
  Info,
  Layers,
  Tag,
  DollarSign,
  Image as ImageIcon
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import { getBookSchema, type BookFormValues } from '../schema/book.schema'
import { updateBookApi } from '@/services/book/book.api'
import { BookStatus, BookFormat } from '@/defines/book.enum'
import type { BookResponse, BookRequest } from '@/services/book/book.type'

import { getAllCategoriesApi } from '@/services/category/category.api'
import { getAllAuthorsApi } from '@/services/author/author.api'
import { getAllPublishersApi } from '@/services/publisher/publisher.api'
import { getAllTagsApi } from '@/services/tag/tag.api'

import type { CategoryResponse } from '@/services/category/category.type'
import type { AuthorResponse } from '@/services/author/author.type'
import type { PublisherResponse } from '@/services/publisher/publisher.type'
import type { TagResponse } from '@/services/tag/tag.type'

type BookImageDTO = { id: string; imageUrl?: string } | string

interface EditBookFormProps {
  book: BookResponse
  onSuccess: () => void
  onCancel: () => void
}

export function EditBookForm({ book, onSuccess, onCancel }: EditBookFormProps) {
  const { t } = useTranslation('product')
  const queryClient = useQueryClient()

  const [previewThumb, setPreviewThumb] = useState<string>(book.thumbnail || '')
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>(
    book.images?.map((img: BookImageDTO) => {
      if (typeof img === 'string') return { id: img, url: img }
      return { id: img.id, url: img.imageUrl || '' }
    }) ?? []
  )
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([])
  const [deleteImageIds, setDeleteImageIds] = useState<string[]>([])

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategoriesApi
  })
  const { data: authors = [] } = useQuery({ queryKey: ['authors'], queryFn: getAllAuthorsApi })
  const { data: publishers = [] } = useQuery({
    queryKey: ['publishers'],
    queryFn: getAllPublishersApi
  })
  const { data: tags = [] } = useQuery({ queryKey: ['tags'], queryFn: getAllTagsApi })

  const form = useForm<BookFormValues>({
    resolver: zodResolver(getBookSchema((key: string) => t(key))) as never,
    defaultValues: {
      title: book.title || '',
      isbn: book.isbn || '',
      description: book.description || '',
      originalPrice: book.originalPrice || 0,
      salePrice: book.salePrice || 0,
      stockQuantity: book.stockQuantity || 0,
      status: book.status || BookStatus.ACTIVE,
      format: book.format,
      pageCount: book.pageCount || 0,
      publicationYear: book.publicationYear || new Date().getFullYear(),
      dimensions: book.dimensions || '',
      weight: book.weight || 0,
      language: book.language || 'Tiếng Việt',
      publisherId: book.publisher?.id || '',
      categoryIds: book.categories?.map((c) => c.id) || [],
      authorIds: book.authors?.map((a) => a.id) || [],
      tagIds: book.tags?.map((tItem) => tItem.id) || [],
      galleryFiles: []
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
      const previews = files.map((f) => URL.createObjectURL(f))
      const currentFiles = (form.getValues('galleryFiles') as File[]) || []
      form.setValue('galleryFiles', [...currentFiles, ...files])
      setNewGalleryPreviews((prev) => [...prev, ...previews])
    }
  }

  const removeExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id))
    setDeleteImageIds((prev) => [...prev, id])
  }

  const removeNewImage = (index: number) => {
    const currentFiles = (form.getValues('galleryFiles') as File[]) || []
    form.setValue(
      'galleryFiles',
      currentFiles.filter((_, i) => i !== index)
    )
    setNewGalleryPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const mutation = useMutation({
    mutationFn: (values: BookFormValues) => {
      const requestData = { ...values, deleteImageIds }
      return updateBookApi(
        book.id,
        requestData as unknown as BookRequest & { deleteImageIds?: string[] }
      )
    },
    onSuccess: () => {
      toast.success(t('book.messages.updateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['books'] })
      onSuccess()
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || t('book.messages.updateError'))
    }
  })

  return (
    <form
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
      className='flex flex-col h-full overflow-hidden'
    >
      <div className='flex-1 overflow-y-auto px-6 py-4 custom-scrollbar bg-slate-50/30'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
          {/* CỘT TRÁI: HÌNH ẢNH & THƯƠNG MẠI */}
          <div className='lg:col-span-4 space-y-6'>
            {/* Thumbnail */}
            <div className='bg-white p-5 rounded-xl border shadow-sm space-y-4'>
              <div className='flex items-center gap-2 font-semibold text-slate-700'>
                <ImageIcon className='w-4 h-4 text-brand-green' />
                <span>{t('book.form.mainImage')}</span>
              </div>
              <div
                className='aspect-[3/4] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group hover:bg-slate-50 transition-all'
                onClick={() => document.getElementById('thumb-edit')?.click()}
              >
                {previewThumb ? (
                  <img src={previewThumb} alt='thumbnail' className='w-full h-full object-cover' />
                ) : (
                  <div className='text-center text-slate-400'>
                    <UploadCloud className='mx-auto h-10 w-10 mb-2' />
                    <span className='text-xs'>Tải ảnh bìa</span>
                  </div>
                )}
              </div>
              <input
                id='thumb-edit'
                type='file'
                className='hidden'
                accept='image/*'
                onChange={handleThumbnailChange}
              />

              <Controller
                control={form.control}
                name='status'
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full h-11'>
                      <SelectValue placeholder='Trạng thái' />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(BookStatus)
                        .filter((s) => s !== BookStatus.DELETED)
                        .map((s) => (
                          <SelectItem key={s} value={s}>
                            {t(`fields.status.options.${s}`, s)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Giá & Tồn kho */}
            <div className='bg-white p-5 rounded-xl border shadow-sm space-y-5'>
              <div className='flex items-center gap-2 font-semibold text-slate-700 border-b pb-3'>
                <DollarSign className='w-4 h-4 text-brand-green' />
                <span>Thông tin bán hàng</span>
              </div>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label className='text-xs uppercase text-slate-500'>
                    {t('book.form.salePrice')} *
                  </Label>
                  <Input
                    type='number'
                    {...form.register('salePrice', { valueAsNumber: true })}
                    className='h-11 font-bold text-brand-green text-lg'
                  />
                  {errors.salePrice && (
                    <p className='text-[10px] text-destructive'>{errors.salePrice.message}</p>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label className='text-xs uppercase text-slate-500'>
                    {t('book.form.originalPrice')}
                  </Label>
                  <Input
                    type='number'
                    {...form.register('originalPrice', { valueAsNumber: true })}
                    className='h-11 text-slate-500 line-through'
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-xs uppercase text-slate-500'>
                    {t('book.form.stockQuantity')}
                  </Label>
                  <Input
                    type='number'
                    disabled
                    {...form.register('stockQuantity')}
                    className='h-11 bg-slate-50'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: CHI TIẾT SẢN PHẨM */}
          <div className='lg:col-span-8 space-y-6'>
            {/* Thông tin chung */}
            <div className='bg-white p-6 rounded-xl border shadow-sm space-y-4'>
              <div className='flex items-center gap-2 font-semibold text-slate-800 border-b pb-3'>
                <BookText className='w-5 h-5 text-brand-green' />
                <span>Nội dung & Nhận dạng</span>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='md:col-span-2 space-y-2'>
                  <Label>Tên sách *</Label>
                  <Input {...form.register('title')} className='h-11 font-medium' />
                  {errors.title && (
                    <p className='text-xs text-destructive'>{errors.title.message}</p>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label>Mã ISBN</Label>
                  <Input {...form.register('isbn')} className='h-11 font-mono' />
                </div>
                <div className='space-y-2'>
                  <Label>Nhà xuất bản</Label>
                  <Controller
                    control={form.control}
                    name='publisherId'
                    render={({ field }) => (
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger className='h-11'>
                          <SelectValue placeholder='Chọn NXB' />
                        </SelectTrigger>
                        <SelectContent>
                          {publishers.map((p: PublisherResponse) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className='md:col-span-2 space-y-2'>
                  <Label>Mô tả chi tiết</Label>
                  <Textarea {...form.register('description')} rows={5} className='resize-none' />
                </div>
              </div>
            </div>

            {/* Phân loại & Tags */}
            <div className='bg-white p-6 rounded-xl border shadow-sm space-y-6'>
              <div className='flex items-center gap-2 font-semibold text-slate-800 border-b pb-3'>
                <Layers className='w-5 h-5 text-brand-green' />
                <span>Phân loại hệ thống</span>
              </div>

              <div className='space-y-4'>
                <div className='space-y-3'>
                  <Label className='text-slate-600'>Danh mục sản phẩm</Label>
                  <Controller
                    control={form.control}
                    name='categoryIds'
                    render={({ field }) => (
                      <div className='flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border min-h-[50px]'>
                        {categories.map((c: CategoryResponse) => {
                          const isSelected = (field.value as string[]).includes(c.id)
                          return (
                            <Badge
                              key={c.id}
                              variant={isSelected ? 'default' : 'outline'}
                              className='cursor-pointer py-1.5 px-3 transition-all'
                              onClick={() => {
                                const val = field.value as string[]
                                field.onChange(
                                  isSelected ? val.filter((id) => id !== c.id) : [...val, c.id]
                                )
                              }}
                            >
                              {c.categoryName}
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                  />
                </div>

                <div className='space-y-3'>
                  <Label className='text-slate-600'>Tác giả</Label>
                  <Controller
                    control={form.control}
                    name='authorIds'
                    render={({ field }) => (
                      <div className='flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border min-h-[50px]'>
                        {authors.map((a: AuthorResponse) => {
                          const isSelected = (field.value as string[]).includes(a.id)
                          return (
                            <Badge
                              key={a.id}
                              variant={isSelected ? 'secondary' : 'outline'}
                              className={`cursor-pointer py-1.5 px-3 ${isSelected ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200' : ''}`}
                              onClick={() => {
                                const val = field.value as string[]
                                field.onChange(
                                  isSelected ? val.filter((id) => id !== a.id) : [...val, a.id]
                                )
                              }}
                            >
                              {a.name}
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Thông số kỹ thuật */}
            <div className='bg-white p-6 rounded-xl border shadow-sm space-y-4'>
              <div className='flex items-center gap-2 font-semibold text-slate-800 border-b pb-3'>
                <Info className='w-5 h-5 text-brand-green' />
                <span>Thông số kỹ thuật</span>
              </div>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label>Định dạng</Label>
                  <Controller
                    control={form.control}
                    name='format'
                    render={({ field }) => (
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger className='h-10'>
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
                <div className='space-y-2'>
                  <Label>Ngôn ngữ</Label>
                  <Input {...form.register('language')} className='h-10' />
                </div>
                <div className='space-y-2'>
                  <Label>Số trang</Label>
                  <Input
                    type='number'
                    {...form.register('pageCount', { valueAsNumber: true })}
                    className='h-10'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Năm XB</Label>
                  <Input
                    type='number'
                    {...form.register('publicationYear', { valueAsNumber: true })}
                    className='h-10'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Kích thước</Label>
                  <Input {...form.register('dimensions')} className='h-10' />
                </div>
                <div className='space-y-2'>
                  <Label>Trọng lượng (g)</Label>
                  <Input
                    type='number'
                    {...form.register('weight', { valueAsNumber: true })}
                    className='h-10'
                  />
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div className='bg-white p-6 rounded-xl border shadow-sm space-y-4'>
              <div className='flex items-center gap-2 font-semibold text-slate-800 border-b pb-3'>
                <ImageIcon className='w-5 h-5 text-brand-green' />
                <span>Thư viện ảnh ({existingImages.length + newGalleryPreviews.length})</span>
              </div>
              <div className='flex flex-wrap gap-4'>
                <div
                  className='w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors'
                  onClick={() => document.getElementById('gallery-edit')?.click()}
                >
                  <Plus className='h-6 w-6 text-slate-400' />
                </div>
                <input
                  id='gallery-edit'
                  type='file'
                  multiple
                  className='hidden'
                  accept='image/*'
                  onChange={handleGalleryChange}
                />

                {existingImages.map((img) => (
                  <div
                    key={img.id}
                    className='relative w-24 h-24 border rounded-lg overflow-hidden group shadow-sm'
                  >
                    <img src={img.url} alt='gallery' className='w-full h-full object-cover' />
                    <button
                      type='button'
                      onClick={() => removeExistingImage(img.id)}
                      className='absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </div>
                ))}

                {newGalleryPreviews.map((src, idx) => (
                  <div
                    key={idx}
                    className='relative w-24 h-24 border-2 border-brand-green/30 rounded-lg overflow-hidden group shadow-sm'
                  >
                    <img src={src} alt='new-gallery' className='w-full h-full object-cover' />
                    <button
                      type='button'
                      onClick={() => removeNewImage(idx)}
                      className='absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER CỐ ĐỊNH */}
      <div className='p-6 border-t bg-white flex justify-end gap-3 shrink-0'>
        <Button type='button' variant='ghost' onClick={onCancel} className='px-8 h-11'>
          {t('common.cancel')}
        </Button>
        <Button
          type='submit'
          disabled={mutation.isPending || isSubmitting}
          className='px-10 h-11 bg-brand-green hover:bg-brand-green-dark shadow-md'
        >
          {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Lưu thay đổi
        </Button>
      </div>
    </form>
  )
}
