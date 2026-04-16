'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, UploadCloud, Plus, X } from 'lucide-react'
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

export function EditBookForm({ book, onSuccess }: { book: BookResponse; onSuccess: () => void }) {
  const { t } = useTranslation('product')
  const queryClient = useQueryClient()

  // --- THUMBNAIL STATE ---
  const [previewThumb, setPreviewThumb] = useState<string>(book.thumbnail || '')

  // --- GALLERY STATE ---
  // 1. Ảnh cũ từ DB (Đã fix lỗi any)
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>(
    book.images?.map((img: BookImageDTO) => {
      if (typeof img === 'string') return { id: img, url: img }
      return { id: img.id, url: img.imageUrl || '' }
    }) ?? []
  )

  // 2. Preview cho ảnh mới thêm (Đã xóa state newGalleryFiles bị thừa)
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([])

  // 3. ID các ảnh cũ cần xóa
  const [deleteImageIds, setDeleteImageIds] = useState<string[]>([])

  // --- QUERIES ---
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getAllCategoriesApi()
  })
  const { data: authorsData, isLoading: isAuthorsLoading } = useQuery({
    queryKey: ['authors'],
    queryFn: () => getAllAuthorsApi()
  })
  const { data: publishersData, isLoading: isPublishersLoading } = useQuery({
    queryKey: ['publishers'],
    queryFn: () => getAllPublishersApi()
  })
  const { data: tagsData, isLoading: isTagsLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => getAllTagsApi()
  })

  const categories = categoriesData || []
  const authors = authorsData || []
  const publishers = publishersData || []
  const tags = tagsData || []

  // --- FORM CONFIG ---
  const form = useForm<BookFormValues>({
    resolver: zodResolver(
      getBookSchema(t as unknown as (key: string) => string)
    ) as unknown as import('react-hook-form').Resolver<BookFormValues>,
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
      galleryFiles: [] // Khởi tạo rỗng để dễ quản lý
    }
  })

  const { errors } = form.formState

  // --- HANDLERS ---
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue('thumbnailFile', file)
      setPreviewThumb(URL.createObjectURL(file))
    }
  }

  // 👉 Đã fix: Lưu trực tiếp vào form, không cần state thừa
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      const previews = files.map((f) => URL.createObjectURL(f))

      const currentFiles = (form.getValues('galleryFiles') as File[]) || []
      form.setValue('galleryFiles', [...currentFiles, ...files])

      setNewGalleryPreviews((prev) => [...prev, ...previews])
    }
  }

  // Xóa ảnh cũ
  const removeExistingImage = (id: string) => {
    if (!id) return
    setExistingImages((prev) => prev.filter((img) => img.id !== id))
    setDeleteImageIds((prev) => [...prev, id])
  }

  // 👉 Đã fix: Xóa ảnh mới trực tiếp khỏi form
  const removeNewImage = (index: number) => {
    const currentFiles = (form.getValues('galleryFiles') as File[]) || []
    const updatedFiles = currentFiles.filter((_, i) => i !== index)
    form.setValue('galleryFiles', updatedFiles)

    setNewGalleryPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // --- MUTATION ---
  const mutation = useMutation({
    mutationFn: (values: BookFormValues) => {
      const requestData = {
        ...values,
        deleteImageIds: deleteImageIds
      }
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
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        t('book.messages.updateError')
      toast.error(msg)
    }
  })

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className='space-y-6'>
      <div className='border rounded-lg p-4 space-y-4 bg-card'>
        <h3 className='font-semibold text-lg border-b pb-2'>{t('book.form.section1')}</h3>
        <div className='grid grid-cols-2 gap-4'>
          <div className='col-span-2 space-y-2'>
            <Label className={errors.title ? 'text-red-500' : ''}>
              {t('book.form.title')} <span className='text-red-500'>*</span>
            </Label>
            <Input
              {...form.register('title')}
              placeholder={t('book.form.titlePlaceholder')}
              className={errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.title && (
              <p className='text-xs text-red-500 font-medium'>{errors.title.message}</p>
            )}
          </div>
          <div className='col-span-2 space-y-2'>
            <Label>{t('book.form.isbn')}</Label>
            <Input {...form.register('isbn')} placeholder={t('book.form.isbnPlaceholder')} />
          </div>
          <div className='col-span-2 space-y-2'>
            <Label>{t('book.form.description')}</Label>
            <Textarea
              {...form.register('description')}
              rows={4}
              placeholder={t('book.form.descPlaceholder')}
            />
          </div>
        </div>
      </div>

      <div className='border rounded-lg p-4 space-y-4 bg-card'>
        <h3 className='font-semibold text-lg border-b pb-2'>{t('book.form.section2')}</h3>
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label className={errors.salePrice ? 'text-red-500' : ''}>
              {t('book.form.salePrice')} <span className='text-red-500'>*</span>
            </Label>
            <Input
              type='number'
              {...form.register('salePrice', { valueAsNumber: true })}
              className={errors.salePrice ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.salePrice && (
              <p className='text-xs text-red-500 font-medium'>{errors.salePrice.message}</p>
            )}
          </div>
          <div className='space-y-2'>
            <Label className={errors.originalPrice ? 'text-red-500' : ''}>
              {t('book.form.originalPrice')}
            </Label>
            <Input
              type='number'
              {...form.register('originalPrice', { valueAsNumber: true })}
              className={errors.originalPrice ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.originalPrice && (
              <p className='text-xs text-red-500 font-medium'>{errors.originalPrice.message}</p>
            )}
          </div>
          <div className='space-y-2'>
            <Label>
              {t('book.form.stockQuantity')} <span className='text-red-500'>*</span>
            </Label>
            <Input
              type='number'
              disabled
              {...form.register('stockQuantity', { valueAsNumber: true })}
              className='bg-muted cursor-not-allowed'
            />
            <p className='text-[10px] text-muted-foreground italic mt-1'>
              {t('book.form.stockNote')}
            </p>
          </div>
          <div className='space-y-2'>
            <Label>{t('common.status')}</Label>
            <Controller
              control={form.control}
              name='status'
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
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
        </div>
      </div>

      <div className='border rounded-lg p-4 space-y-4 bg-card'>
        <h3 className='font-semibold text-lg border-b pb-2'>{t('book.form.section3')}</h3>
        <div className='grid grid-cols-2 gap-6'>
          <div className='col-span-2 space-y-3'>
            <Label>{t('book.form.publisher', 'Nhà xuất bản')}</Label>
            <Controller
              control={form.control}
              name='publisherId'
              render={({ field }) => (
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  disabled={isPublishersLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('book.form.publisherPlaceholder', 'Chọn nhà xuất bản...')}
                    />
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

          <div className='space-y-3'>
            <Label>{t('book.form.category')}</Label>
            <Controller
              control={form.control}
              name='categoryIds'
              render={({ field }) => {
                const currentValues = (field.value as string[]) || []
                return (
                  <div className='flex flex-wrap gap-2 p-3 border rounded-md min-h-[80px] bg-muted/20'>
                    {isCategoriesLoading ? (
                      <Loader2 className='h-4 w-4 animate-spin text-muted-foreground m-auto' />
                    ) : categories.length === 0 ? (
                      <span className='text-xs text-muted-foreground m-auto'>
                        {t('book.form.noCategory')}
                      </span>
                    ) : (
                      categories.map((c: CategoryResponse) => {
                        const isSelected = currentValues.includes(c.id)
                        return (
                          <Badge
                            key={c.id}
                            variant={isSelected ? 'default' : 'outline'}
                            className={`cursor-pointer hover:opacity-80 transition-all ${isSelected ? 'shadow-sm' : ''}`}
                            onClick={() => {
                              const newValue = isSelected
                                ? currentValues.filter((id: string) => id !== c.id)
                                : [...currentValues, c.id]
                              field.onChange(newValue)
                            }}
                          >
                            {c.categoryName}
                          </Badge>
                        )
                      })
                    )}
                  </div>
                )
              }}
            />
          </div>

          <div className='space-y-3'>
            <Label>{t('book.form.author')}</Label>
            <Controller
              control={form.control}
              name='authorIds'
              render={({ field }) => {
                const currentValues = (field.value as string[]) || []
                return (
                  <div className='flex flex-wrap gap-2 p-3 border rounded-md min-h-[80px] bg-muted/20'>
                    {isAuthorsLoading ? (
                      <Loader2 className='h-4 w-4 animate-spin text-muted-foreground m-auto' />
                    ) : authors.length === 0 ? (
                      <span className='text-xs text-muted-foreground m-auto'>
                        {t('book.form.noAuthor')}
                      </span>
                    ) : (
                      authors.map((a: AuthorResponse) => {
                        const isSelected = currentValues.includes(a.id)
                        return (
                          <Badge
                            key={a.id}
                            variant={isSelected ? 'default' : 'outline'}
                            className={`cursor-pointer hover:opacity-80 transition-all ${isSelected ? 'shadow-sm' : ''}`}
                            onClick={() => {
                              const newValue = isSelected
                                ? currentValues.filter((id: string) => id !== a.id)
                                : [...currentValues, a.id]
                              field.onChange(newValue)
                            }}
                          >
                            {a.name}
                          </Badge>
                        )
                      })
                    )}
                  </div>
                )
              }}
            />
          </div>

          <div className='col-span-2 space-y-3'>
            <Label>{t('book.form.tag', 'Nhãn hiển thị')}</Label>
            <Controller
              control={form.control}
              name='tagIds'
              render={({ field }) => {
                const currentValues = (field.value as string[]) || []
                return (
                  <div className='flex flex-wrap gap-2 p-3 border rounded-md min-h-[60px] bg-muted/20'>
                    {isTagsLoading ? (
                      <Loader2 className='h-4 w-4 animate-spin text-muted-foreground m-auto' />
                    ) : tags.length === 0 ? (
                      <span className='text-xs text-muted-foreground m-auto'>
                        {t('book.form.noTag', 'Chưa có nhãn nào')}
                      </span>
                    ) : (
                      tags.map((tItem: TagResponse) => {
                        const isSelected = currentValues.includes(tItem.id)
                        const badgeStyle = isSelected
                          ? {
                              backgroundColor: tItem.color || 'var(--primary)',
                              color: '#fff',
                              borderColor: tItem.color || 'var(--primary)'
                            }
                          : {
                              borderColor: tItem.color || 'var(--primary)',
                              color: tItem.color || 'var(--primary)',
                              backgroundColor: 'transparent'
                            }

                        return (
                          <Badge
                            key={tItem.id}
                            variant={isSelected ? 'default' : 'outline'}
                            style={badgeStyle}
                            className={`cursor-pointer hover:opacity-80 transition-all ${isSelected ? 'shadow-sm' : ''}`}
                            onClick={() => {
                              const newValue = isSelected
                                ? currentValues.filter((id: string) => id !== tItem.id)
                                : [...currentValues, tItem.id]
                              field.onChange(newValue)
                            }}
                          >
                            {tItem.name}
                          </Badge>
                        )
                      })
                    )}
                  </div>
                )
              }}
            />
          </div>
        </div>
      </div>

      <div className='border rounded-lg p-4 space-y-4 bg-card'>
        <h3 className='font-semibold text-lg border-b pb-2'>{t('book.form.section4')}</h3>
        <div className='grid grid-cols-3 gap-4'>
          <div className='space-y-2'>
            <Label>{t('book.form.format')}</Label>
            <Controller
              control={form.control}
              name='format'
              render={({ field }) => (
                <Select value={field.value || ''} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('book.form.formatPlaceholder')} />
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
            <Label>{t('book.form.language')}</Label>
            <Input {...form.register('language')} />
          </div>
          <div className='space-y-2'>
            <Label className={errors.pageCount ? 'text-red-500' : ''}>
              {t('book.form.pageCount')}
            </Label>
            <Input
              type='number'
              {...form.register('pageCount', { valueAsNumber: true })}
              className={errors.pageCount ? 'border-red-500' : ''}
            />
            {errors.pageCount && (
              <p className='text-[10px] text-red-500'>{errors.pageCount.message}</p>
            )}
          </div>
          <div className='space-y-2'>
            <Label className={errors.publicationYear ? 'text-red-500' : ''}>
              {t('book.form.publicationYear')}
            </Label>
            <Input
              type='number'
              {...form.register('publicationYear', { valueAsNumber: true })}
              className={errors.publicationYear ? 'border-red-500' : ''}
            />
            {errors.publicationYear && (
              <p className='text-[10px] text-red-500'>{errors.publicationYear.message}</p>
            )}
          </div>
          <div className='space-y-2'>
            <Label>{t('book.form.dimensions')}</Label>
            <Input {...form.register('dimensions')} />
          </div>
          <div className='space-y-2'>
            <Label className={errors.weight ? 'text-red-500' : ''}>{t('book.form.weight')}</Label>
            <Input
              type='number'
              {...form.register('weight', { valueAsNumber: true })}
              className={errors.weight ? 'border-red-500' : ''}
            />
            {errors.weight && <p className='text-[10px] text-red-500'>{errors.weight.message}</p>}
          </div>
        </div>
      </div>

      <div className='border rounded-lg p-4 space-y-4 bg-card'>
        <h3 className='font-semibold text-lg border-b pb-2'>{t('book.form.section5')}</h3>
        <div className='flex flex-col md:flex-row gap-8 items-start'>
          <div className='space-y-3 shrink-0'>
            <Label className='font-semibold'>
              {t('book.form.mainImage')} <span className='text-red-500'>*</span>
            </Label>
            <div
              className='h-48 w-36 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group hover:bg-accent/50 transition-colors'
              onClick={() => document.getElementById('thumb-edit')?.click()}
            >
              {previewThumb ? (
                <img src={previewThumb} alt='thumbnail' className='w-full h-full object-cover' />
              ) : (
                <div className='text-center text-muted-foreground p-2'>
                  <UploadCloud className='mx-auto h-8 w-8 mb-2' />
                  <span className='text-xs'>{t('book.form.uploadCover')}</span>
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
          </div>

          <div className='space-y-3 flex-1'>
            <Label className='font-semibold'>{t('book.form.gallery')}</Label>

            <div className='flex flex-wrap gap-4 items-start'>
              <div
                className='h-24 w-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors shrink-0'
                onClick={() => document.getElementById('gallery-edit')?.click()}
              >
                <Plus className='h-6 w-6 text-muted-foreground mb-1' />
                <span className='text-[10px] text-muted-foreground'>
                  {t('book.form.addGallery')}
                </span>
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
                  className='relative h-24 w-24 border-2 border-border rounded-md overflow-hidden group shadow-sm shrink-0'
                  title={t('book.form.oldImage', 'Ảnh hiện tại')}
                >
                  <img src={img.url} alt='gallery-old' className='w-full h-full object-cover' />
                  <button
                    type='button'
                    onClick={() => removeExistingImage(img.id)}
                    className='absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </div>
              ))}

              {newGalleryPreviews.map((src, idx) => (
                <div
                  key={idx}
                  className='relative h-24 w-24 border-2 border-blue-400/50 rounded-md overflow-hidden group shadow-sm shrink-0'
                  title={t('book.form.newImage', 'Ảnh mới thêm')}
                >
                  <img
                    src={src}
                    alt={`gallery-new-${idx}`}
                    className='w-full h-full object-cover'
                  />
                  <button
                    type='button'
                    onClick={() => removeNewImage(idx)}
                    className='absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='flex justify-end gap-3 border-t pt-4 sticky bottom-0 bg-background py-4 z-10'>
        <Button type='button' variant='ghost' onClick={onSuccess}>
          {t('common.cancel')}
        </Button>
        <Button type='submit' disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {t('book.form.btnUpdate')}
        </Button>
      </div>
    </form>
  )
}
