'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, UploadCloud, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Editor } from '@tinymce/tinymce-react'

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

import { getNewsSchema, type NewsFormValues } from '../schema/news.schema'
import { createNewsApi } from '@/services/news/news.api'
import { NewsStatus } from '@/defines/news.enum'
import { api } from '@/utils/axiosCustomize'

import { getAllCategoriesApi } from '@/services/category/category.api'
import { getAllTagsApi } from '@/services/tag/tag.api'
import { getAllBooksApi } from '@/services/book/book.api'

import type { CategoryResponse } from '@/services/category/category.type'
import type { TagResponse } from '@/services/tag/tag.type'
import type { BookResponse } from '@/services/book/book.type'
import type { NewsRequest } from '@/services/news/news.type'

export function CreateNewsForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation('news')
  const queryClient = useQueryClient()

  const [previewThumb, setPreviewThumb] = useState<string | null>(null)

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategoriesApi
  })
  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: getAllTagsApi
  })
  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: getAllBooksApi
  })

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(
      getNewsSchema(t as unknown as (key: string) => string)
    ) as unknown as import('react-hook-form').Resolver<NewsFormValues>,
    defaultValues: {
      title: '',
      summary: '',
      content: '',
      status: NewsStatus.DRAFT,
      categoryId: null,
      tagIds: [],
      bookIds: [],
      metaTitle: '',
      metaDescription: '',
      thumbnailFile: null
    }
  })

  const { errors } = form.formState

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue('thumbnailFile', file, { shouldValidate: true })
      setPreviewThumb(URL.createObjectURL(file))
    }
  }

  const clearThumbnail = () => {
    form.setValue('thumbnailFile', null, { shouldValidate: true })
    setPreviewThumb(null)
  }

  const mutation = useMutation({
    mutationFn: (values: NewsFormValues) => createNewsApi(values as unknown as NewsRequest),
    onSuccess: () => {
      toast.success(t('message.success.create'))
      queryClient.invalidateQueries({ queryKey: ['news'] })
      onSuccess()
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        t('message.error.create')
      toast.error(msg)
    }
  })

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className='space-y-6'>
      {/* 1. THÔNG TIN CƠ BẢN + ẢNH BÌA (2 cột) */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Cột trái: Tiêu đề, Mô tả ngắn */}
        <Card className='lg:col-span-2'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base font-medium flex items-center gap-2'>
              <span className='i-lucide-file-text h-4 w-4' />
              {t('form.sections.basic', 'Thông tin cơ bản')}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label className={errors.title ? 'text-destructive' : ''}>
                {t('fields.title.label')} <span className='text-destructive'>*</span>
              </Label>
              <Input
                {...form.register('title')}
                placeholder={t('fields.title.placeholder')}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && <p className='text-xs text-destructive'>{errors.title.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label>{t('fields.summary.label')}</Label>
              <Textarea
                rows={3}
                {...form.register('summary')}
                placeholder={t('fields.summary.placeholder')}
                className='resize-none'
              />
            </div>

            {/* Meta title & description (nằm gọn trong card này) */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2'>
              <div className='space-y-2'>
                <Label>{t('fields.metaTitle.label', 'Meta Title')}</Label>
                <Input
                  {...form.register('metaTitle')}
                  placeholder={t('fields.metaTitle.placeholder', 'SEO title...')}
                />
              </div>
              <div className='space-y-2'>
                <Label>{t('fields.metaDescription.label', 'Meta Description')}</Label>
                <Input
                  {...form.register('metaDescription')}
                  placeholder={t('fields.metaDescription.placeholder', 'SEO description...')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cột phải: Ảnh bìa + Category + Status */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base font-medium flex items-center gap-2'>
              <span className='i-lucide-image h-4 w-4' />
              {t('form.sections.media', 'Ảnh bìa & Phân loại')}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Upload ảnh */}
            <div className='space-y-2'>
              <Label>
                {t('fields.thumbnail.label', 'Ảnh đại diện')}{' '}
                <span className='text-destructive'>*</span>
              </Label>
              <div
                className={`relative w-full aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer overflow-hidden group transition-colors ${
                  errors.thumbnailFile
                    ? 'border-destructive bg-destructive/5'
                    : 'hover:bg-accent/50'
                }`}
                onClick={() => document.getElementById('news-thumb')?.click()}
              >
                {previewThumb ? (
                  <>
                    <img
                      src={previewThumb}
                      alt='thumbnail'
                      className='w-full h-full object-cover'
                    />
                    <Button
                      type='button'
                      variant='destructive'
                      size='icon'
                      className='absolute top-2 right-2 h-7 w-7 opacity-90'
                      onClick={(e) => {
                        e.stopPropagation()
                        clearThumbnail()
                      }}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </>
                ) : (
                  <div className='text-center text-muted-foreground p-4'>
                    <UploadCloud className='mx-auto h-8 w-8 mb-2' />
                    <span className='text-sm'>{t('fields.thumbnail.placeholder')}</span>
                    <p className='text-xs mt-1 text-muted-foreground/70'>
                      {t('fields.thumbnail.hint', 'JPG, PNG, WebP (tối đa 2MB)')}
                    </p>
                  </div>
                )}
              </div>
              <input
                id='news-thumb'
                type='file'
                className='hidden'
                accept='image/*'
                onChange={handleThumbnailChange}
              />
              {errors.thumbnailFile && (
                <p className='text-xs text-destructive'>{errors.thumbnailFile.message}</p>
              )}
            </div>

            <div className='grid grid-cols-1 gap-3'>
              <div className='space-y-2'>
                <Label>{t('fields.category.label')}</Label>
                <Controller
                  control={form.control}
                  name='categoryId'
                  render={({ field }) => (
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('fields.category.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c: CategoryResponse) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className='space-y-2'>
                <Label>{t('fields.status.label')}</Label>
                <Controller
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(NewsStatus).map((s) => (
                          <SelectItem key={s} value={s}>
                            {t(`fields.status.options.${s}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. NỘI DUNG BÀI VIẾT (EDITOR) */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base font-medium flex items-center gap-2'>
            <span className='i-lucide-pencil h-4 w-4' />
            {t('form.sections.content', 'Nội dung bài viết')}{' '}
            <span className='text-destructive'>*</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={errors.content ? 'border border-destructive rounded-md p-1' : ''}>
            <Controller
              control={form.control}
              name='content'
              render={({ field }) => (
                <Editor
                  tinymceScriptSrc='https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2/tinymce.min.js'
                  onEditorChange={(content) => field.onChange(content)}
                  value={field.value}
                  init={{
                    height: 600,
                    menubar: 'file edit view insert format tools table help',
                    plugins: [
                      'advlist',
                      'autolink',
                      'lists',
                      'link',
                      'image',
                      'charmap',
                      'preview',
                      'anchor',
                      'searchreplace',
                      'visualblocks',
                      'code',
                      'fullscreen',
                      'insertdatetime',
                      'media',
                      'table',
                      'help',
                      'wordcount',
                      'emoticons',
                      'quickbars'
                    ],
                    toolbar:
                      'undo redo | blocks fontfamily fontsize | ' +
                      'bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | ' +
                      'bullist numlist outdent indent | forecolor backcolor removeformat | ' +
                      'table image media link | charmap emoticons | fullscreen preview print | help',
                    toolbar_sticky: true,
                    toolbar_mode: 'sliding',
                    contextmenu: 'link image table',
                    promotion: false,
                    branding: false,
                    quickbars_selection_toolbar:
                      'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
                    font_family_formats:
                      'Segoe UI=Segoe UI; Arial=arial,helvetica,sans-serif; Times New Roman=times new roman,times;',
                    font_size_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
                    content_style: `
                      body { 
                        font-family: "Segoe UI", Tahoma, sans-serif; 
                        font-size: 14px; 
                        line-height: 1.6;
                        background-color: #f4f4f5;
                        padding: 20px !important;
                        display: flex;
                        justify-content: center;
                      }
                      .mce-content-body {
                        background-color: white !important;
                        max-width: 850px;
                        min-height: 800px;
                        padding: 50px !important;
                        box-shadow: 0 0 15px rgba(0,0,0,0.05);
                        margin: 0 auto;
                        border: 1px solid #e2e8f0;
                      }
                      img { max-width: 100%; height: auto; border-radius: 8px; }
                      table { border-collapse: collapse; width: 100%; }
                      table, th, td { border: 1px solid #cbd5e1; padding: 8px; }
                    `,
                    images_upload_handler: async (blobInfo: {
                      blob: () => Blob
                      filename: () => string | undefined
                    }) => {
                      const formData = new FormData()
                      formData.append('file', blobInfo.blob(), blobInfo.filename())
                      try {
                        const res = await api.post('/files/upload', formData, {
                          headers: { 'Content-Type': 'multipart/form-data' }
                        })
                        const responseText = res.data as string
                        return responseText.includes('Upload thành công: ')
                          ? responseText.replace('Upload thành công: ', '').trim()
                          : responseText
                      } catch {
                        toast.error(t('message.error.uploadImage', 'Lỗi khi upload ảnh!'))
                        throw new Error('Upload failed')
                      }
                    }
                  }}
                />
              )}
            />
          </div>
          {errors.content && (
            <p className='text-xs text-destructive mt-1'>{errors.content.message}</p>
          )}
        </CardContent>
      </Card>

      {/* 3. TAGS & SÁCH LIÊN KẾT */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base font-medium flex items-center gap-2'>
            <span className='i-lucide-tags h-4 w-4' />
            {t('form.sections.classify', 'Tags & Sách liên kết')}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Tags */}
          <div className='space-y-2'>
            <Label>{t('fields.tags.label')}</Label>
            <Controller
              control={form.control}
              name='tagIds'
              render={({ field }) => {
                const currentValues = field.value || []
                return (
                  <ScrollArea className='h-28 rounded-md border p-3 bg-muted/10'>
                    <div className='flex flex-wrap gap-2'>
                      {tags.map((tag: TagResponse) => {
                        const isSelected = currentValues.includes(tag.id)
                        return (
                          <Badge
                            key={tag.id}
                            variant={isSelected ? 'default' : 'outline'}
                            className='cursor-pointer transition-colors'
                            onClick={() => {
                              const newVal = isSelected
                                ? currentValues.filter((id) => id !== tag.id)
                                : [...currentValues, tag.id]
                              field.onChange(newVal)
                            }}
                          >
                            {tag.name}
                          </Badge>
                        )
                      })}
                      {tags.length === 0 && (
                        <p className='text-sm text-muted-foreground'>{t('common.noData')}</p>
                      )}
                    </div>
                  </ScrollArea>
                )
              }}
            />
          </div>

          {/* Sách liên kết */}
          <div className='space-y-2'>
            <Label>{t('fields.books.label')}</Label>
            <Controller
              control={form.control}
              name='bookIds'
              render={({ field }) => {
                const currentValues = field.value || []
                return (
                  <ScrollArea className='h-28 rounded-md border p-3 bg-muted/10'>
                    <div className='flex flex-wrap gap-2'>
                      {books.map((book: BookResponse) => {
                        const isSelected = currentValues.includes(book.id)
                        return (
                          <Badge
                            key={book.id}
                            variant={isSelected ? 'secondary' : 'outline'}
                            className='cursor-pointer transition-colors'
                            onClick={() => {
                              const newVal = isSelected
                                ? currentValues.filter((id) => id !== book.id)
                                : [...currentValues, book.id]
                              field.onChange(newVal)
                            }}
                          >
                            {book.title}
                          </Badge>
                        )
                      })}
                      {books.length === 0 && (
                        <p className='text-sm text-muted-foreground'>{t('common.noData')}</p>
                      )}
                    </div>
                  </ScrollArea>
                )
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. HÀNH ĐỘNG (STICKY) */}
      <div className='flex justify-end gap-3 pt-2 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-t'>
        <Button type='button' variant='outline' onClick={onSuccess}>
          {t('actions.cancel')}
        </Button>
        <Button type='submit' disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {t('actions.create')}
        </Button>
      </div>
    </form>
  )
}
