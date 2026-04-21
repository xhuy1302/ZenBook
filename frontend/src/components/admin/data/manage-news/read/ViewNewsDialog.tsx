'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslation } from 'react-i18next'
import type { NewsResponse } from '@/services/news/news.type'
import { NewsStatusBadge } from '../NewsStatusBadge'
import { Calendar, Eye, Folder, User, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ViewNewsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  news: NewsResponse
}

export function ViewNewsDialog({ open, onOpenChange, news }: ViewNewsDialogProps) {
  const { t } = useTranslation('news')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-y-auto custom-scrollbar'>
        <DialogHeader className='border-b pb-4 mb-2'>
          <div className='flex items-start justify-between pr-4'>
            <DialogTitle className='text-2xl font-bold leading-tight'>{news.title}</DialogTitle>
            <NewsStatusBadge status={news.status} />
          </div>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Thanh thông tin phụ (Meta info) */}
          <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border'>
            <div className='flex items-center gap-1.5'>
              <User className='w-4 h-4' />
              <span>{news.authorName || 'Ẩn danh'}</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <Folder className='w-4 h-4' />
              <span>{news.categoryName || 'Chưa phân loại'}</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <Calendar className='w-4 h-4' />
              <span>{news.publishedAt || news.createdAt}</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <Eye className='w-4 h-4' />
              <span>{news.viewCount} lượt xem</span>
            </div>
          </div>

          {/* Ảnh bìa & Tóm tắt */}
          <div className='flex flex-col md:flex-row gap-6'>
            {news.thumbnail && (
              <div className='w-full md:w-1/3 shrink-0'>
                <img
                  src={news.thumbnail}
                  alt={news.title}
                  className='w-full h-auto object-cover rounded-lg border shadow-sm'
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/600x400?text=No+Image'
                  }}
                />
              </div>
            )}
            <div className='w-full md:w-2/3 space-y-4'>
              <div>
                <h4 className='text-sm font-semibold text-foreground mb-1'>Đường dẫn (Slug):</h4>
                <div className='text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded flex items-center gap-2 font-mono'>
                  <LinkIcon className='w-3.5 h-3.5' />/{news.slug}
                </div>
              </div>

              {news.summary && (
                <div>
                  <h4 className='text-sm font-semibold text-foreground mb-1'>
                    {t('fields.summary.label')}
                  </h4>
                  <p className='text-sm text-muted-foreground leading-relaxed italic border-l-4 pl-3 py-1 border-primary/50'>
                    "{news.summary}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Nội dung bài viết (Render HTML từ TinyMCE) */}
          <div className='border-t pt-6'>
            <h3 className='font-semibold text-lg mb-4'>{t('fields.content.label')}</h3>
            <div
              className='prose prose-sm dark:prose-invert max-w-none 
                         prose-img:rounded-lg prose-img:border prose-img:mx-auto
                         prose-a:text-blue-600 hover:prose-a:text-blue-500'
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          </div>

          {/* Thông tin SEO (Nếu có) */}
          {(news.metaTitle || news.metaDescription) && (
            <div className='border-t pt-6'>
              <h3 className='font-semibold text-base mb-3'>Thông tin SEO</h3>
              <div className='space-y-3 bg-muted/20 p-4 rounded-lg border'>
                {news.metaTitle && (
                  <div>
                    <span className='text-xs font-semibold uppercase text-muted-foreground'>
                      Meta Title:
                    </span>
                    <p className='text-sm text-foreground mt-0.5'>{news.metaTitle}</p>
                  </div>
                )}
                {news.metaDescription && (
                  <div>
                    <span className='text-xs font-semibold uppercase text-muted-foreground'>
                      Meta Description:
                    </span>
                    <p className='text-sm text-foreground mt-0.5'>{news.metaDescription}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className='flex justify-end pt-4 sticky bottom-0 bg-background/95 backdrop-blur z-10'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('actions.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
