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

import { getNewsSchema, type NewsFormValues } from '../schema/news.schema'
import { updateNewsApi } from '@/services/news/news.api'
import { api } from '@/utils/axiosCustomize'
import type { NewsResponse, NewsRequest } from '@/services/news/news.type'

import { getAllCategoriesApi } from '@/services/category/category.api'
import { getAllTagsApi } from '@/services/tag/tag.api'
import { getAllBooksApi } from '@/services/book/book.api'

import type { CategoryResponse } from '@/services/category/category.type'
import type { TagResponse } from '@/services/tag/tag.type'
import type { BookResponse } from '@/services/book/book.type'
import { NewsStatus } from '@/defines/news.enum'

interface EditNewsFormProps {
  news: NewsResponse
  onSuccess: () => void
}

export function EditNewsForm({ news, onSuccess }: EditNewsFormProps) {
  const { t } = useTranslation('news')
  const queryClient = useQueryClient()

  // Lưu link ảnh cũ. Nếu người dùng xóa ảnh, biến này = null
  const [previewThumb, setPreviewThumb] = useState<string | null>(news.thumbnail || null)
  // Đánh dấu xem Admin có muốn xóa hẳn ảnh bìa trên DB không
  const [isDeletedThumbnail, setIsDeletedThumbnail] = useState<boolean>(false)

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getAllCategoriesApi()
  })
  const { data: tags = [] } = useQuery({ queryKey: ['tags'], queryFn: () => getAllTagsApi() })
  const { data: books = [] } = useQuery({ queryKey: ['books'], queryFn: () => getAllBooksApi() })

  const form = useForm<NewsFormValues>({
    // Truyền true vào tham số thứ 2 để Schema biết đây là Edit, không bắt buộc up ảnh
    resolver: zodResolver(
      getNewsSchema(t as unknown as (key: string) => string, true)
    ) as unknown as import('react-hook-form').Resolver<NewsFormValues>,
    defaultValues: {
      title: news.title || '',
      summary: news.summary || '',
      content: news.content || '',
      status: news.status,
      categoryId: news.categoryId || null,
      // Chú ý: Dựa vào logic API của bạn để map tagIds và bookIds. Nếu API Response chưa trả về mảng IDs, có thể để []
      tagIds: [],
      bookIds: [],
      metaTitle: news.metaTitle || '',
      metaDescription: news.metaDescription || '',
      thumbnailFile: null
    }
  })

  const { errors } = form.formState

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue('thumbnailFile', file, { shouldValidate: true })
      setPreviewThumb(URL.createObjectURL(file))
      setIsDeletedThumbnail(false) // Nếu up ảnh mới thì hủy lệnh xóa ảnh cũ
    }
  }

  const handleRemoveThumbnail = (e: React.MouseEvent) => {
    e.stopPropagation() // Chống click nhầm vào div upload
    setPreviewThumb(null)
    form.setValue('thumbnailFile', null)
    setIsDeletedThumbnail(true) // Gửi cờ này xuống Backend để nó xóa link trên AWS S3
  }

  const mutation = useMutation({
    mutationFn: (values: NewsFormValues) => {
      // Đóng gói payload có kèm cờ deleteThumbnail
      const payload: NewsRequest = {
        ...values,
        deleteThumbnail: isDeletedThumbnail
      }
      return updateNewsApi(news.id, payload)
    },
    onSuccess: () => {
      toast.success(t('message.success.update'))
      queryClient.invalidateQueries({ queryKey: ['news'] })
      onSuccess()
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        t('message.error.update')
      toast.error(msg)
    }
  })

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className='space-y-6'>
      <div className='border rounded-lg p-4 space-y-4 bg-card'>
        <h3 className='font-semibold text-lg border-b pb-2'>{t('form.sections.basic')}</h3>
        <div className='grid grid-cols-2 gap-4'>
          <div className='col-span-2 space-y-2'>
            <Label className={errors.title ? 'text-red-500' : ''}>
              {t('fields.title.label')} *
            </Label>
            <Input
              {...form.register('title')}
              placeholder={t('fields.title.placeholder')}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className='text-[10px] text-red-500'>{errors.title.message}</p>}
          </div>
          <div className='col-span-2 space-y-2'>
            <Label>{t('fields.summary.label')}</Label>
            <Textarea
              rows={3}
              {...form.register('summary')}
              placeholder={t('fields.summary.placeholder')}
            />
          </div>
        </div>
      </div>

      <div className='border rounded-lg p-4 space-y-4 bg-card'>
        <h3 className='font-semibold text-lg border-b pb-2'>{t('form.sections.content')} *</h3>
        <div className={`space-y-2 ${errors.content ? 'border border-red-500 rounded p-1' : ''}`}>
          <Controller
            control={form.control}
            name='content'
            render={({ field }) => (
              <Editor
                tinymceScriptSrc='https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2/tinymce.min.js'
                onEditorChange={(content) => field.onChange(content)}
                value={field.value}
                init={{
                  ui_mode: 'split',
                  ui_container: document.body,
                  height: 700, // Tăng chiều cao cho giống trang giấy
                  menubar: 'file edit view insert format tools table help', // Hiện menu như Word
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
                    'accordion',
                    'visualchars',
                    'quickbars',
                    'nonbreaking',
                    'directionality'
                  ],
                  toolbar:
                    'undo redo | accordion | blocks fontfamily fontsize | ' +
                    'bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | ' +
                    'bullist numlist outdent indent | forecolor backcolor removeformat | ' +
                    'table image media link | charmap emoticons | fullscreen preview print | help',

                  // Cấu hình giao diện giống Word (Modern look)
                  toolbar_sticky: true,
                  toolbar_mode: 'sliding',
                  contextmenu: 'link image table',
                  promotion: false,
                  branding: false,
                  quickbars_selection_toolbar:
                    'bold italic | quicklink h2 h3 blockquote quickimage quicktable',

                  // 1. CHỈNH FONT CHUẨN WORD
                  font_family_formats:
                    'Segoe UI=Segoe UI; Arial=arial,helvetica,sans-serif; Times New Roman=times new roman,times; Courier New=courier new,courier; Tahoma=tahoma,arial,helvetica,sans-serif;',
                  font_size_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',

                  // 2. TẠO HIỆU ỨNG TRANG GIẤY (PAGE LOOK)
                  content_style: `
      body { 
        font-family: "Segoe UI", Tahoma, sans-serif; 
        font-size: 14px; 
        line-height: 1.6;
        background-color: #f4f4f5; /* Màu xám nền ngoài trang giấy */
        padding: 20px !important;
        display: flex;
        justify-content: center;
      }
      /* Giả lập tờ giấy A4 trắng */
      .mce-content-body {
        background-color: white !important;
        width: 100%;
        max-width: 850px; /* Độ rộng chuẩn văn bản */
        min-height: 1000px;
        padding: 50px !important;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        margin: 0 auto;
        border: 1px solid #e2e8f0;
      }
      img { max-width: 100%; height: auto; border-radius: 8px; }
      table { border-collapse: collapse; width: 100%; }
      table, th, td { border: 1px solid #cbd5e1; padding: 8px; }
    `,

                  // 3. HANDLER UPLOAD ẢNH (GIỮ NGUYÊN LOGIC CỦA BẠN)
                  images_upload_handler: async (blobInfo: {
                    blob: () => Blob
                    filename: () => string
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
                      toast.error('Lỗi khi upload ảnh!')
                      throw new Error('Upload failed')
                    }
                  }
                }}
              />
            )}
          />
          {errors.content && <p className='text-[10px] text-red-500'>{errors.content.message}</p>}
        </div>
      </div>

      <div className='border rounded-lg p-4 space-y-4 bg-card'>
        <h3 className='font-semibold text-lg border-b pb-2'>{t('form.sections.media')}</h3>
        <div className='space-y-3'>
          <div
            className={`h-48 w-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group transition-colors ${errors.thumbnailFile ? 'border-red-500 bg-red-50/50' : 'hover:bg-accent/50'}`}
            onClick={() => document.getElementById('news-thumb-edit')?.click()}
          >
            {previewThumb ? (
              <>
                <img src={previewThumb} alt='thumbnail' className='w-full h-full object-cover' />
                <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                  <span className='text-white text-sm font-medium'>Đổi ảnh khác</span>
                </div>
                {/* Nút xóa ảnh */}
                <button
                  type='button'
                  onClick={handleRemoveThumbnail}
                  className='absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors z-10'
                  title={t('actions.removeImage')}
                >
                  <X className='w-4 h-4' />
                </button>
              </>
            ) : (
              <div className='text-center text-muted-foreground p-2'>
                <UploadCloud className='mx-auto h-8 w-8 mb-2' />
                <span className='text-xs'>{t('fields.thumbnail.placeholder')}</span>
              </div>
            )}
          </div>
          <input
            id='news-thumb-edit'
            type='file'
            className='hidden'
            accept='image/*'
            onChange={handleThumbnailChange}
          />
          {errors.thumbnailFile && (
            <p className='text-[10px] text-red-500 font-medium'>{errors.thumbnailFile.message}</p>
          )}
        </div>
      </div>

      <div className='border rounded-lg p-4 space-y-4 bg-card'>
        <h3 className='font-semibold text-lg border-b pb-2'>{t('form.sections.classify')}</h3>
        <div className='grid grid-cols-2 gap-4'>
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

          <div className='col-span-2 space-y-2'>
            <Label>{t('fields.tags.label')}</Label>
            <Controller
              control={form.control}
              name='tagIds'
              render={({ field }) => {
                const currentValues = field.value || []
                return (
                  <div className='flex flex-wrap gap-2 p-3 border rounded-md min-h-[60px] bg-muted/20'>
                    {tags.map((tag: TagResponse) => {
                      const isSelected = currentValues.includes(tag.id)
                      return (
                        <Badge
                          key={tag.id}
                          variant={isSelected ? 'default' : 'outline'}
                          className='cursor-pointer'
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
                  </div>
                )
              }}
            />
          </div>

          <div className='col-span-2 space-y-2'>
            <Label>{t('fields.books.label')}</Label>
            <Controller
              control={form.control}
              name='bookIds'
              render={({ field }) => {
                const currentValues = field.value || []
                return (
                  <div className='flex flex-wrap gap-2 p-3 border rounded-md min-h-[60px] bg-muted/20'>
                    {books.map((book: BookResponse) => {
                      const isSelected = currentValues.includes(book.id)
                      return (
                        <Badge
                          key={book.id}
                          variant={isSelected ? 'default' : 'secondary'}
                          className='cursor-pointer'
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
                  </div>
                )
              }}
            />
          </div>
        </div>
      </div>

      <div className='flex justify-end gap-3 border-t pt-4 sticky bottom-0 bg-background py-4 z-10'>
        <Button type='button' variant='ghost' onClick={onSuccess}>
          {t('actions.cancel')}
        </Button>
        <Button type='submit' disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {t('actions.edit')}
        </Button>
      </div>
    </form>
  )
}
