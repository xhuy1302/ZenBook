'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { BookResponse, TagResponse } from '@/services/book/book.type'
import { BookStatusBadge } from '../BookStatusBadge'
import { useTranslation } from 'react-i18next'
import {
  Star,
  Eye,
  MessageCircle,
  Trophy,
  BookOpen,
  Info,
  Layers,
  Image as ImageIcon,
  Clock,
  Package
} from 'lucide-react'

type BookImageDTO = { id?: string; imageUrl?: string } | string

interface ViewBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  book: BookResponse
}

export function ViewBookDialog({ open, onOpenChange, book }: ViewBookDialogProps) {
  const { t } = useTranslation('product')

  const fakeViews = 1542
  const fakeRating = 4.8
  const fakeReviews = 128
  const fakeAward = 'Sách Bán Chạy Nhất 2025'

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return t('common.na', 'N/A')
    if (dateString.includes('-') && !dateString.includes('T')) return dateString

    const date = new Date(dateString)
    if (isNaN(date.getTime())) return t('common.na', 'N/A')

    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[1000px] p-0 overflow-hidden flex flex-col h-[90vh]'>
        <DialogHeader className='px-6 pt-6 pb-4      border-b shrink-0'>
          <DialogTitle className='text-xl font-bold flex items-center gap-2 text-slate-800'>
            <BookOpen className='w-5 h-5 text-brand-green' />
            {t('book.dialog.viewTitle', 'Chi tiết Thông tin Sách')}
          </DialogTitle>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto p-6 custom-scrollbar     /50'>
          <div className='flex flex-col md:flex-row gap-8 items-start'>
            <div className='w-full md:w-[320px] shrink-0 space-y-6'>
              <div className='      rounded-xl border p-4 flex flex-col items-center gap-4 shadow-sm'>
                <div className='w-[200px] h-[280px] rounded-md overflow-hidden border shadow-inner      flex items-center justify-center'>
                  <img
                    src={
                      book.thumbnail ||
                      'https://zenbook-s3.s3.ap-southeast-2.amazonaws.com/books/Book-default.png'
                    }
                    alt={book.title}
                    className='w-full h-full object-cover'
                  />
                </div>
                <BookStatusBadge status={book.status} />
              </div>

              {/* GOM GIÁ BÁN & TỒN KHO VÀO CHUNG MỘT KHỐI */}
              <div className='      rounded-xl border p-5 shadow-sm space-y-4'>
                <div>
                  <p className='text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2'>
                    Giá bán
                  </p>
                  <div className='flex flex-col'>
                    <span className='text-3xl font-bold text-brand-green'>
                      {formatCurrency(book.salePrice)}
                    </span>
                    {book.originalPrice > book.salePrice && (
                      <div className='flex items-center gap-2 mt-1'>
                        <span className='text-sm line-through text-slate-400 font-medium'>
                          {formatCurrency(book.originalPrice)}
                        </span>
                        <Badge variant='destructive' className='px-1.5 py-0 text-[10px]'>
                          -{Math.round((1 - book.salePrice / book.originalPrice) * 100)}%
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className='pt-3 border-t'>
                  <p className='text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2'>
                    Tồn kho
                  </p>
                  <div className='flex items-center gap-2'>
                    <Package className='w-5 h-5 text-slate-400' />
                    <span className='text-lg font-bold text-slate-800'>
                      {book.stockQuantity}{' '}
                      <span className='text-sm font-normal text-slate-500'>sản phẩm</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className='      rounded-xl border p-5 shadow-sm space-y-4'>
                <p className='text-sm font-semibold text-slate-500 uppercase tracking-wider'>
                  Chỉ số hiển thị
                </p>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-slate-600'>
                      <Eye className='w-4 h-4 text-blue-500' />
                      <span className='text-sm'>Lượt xem</span>
                    </div>
                    <span className='font-semibold text-sm'>{fakeViews}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-slate-600'>
                      <Star className='w-4 h-4 text-yellow-500 fill-yellow-500' />
                      <span className='text-sm'>Đánh giá</span>
                    </div>
                    <span className='font-semibold text-sm'>{fakeRating} / 5</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-slate-600'>
                      <MessageCircle className='w-4 h-4 text-green-500' />
                      <span className='text-sm'>Bình luận</span>
                    </div>
                    <span className='font-semibold text-sm'>{fakeReviews}</span>
                  </div>
                  <div className='pt-2 border-t'>
                    <div className='flex items-start gap-2 text-slate-600'>
                      <Trophy className='w-4 h-4 text-orange-500 mt-0.5 shrink-0' />
                      <span className='text-sm font-medium text-orange-600'>{fakeAward}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex-1 space-y-6 w-full'>
              <div className='      rounded-xl border p-6 shadow-sm'>
                <h1 className='text-2xl font-bold text-slate-900 leading-snug mb-2'>
                  {book.title}
                </h1>
                <div className='flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600'>
                  <p>
                    <span className='text-slate-400'>Tác giả: </span>
                    <span className='font-semibold text-slate-800'>
                      {book.authors?.map((a) => a.name).join(', ') || t('common.na')}
                    </span>
                  </p>
                  <p>
                    <span className='text-slate-400'>Nhà xuất bản: </span>
                    <span className='font-semibold text-slate-800'>
                      {book.publisher?.name || t('common.na')}
                    </span>
                  </p>
                  <p>
                    <span className='text-slate-400'>ISBN: </span>
                    <span className='font-mono font-medium text-slate-800'>
                      {book.isbn || t('common.na')}
                    </span>
                  </p>
                </div>
              </div>

              <div className='      rounded-xl border p-6 shadow-sm space-y-5'>
                <div className='flex items-center gap-2 text-primary font-semibold border-b pb-3'>
                  <Layers className='w-5 h-5 text-brand-green' />
                  {/* Bỏ chữ "3. " */}
                  <span>Phân loại & Thuộc tính</span>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                  <div className='space-y-4'>
                    <div>
                      <p className='text-xs font-semibold text-slate-400 mb-1.5 uppercase'>
                        Slug Đường dẫn
                      </p>
                      <p className='text-sm font-mono text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md break-all'>
                        {book.slug}
                      </p>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <p className='text-xs font-semibold text-slate-400 mb-1.5 uppercase'>
                        Nhãn nổi bật (Tags)
                      </p>
                      <div className='flex flex-wrap gap-1.5'>
                        {book.tags && book.tags.length > 0 ? (
                          book.tags.map((tag: TagResponse) => (
                            <Badge
                              key={tag.id}
                              variant='outline'
                              style={{
                                borderColor: tag.color ?? '#ccc',
                                color: tag.color ?? '#333'
                              }}
                            >
                              {tag.name}
                            </Badge>
                          ))
                        ) : (
                          <span className='text-sm italic text-slate-400'>Chưa cập nhật</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Chuyển Danh mục xuống dưới để layout cân đối hơn */}
                  <div className='col-span-1 sm:col-span-2'>
                    <p className='text-xs font-semibold text-slate-400 mb-1.5 uppercase'>
                      Danh mục
                    </p>
                    <div className='flex flex-wrap gap-1.5'>
                      {book.categories && book.categories.length > 0 ? (
                        book.categories.map((c) => (
                          <Badge key={c.id} variant='secondary' className='font-normal'>
                            {c.categoryName}
                          </Badge>
                        ))
                      ) : (
                        <span className='text-sm italic text-slate-400'>Chưa cập nhật</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className='      rounded-xl border p-6 shadow-sm space-y-4'>
                <div className='flex items-center gap-2 text-primary font-semibold border-b pb-3'>
                  <Info className='w-5 h-5 text-brand-green' />
                  {/* Bỏ chữ "4. " */}
                  <span>Thông số kỹ thuật</span>
                </div>
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                  <div className='     p-3 rounded-lg border border-slate-100'>
                    <p className='text-xs text-slate-500 mb-1'>Định dạng</p>
                    <p className='text-sm font-semibold text-slate-800'>
                      {book.format
                        ? t(`fields.format.options.${book.format}`, book.format)
                        : t('common.na')}
                    </p>
                  </div>
                  <div className='     p-3 rounded-lg border border-slate-100'>
                    <p className='text-xs text-slate-500 mb-1'>Ngôn ngữ</p>
                    <p className='text-sm font-semibold text-slate-800'>
                      {book.language || t('common.na')}
                    </p>
                  </div>
                  <div className='     p-3 rounded-lg border border-slate-100'>
                    <p className='text-xs text-slate-500 mb-1'>Số trang</p>
                    <p className='text-sm font-semibold text-slate-800'>
                      {book.pageCount || t('common.na')}
                    </p>
                  </div>
                  <div className='     p-3 rounded-lg border border-slate-100'>
                    <p className='text-xs text-slate-500 mb-1'>Năm xuất bản</p>
                    <p className='text-sm font-semibold text-slate-800'>
                      {book.publicationYear || t('common.na')}
                    </p>
                  </div>
                  <div className='     p-3 rounded-lg border border-slate-100'>
                    <p className='text-xs text-slate-500 mb-1'>Kích thước</p>
                    <p className='text-sm font-semibold text-slate-800'>
                      {book.dimensions || t('common.na')}
                    </p>
                  </div>
                  <div className='     p-3 rounded-lg border border-slate-100'>
                    <p className='text-xs text-slate-500 mb-1'>Trọng lượng</p>
                    <p className='text-sm font-semibold text-slate-800'>
                      {book.weight ? `${book.weight} gram` : t('common.na')}
                    </p>
                  </div>
                </div>

                <div className='pt-2'>
                  <p className='text-xs font-semibold text-slate-400 mb-2 uppercase'>
                    Mô tả sản phẩm
                  </p>
                  <div className='text-sm text-slate-600 leading-relaxed      p-4 rounded-lg border border-slate-100 whitespace-pre-wrap'>
                    {book.description || <span className='italic'>Không có mô tả.</span>}
                  </div>
                </div>
              </div>

              {book.images && book.images.length > 0 && (
                <div className='      rounded-xl border p-6 shadow-sm space-y-4'>
                  <div className='flex items-center gap-2 text-primary font-semibold border-b pb-3'>
                    <ImageIcon className='w-5 h-5 text-brand-green' />
                    <span>Thư viện ảnh</span>
                  </div>
                  <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3'>
                    {book.images.map((img: BookImageDTO, index) => {
                      const imgUrl = typeof img === 'string' ? img : img?.imageUrl || ''
                      if (!imgUrl) return null
                      return (
                        <div
                          key={index}
                          className='aspect-square rounded-lg border overflow-hidden     '
                        >
                          <img
                            src={imgUrl}
                            alt={`gallery-${index}`}
                            className='w-full h-full object-cover'
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className='flex items-center justify-between px-2 py-4 text-xs text-slate-400'>
                <div className='flex items-center gap-1.5'>
                  <Clock className='w-3.5 h-3.5' />
                  <span>
                    Tạo lúc: <span className='font-mono'>{formatDate(book.createdAt)}</span>
                  </span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <Clock className='w-3.5 h-3.5' />
                  <span>
                    Cập nhật: <span className='font-mono'>{formatDate(book.updatedAt)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
