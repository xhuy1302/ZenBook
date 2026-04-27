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
  FolderOpen,
  Tag,
  BookOpen,
  Search,
  Sparkles,
  Eye,
  Calendar,
  Link as LinkIcon,
  Mic
} from 'lucide-react'
import { FaFacebook } from 'react-icons/fa' // Import icon Facebook
import { useTranslation } from 'react-i18next'
import { Editor } from '@tinymce/tinymce-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

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

/* ─────────────────────────────────────────────────────────────────────────────
   Sidebar section wrapper
───────────────────────────────────────────────────────────────────────────── */
function SideSection({ icon: Icon, title, iconClass, children }: any) {
  return (
    <div className='border-b border-slate-100 last:border-0 px-4 py-4 space-y-3'>
      <div className='flex items-center gap-2'>
        <div className={cn('flex h-6 w-6 items-center justify-center rounded-md', iconClass)}>
          <Icon className='h-3.5 w-3.5' />
        </div>
        <span className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>
          {title}
        </span>
      </div>
      {children}
    </div>
  )
}

function FieldLabel({ children, required }: any) {
  return (
    <p className='text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5'>
      {children}
      {required && <span className='text-red-500 ml-0.5'>*</span>}
    </p>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT XEM TRƯỚC (FULLSCREEN PREVIEW)
───────────────────────────────────────────────────────────────────────────── */
function NewsPreviewModal({ open, onClose, formData, categories, previewThumb }: any) {
  // Lấy tên danh mục từ ID
  const categoryName =
    categories.find((c: any) => c.id === formData.categoryId)?.categoryName || 'Tin tức'

  // Mock dữ liệu ảo cho giống bài thật
  const mockPost = {
    title: formData.title || 'Tiêu đề bài viết sẽ hiển thị ở đây...',
    summary: formData.summary || 'Tóm tắt nội dung bài viết sẽ hiển thị ở đây...',
    content: formData.content || '<p class="text-slate-400 italic">Chưa có nội dung...</p>',
    thumbnail: previewThumb,
    categoryName: categoryName,
    publishedAt: new Date().toISOString(),
    viewCount: 0,
    authorName: 'Admin (Bản nháp)'
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className='max-w-none w-screen h-[100dvh] m-0 p-0 border-none rounded-none bg-slate-50 overflow-y-auto z-[99999] custom-scrollbar'
        showCloseButton={false} // Tắt nút close mặc định để tự làm thanh sticky
      >
        {/* THANH CÔNG CỤ XEM TRƯỚC (STICKY) */}
        <div className='sticky top-0 z-[100] flex items-center justify-between px-6 py-3 bg-slate-900 text-white shadow-md'>
          <div className='flex items-center gap-3'>
            <div className='w-3 h-3 rounded-full bg-rose-500 animate-pulse' />
            <span className='text-sm font-bold tracking-wide uppercase'>Chế độ Xem Trước</span>
            <span className='text-xs text-slate-400 hidden md:inline-block'>
              (Giao diện hiển thị thực tế trên Website)
            </span>
          </div>
          <Button
            onClick={onClose}
            className='bg-white/10 hover:bg-white/20 text-white h-9 rounded-lg font-semibold'
          >
            <X className='w-4 h-4 mr-1.5' /> Đóng xem trước
          </Button>
        </div>

        {/* ── GIAO DIỆN MOCK Y HỆT TRANG BLOG DETAIL PUBLIC ── */}
        <div className='flex flex-col min-h-screen bg-white'>
          {/* Mock Header & Breadcrumb */}
          <div className='h-[60px] border-b border-slate-100 bg-white flex items-center px-8'>
            <div className='text-xl font-serif font-black text-brand-green'>ZenBook</div>
            <div className='ml-10 text-sm text-slate-400 flex gap-2'>
              <span>Trang chủ</span> <span>/</span> <span>Blog</span> <span>/</span>{' '}
              <span className='text-slate-800'>{mockPost.title}</span>
            </div>
          </div>

          <main className='flex-1 max-w-[800px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8'>
            <header className='mb-8'>
              <div className='flex items-center gap-2 mb-4'>
                <span className='px-3 py-1 text-[11px] font-black uppercase tracking-wider text-brand-green bg-brand-green/10 rounded-md'>
                  {mockPost.categoryName}
                </span>
              </div>
              <h1 className='text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-4 break-words'>
                {mockPost.title}
              </h1>
              <p className='text-lg text-slate-600 font-medium leading-relaxed mb-6 break-words'>
                {mockPost.summary}
              </p>

              <div className='flex flex-wrap items-center justify-between gap-4 text-[13px] text-slate-500 font-medium'>
                <div className='flex items-center gap-4'>
                  <span className='flex items-center gap-1.5'>
                    <Calendar className='w-4 h-4' />
                    {new Date(mockPost.publishedAt).toLocaleDateString('vi-VN')}
                  </span>
                  <span className='flex items-center gap-1.5'>
                    <Eye className='w-4 h-4' />
                    {mockPost.viewCount} lượt xem
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400'>
                    <FaFacebook className='w-4 h-4' />
                  </div>
                  <div className='w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400'>
                    <LinkIcon className='w-4 h-4' />
                  </div>
                </div>
              </div>
            </header>

            {/* Fake Audio Player UI */}
            <div className='flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4 border-y border-slate-100 my-6 bg-slate-50/50 rounded-xl opacity-60'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500'>
                  <Mic className='w-5 h-5' />
                </div>
                <div>
                  <p className='text-[11px] text-slate-500 uppercase font-bold tracking-wider'>
                    Nghe bài viết
                  </p>
                  <p className='text-sm font-bold text-slate-800'>{mockPost.authorName}</p>
                </div>
              </div>
              <div className='text-xs italic text-slate-400'>
                *Trình phát Audio bị vô hiệu hóa trong chế độ xem trước*
              </div>
            </div>

            {mockPost.thumbnail && (
              <figure className='mb-10'>
                <img
                  src={mockPost.thumbnail}
                  alt='Thumbnail'
                  className='w-full rounded-2xl object-cover shadow-sm aspect-video sm:aspect-[21/9]'
                />
                <figcaption className='text-center text-[12px] text-slate-400 mt-3 italic'>
                  Ảnh minh họa bài viết
                </figcaption>
              </figure>
            )}

            {/* Rich Text Content */}
            <article
              className='prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-a:text-brand-green prose-img:rounded-xl prose-img:mx-auto break-words'
              dangerouslySetInnerHTML={{ __html: mockPost.content }}
            />

            {/* Fake Footer / Tags */}
            <div className='mt-12 pt-6 border-t border-slate-100 pb-20'>
              <h4 className='text-sm font-bold text-slate-900 mb-3'>Chủ đề liên quan:</h4>
              <div className='flex flex-wrap gap-2'>
                {['Tag 1', 'Tag 2'].map((tag) => (
                  <span
                    key={tag}
                    className='px-3 py-1.5 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-lg'
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN FORM COMPONENT
───────────────────────────────────────────────────────────────────────────── */
interface CreateNewsFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function CreateNewsForm({ onSuccess }: CreateNewsFormProps) {
  const { t } = useTranslation('news')
  const queryClient = useQueryClient()

  const [previewThumb, setPreviewThumb] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false) // 👉 State bật/tắt Preview Modal

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategoriesApi
  })
  const { data: tags = [] } = useQuery({ queryKey: ['tags'], queryFn: getAllTagsApi })
  const { data: books = [] } = useQuery({ queryKey: ['books'], queryFn: getAllBooksApi })

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(getNewsSchema(t as any)) as any,
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

  const { errors, isSubmitting, isDirty } = form.formState

  // Theo dõi realtime dữ liệu form để truyền vào Preview
  const formData = form.watch()

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
    onError: (error: any) => {
      const msg = error.response?.data?.message || t('message.error.create')
      toast.error(msg)
    }
  })

  return (
    <>
      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%) skewX(-15deg); } 100% { transform: translateX(220%) skewX(-15deg); } }
        .btn-shimmer::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent); animation: shimmer 2.8s ease-in-out infinite; }
        .btn-shimmer:disabled::after { display: none; }
        .tox-tinymce { border-radius: 12px !important; border: 1px solid #e2e8f0 !important; }
        .tox .tox-toolbar__primary { background: #f8fafc !important; }
      `}</style>

      {/* 👉 Gắn Component Xem Trước vào đây */}
      <NewsPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        formData={formData}
        categories={categories}
        previewThumb={previewThumb}
      />

      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className='flex flex-col w-full bg-white relative'
      >
        {/* ── TOP BAR ──────────────── */}
        <div className='sticky top-0 z-[50] flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm'>
          <div className='flex items-center'>
            <div className='flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1'>
              <span className='h-1.5 w-1.5 rounded-full bg-amber-500 inline-block' />
              <span className='text-[11px] font-bold text-amber-700 uppercase tracking-wide'>
                Đang soạn thảo
              </span>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {/* 👉 Nút Xem Trước */}
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 gap-1.5 rounded-lg border-slate-200 text-slate-600 text-xs hover:bg-slate-100 hover:text-slate-900'
              onClick={() => setShowPreview(true)}
            >
              <Eye className='h-3.5 w-3.5' />
              Xem trước
            </Button>

            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={!isDirty || mutation.isPending}
              className='h-8 rounded-lg border-slate-200 text-slate-700 text-xs font-medium'
              onClick={() => {
                form.setValue('status', NewsStatus.DRAFT)
                form.handleSubmit((v) => mutation.mutate(v))()
              }}
            >
              {mutation.isPending && <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />}
              Lưu nháp
            </Button>

            <Button
              type='submit'
              size='sm'
              disabled={mutation.isPending || isSubmitting}
              className='h-8 gap-1.5 rounded-lg px-4 text-xs font-semibold text-white border-0 btn-shimmer relative overflow-hidden shadow-md shadow-indigo-200 transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60'
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
              onClick={() => form.setValue('status', NewsStatus.PUBLISHED)}
            >
              <span className='relative z-10 flex items-center gap-1.5'>
                {mutation.isPending ? (
                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                ) : (
                  <Sparkles className='h-3.5 w-3.5' />
                )}
                Xuất bản
              </span>
            </Button>
          </div>
        </div>

        {/* ── BODY ────────────────────────────────────────── */}
        <div className='flex flex-col md:flex-row items-stretch'>
          <div className='flex flex-1 flex-col bg-slate-50/40 px-8 py-6 min-h-[800px]'>
            <div className='mb-1'>
              <FieldLabel required>Tiêu đề bài viết</FieldLabel>
              <input
                {...form.register('title')}
                placeholder='Nhập tiêu đề hấp dẫn cho bài viết...'
                className={cn(
                  'w-full bg-transparent text-2xl font-bold text-slate-900 placeholder:text-slate-300 border-0 outline-none ring-0 focus:ring-0 pb-3 border-b',
                  errors.title ? 'border-red-300' : 'border-slate-200 focus:border-indigo-300',
                  'transition-colors duration-200'
                )}
              />
              {errors.title && (
                <p className='mt-1 text-[11px] text-red-500 font-medium flex items-center gap-1'>
                  <span className='w-1 h-1 rounded-full bg-red-500 inline-block' />
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className='mt-5 mb-5'>
              <FieldLabel>Tóm tắt</FieldLabel>
              <Textarea
                rows={2}
                {...form.register('summary')}
                placeholder={t(
                  'fields.summary.placeholder',
                  'Mô tả ngắn gọn nội dung bài viết, hiển thị ở trang danh sách...'
                )}
                className='resize-none rounded-xl border-slate-200 bg-white text-sm placeholder:text-slate-400 focus-visible:ring-indigo-500/25 focus-visible:border-indigo-400 transition-all'
              />
            </div>

            <div className='flex-1 pb-10'>
              <div className='flex items-center justify-between mb-2'>
                <FieldLabel required>Nội dung bài viết</FieldLabel>
              </div>
              <div className={errors.content ? 'rounded-xl ring-1 ring-red-400' : ''}>
                <Controller
                  control={form.control}
                  name='content'
                  render={({ field }) => (
                    <Editor
                      tinymceScriptSrc='https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2/tinymce.min.js'
                      onEditorChange={(content) => field.onChange(content)}
                      value={field.value}
                      init={{
                        height: 700,
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
                          'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | forecolor backcolor removeformat | table image media link | charmap emoticons | fullscreen preview | help',
                        toolbar_sticky: true,
                        toolbar_mode: 'sliding',
                        promotion: false,
                        branding: false,
                        quickbars_selection_toolbar:
                          'bold italic | quicklink h2 h3 blockquote quickimage',
                        font_size_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
                        content_style: `body { font-family: "Segoe UI", Tahoma, sans-serif; font-size: 14px; line-height: 1.7; background-color: #f8fafc; padding: 16px !important; display: flex; justify-content: center; } .mce-content-body { background: white !important; max-width: 820px; min-height: 600px; padding: 48px 56px !important; margin: 0 auto; border-radius: 12px; box-shadow: 0 1px 6px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; } img { max-width: 100%; height: auto; border-radius: 8px; } table { border-collapse: collapse; width: 100%; } table, th, td { border: 1px solid #cbd5e1; padding: 8px; } h1,h2,h3 { color: #1e293b; }`,
                        images_upload_handler: async (blobInfo: any) => {
                          const formData = new FormData()
                          formData.append('file', blobInfo.blob(), blobInfo.filename())
                          try {
                            const res = await api.post('/files/upload', formData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            })
                            const text = res.data as string
                            return text.includes('Upload thành công: ')
                              ? text.replace('Upload thành công: ', '').trim()
                              : text
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
                <p className='mt-1.5 text-[11px] text-red-500 font-medium'>
                  {errors.content.message}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: Metadata sidebar (Giữ nguyên) */}
          <aside className='w-72 shrink-0 border-l border-slate-200 bg-white/50 pb-10'>
            <SideSection
              icon={UploadCloud}
              title='Ảnh bìa'
              iconClass='bg-violet-100 text-violet-600'
            >
              <FieldLabel required>Ảnh đại diện</FieldLabel>
              <div
                className={cn(
                  'relative w-full aspect-video rounded-xl border-2 border-dashed cursor-pointer overflow-hidden group transition-all duration-200',
                  previewThumb
                    ? 'border-transparent'
                    : errors.thumbnailFile
                      ? 'border-red-300 bg-red-50'
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                )}
                onClick={() => document.getElementById('news-thumb')?.click()}
              >
                {previewThumb ? (
                  <>
                    <img
                      src={previewThumb}
                      alt='thumbnail'
                      className='w-full h-full object-cover'
                    />
                    <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors' />
                    <Button
                      type='button'
                      variant='destructive'
                      size='icon'
                      className='absolute top-1.5 right-1.5 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shadow-md'
                      onClick={(e) => {
                        e.stopPropagation()
                        clearThumbnail()
                      }}
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  </>
                ) : (
                  <div className='flex flex-col items-center justify-center h-full gap-1 p-3 text-center'>
                    <UploadCloud className='h-6 w-6 text-slate-300' />
                    <span className='text-[11px] text-slate-400 font-medium'>Nhấn để tải ảnh</span>
                    <span className='text-[10px] text-slate-300'>JPG, PNG, WebP · 2MB</span>
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
                <p className='text-[11px] text-red-500'>{errors.thumbnailFile.message}</p>
              )}
            </SideSection>

            <SideSection icon={FolderOpen} title='Phân loại' iconClass='bg-sky-100 text-sky-600'>
              <div className='space-y-2.5'>
                <div>
                  <FieldLabel>Danh mục</FieldLabel>
                  <Controller
                    control={form.control}
                    name='categoryId'
                    render={({ field }) => (
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger className='h-9 rounded-lg border-slate-200 text-xs focus:ring-indigo-500/25 bg-white'>
                          <SelectValue placeholder={t('fields.category.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c: CategoryResponse) => (
                            <SelectItem key={c.id} value={c.id} className='text-xs'>
                              {c.categoryName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <FieldLabel>Trạng thái</FieldLabel>
                  <Controller
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className='h-9 rounded-lg border-slate-200 text-xs focus:ring-indigo-500/25 bg-white'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(NewsStatus).map((s) => (
                            <SelectItem key={s} value={s} className='text-xs'>
                              {t(`fields.status.options.${s}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </SideSection>

            <SideSection icon={Tag} title='Tags' iconClass='bg-indigo-100 text-indigo-600'>
              <Controller
                control={form.control}
                name='tagIds'
                render={({ field }) => {
                  const vals = field.value || []
                  return (
                    <ScrollArea className='h-24 pr-1'>
                      <div className='flex flex-wrap gap-1.5'>
                        {tags.map((tag: TagResponse) => {
                          const active = vals.includes(tag.id)
                          return (
                            <Badge
                              key={tag.id}
                              variant={active ? 'default' : 'outline'}
                              className={cn(
                                'cursor-pointer text-[11px] transition-all duration-150',
                                active
                                  ? 'bg-indigo-600 hover:bg-indigo-700 border-indigo-600'
                                  : 'hover:border-indigo-400 hover:text-indigo-600 bg-white'
                              )}
                              onClick={() =>
                                field.onChange(
                                  active ? vals.filter((id) => id !== tag.id) : [...vals, tag.id]
                                )
                              }
                            >
                              {tag.name}
                            </Badge>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  )
                }}
              />
            </SideSection>

            <SideSection
              icon={BookOpen}
              title='Sách liên kết'
              iconClass='bg-emerald-100 text-emerald-600'
            >
              <Controller
                control={form.control}
                name='bookIds'
                render={({ field }) => {
                  const vals = field.value || []
                  return (
                    <ScrollArea className='h-24 pr-1'>
                      <div className='flex flex-wrap gap-1.5'>
                        {books.map((book: BookResponse) => {
                          const active = vals.includes(book.id)
                          return (
                            <Badge
                              key={book.id}
                              variant={active ? 'secondary' : 'outline'}
                              className={cn(
                                'cursor-pointer text-[11px] transition-all duration-150',
                                active
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                  : 'hover:border-emerald-400 hover:text-emerald-600 bg-white'
                              )}
                              onClick={() =>
                                field.onChange(
                                  active ? vals.filter((id) => id !== book.id) : [...vals, book.id]
                                )
                              }
                            >
                              {book.title}
                            </Badge>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  )
                }}
              />
            </SideSection>

            <SideSection icon={Search} title='SEO' iconClass='bg-amber-100 text-amber-600'>
              <div className='space-y-2.5'>
                <div>
                  <FieldLabel>Meta Title</FieldLabel>
                  <Input
                    {...form.register('metaTitle')}
                    placeholder={t('fields.metaTitle.placeholder', 'SEO title...')}
                    className='h-8 rounded-lg border-slate-200 text-xs placeholder:text-slate-400 focus-visible:ring-amber-500/25 focus-visible:border-amber-400 bg-white'
                  />
                </div>
                <div>
                  <FieldLabel>Meta Description</FieldLabel>
                  <Textarea
                    rows={2}
                    {...form.register('metaDescription')}
                    placeholder={t('fields.metaDescription.placeholder', 'SEO description...')}
                    className='resize-none rounded-lg border-slate-200 text-xs placeholder:text-slate-400 focus-visible:ring-amber-500/25 focus-visible:border-amber-400 bg-white'
                  />
                </div>
              </div>
            </SideSection>
          </aside>
        </div>
      </form>
    </>
  )
}
