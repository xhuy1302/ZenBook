'use client'

import { DiscountTypeBadge } from '@/components/admin/data/manage-promotion/DiscountTypeBadge'
import { PromotionStatusBadge } from '@/components/admin/data/manage-promotion/PromotionStatusBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

import type { PromotionResponse } from '@/services/promotion/promotion.type'
import { format } from 'date-fns'
import { Calendar, Clock, Tag, BookOpen, ImageIcon, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ViewPromotionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotion: PromotionResponse
}

export function ViewPromotionDialog({ open, onOpenChange, promotion }: ViewPromotionDialogProps) {
  const { t } = useTranslation('promotion')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] p-0 gap-0 bg-background overflow-hidden border-none shadow-2xl'>
        {/* Header Section */}
        <DialogHeader className='px-6 py-5 bg-primary/5 border-b'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <DialogTitle className='text-2xl font-bold tracking-tight flex items-center gap-2'>
                <Tag className='w-6 h-6 text-primary' />
                {t('dialogTitle.view', 'Chi tiết khuyến mãi')}
              </DialogTitle>
              <p className='text-xs text-muted-foreground font-mono'>ID: {promotion.id}</p>
            </div>
            <div className='flex flex-col items-end gap-2'>
              <PromotionStatusBadge status={promotion.status} />
              <DiscountTypeBadge type={promotion.discountType} />
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className='max-h-[80vh] px-6 py-6'>
          <div className='space-y-8'>
            {/* 1. Tên và Mô tả */}
            <section className='space-y-3'>
              <h3 className='text-xl font-bold text-foreground'>{promotion.name}</h3>
              {promotion.description ? (
                <div className='flex gap-2 p-3 rounded-lg bg-muted/30 border border-border/50'>
                  <Info className='w-4 h-4 text-muted-foreground shrink-0 mt-0.5' />
                  <p className='text-sm text-muted-foreground leading-relaxed'>
                    {promotion.description}
                  </p>
                </div>
              ) : (
                <p className='text-sm italic text-muted-foreground/60'>
                  {t('fields.noDescription', 'Không có mô tả chi tiết.')}
                </p>
              )}
            </section>

            {/* 2. Cấu hình thời gian và mức giảm */}
            <section className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <InfoCard
                icon={<Tag className='w-4 h-4 text-primary' />}
                label={t('fields.discountValue', 'Giá trị ưu đãi')}
                content={
                  <span className='text-lg font-bold text-primary'>
                    {promotion.discountType === 'PERCENTAGE'
                      ? `${promotion.discountValue}%`
                      : new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(promotion.discountValue)}
                  </span>
                }
              />
              <InfoCard
                icon={<Calendar className='w-4 h-4 text-blue-500' />}
                label={t('fields.duration', 'Thời gian áp dụng')}
                content={
                  <div className='space-y-0.5'>
                    <div className='flex items-center gap-2 text-sm font-semibold'>
                      <span className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
                      {format(new Date(promotion.startDate), 'dd/MM/yyyy HH:mm')}
                    </div>
                    <div className='flex items-center gap-2 text-sm font-semibold'>
                      <span className='w-1.5 h-1.5 rounded-full bg-destructive' />
                      {format(new Date(promotion.endDate), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </div>
                }
              />
            </section>

            {/* 3. Danh sách Sách */}
            <section className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-muted-foreground'>
                  <BookOpen className='w-4 h-4' />
                  {t('fields.books', 'Sách áp dụng')}
                </div>
                <Badge variant='secondary' className='rounded-full px-3'>
                  {promotion.books?.length || 0} {t('common.items', 'sản phẩm')}
                </Badge>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {promotion.books && promotion.books.length > 0 ? (
                  promotion.books.map((book) => (
                    <div
                      key={book.id}
                      className='group flex items-center gap-3 p-2 rounded-xl border bg-card hover:bg-muted/30 transition-all'
                    >
                      <div className='relative w-12 h-16 rounded-lg overflow-hidden border shadow-sm'>
                        {book.thumbnail ? (
                          <img
                            src={book.thumbnail}
                            alt={book.title}
                            className='w-full h-full object-cover transition-transform group-hover:scale-110'
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center bg-muted'>
                            <ImageIcon className='w-5 h-5 text-muted-foreground/30' />
                          </div>
                        )}
                      </div>
                      <div className='flex flex-col min-w-0'>
                        <span
                          className='text-sm font-bold truncate leading-none mb-1'
                          title={book.title}
                        >
                          {book.title}
                        </span>
                        <div className='flex items-baseline gap-2'>
                          <span className='text-xs font-bold text-primary'>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(book.salePrice)}
                          </span>
                          <span className='text-[10px] text-muted-foreground/60 line-through'>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(book.originalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='col-span-full py-10 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl bg-muted/10'>
                    <BookOpen className='w-10 h-10 text-muted-foreground/20 mb-2' />
                    <p className='text-sm text-muted-foreground italic'>
                      Chưa có sách nào trong chương trình này
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* 4. Metadata */}
            <footer className='pt-4 border-t grid grid-cols-2 gap-4'>
              <MetadataItem
                label={t('fields.createdAt', 'Ngày tạo')}
                value={format(new Date(promotion.createdAt), 'dd/MM/yyyy HH:mm')}
              />
              <MetadataItem
                label={t('fields.updatedAt', 'Cập nhật')}
                value={
                  promotion.updatedAt
                    ? format(new Date(promotion.updatedAt), 'dd/MM/yyyy HH:mm')
                    : '---'
                }
              />
            </footer>
          </div>
        </ScrollArea>

        {/* Action Footer */}
        <div className='px-6 py-4 bg-muted/30 border-t flex justify-end gap-3'>
          <Button onClick={() => onOpenChange(false)} className='min-w-[100px] font-semibold'>
            {t('actions.close', 'Đóng')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Các Component nội bộ để code gọn hơn
 */

function InfoCard({
  icon,
  label,
  content
}: {
  icon: React.ReactNode
  label: string
  content: React.ReactNode
}) {
  return (
    <div className='p-4 rounded-xl border bg-card shadow-sm space-y-2'>
      <div className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
        {icon}
        {label}
      </div>
      <div>{content}</div>
    </div>
  )
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex flex-col gap-1'>
      <span className='text-[10px] font-bold uppercase text-muted-foreground/70'>{label}</span>
      <div className='flex items-center gap-1.5 text-xs font-semibold text-foreground'>
        <Clock className='w-3 h-3 text-muted-foreground' />
        {value}
      </div>
    </div>
  )
}
