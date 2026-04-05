import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { BookResponse } from '@/services/book/book.type'
import { BookStatusBadge } from '../BookStatusBadge'
import { useTranslation } from 'react-i18next'

export function ViewBookDialog({
  open,
  onOpenChange,
  book
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  book: BookResponse
}) {
  const { t } = useTranslation('product')

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('common.na')
    return new Date(dateString).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[800px] max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>{t('book.dialog.viewTitle')}</DialogTitle>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto pr-2 space-y-6 pb-4 custom-scrollbar'>
          {/* KHU VỰC 1: HÌNH ẢNH & THÔNG TIN CHÍNH */}
          <div className='flex flex-col md:flex-row gap-6 items-start'>
            <div className='flex flex-col items-center gap-3 shrink-0'>
              <img
                src={
                  book.thumbnail ||
                  'https://zenbook-s3.s3.ap-southeast-2.amazonaws.com/books/Book-default.png'
                }
                alt={book.title}
                className='w-40 h-56 object-cover rounded-lg shadow-md border'
              />
              <BookStatusBadge status={book.status} />
            </div>
            <div className='flex-1 space-y-4 w-full'>
              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>{t('book.form.title')}</Label>
                <Input
                  value={book.title}
                  readOnly
                  className='bg-muted/50 font-semibold text-lg h-auto py-2'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>Slug</Label>
                <Input value={book.slug} readOnly className='bg-muted/50 text-blue-600' />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <Label className='text-xs text-muted-foreground'>{t('book.form.isbn')}</Label>
                  <Input value={book.isbn || t('common.na')} readOnly className='bg-muted/50' />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs text-muted-foreground'>
                    {t('book.form.stockQuantity')}
                  </Label>
                  <Input value={book.stockQuantity} readOnly className='bg-muted/50 font-bold' />
                </div>
              </div>
            </div>
          </div>

          {/* KHU VỰC THÊM: BỘ SƯU TẬP ẢNH (GALLERY) */}
          {book.images && book.images.length > 0 && (
            <div className='border rounded-lg p-4 space-y-3 bg-card'>
              <h3 className='font-semibold text-sm border-b pb-2 text-muted-foreground'>
                {t('book.form.gallery')}
              </h3>
              <div className='grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3'>
                {book.images.map((img, index) => (
                  <div
                    key={index}
                    className='aspect-[3/4] rounded-md border overflow-hidden shadow-sm'
                  >
                    <img
                      src={img}
                      alt={`gallery-${index}`}
                      className='w-full h-full object-cover hover:scale-105 transition-transform'
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KHU VỰC 2: GIÁ CẢ & PHÂN LOẠI */}
          <div className='border rounded-lg p-4 space-y-4 bg-card'>
            <h3 className='font-semibold text-sm border-b pb-2 text-muted-foreground'>
              {t('book.form.section2')}
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>{t('book.form.salePrice')}</Label>
                <Input
                  value={new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(book.salePrice)}
                  readOnly
                  className='bg-muted/50 font-bold text-orange-600'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>
                  {t('book.form.originalPrice')}
                </Label>
                <Input
                  value={new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(book.originalPrice)}
                  readOnly
                  className='bg-muted/50 line-through text-muted-foreground'
                />
              </div>
              <div className='space-y-1.5 col-span-2'>
                <Label className='text-xs text-muted-foreground'>{t('book.form.author')}</Label>
                <div className='flex flex-wrap gap-2 p-2 border rounded-md bg-muted/50 min-h-10 items-center'>
                  {book.authors && book.authors.length > 0 ? (
                    book.authors.map((a) => (
                      <Badge key={a.id} variant='secondary'>
                        {a.name}
                      </Badge>
                    ))
                  ) : (
                    <span className='text-xs italic text-muted-foreground'>{t('common.na')}</span>
                  )}
                </div>
              </div>
              <div className='space-y-1.5 col-span-2'>
                <Label className='text-xs text-muted-foreground'>{t('book.form.category')}</Label>
                <div className='flex flex-wrap gap-2 p-2 border rounded-md bg-muted/50 min-h-10 items-center'>
                  {book.categories && book.categories.length > 0 ? (
                    book.categories.map((c) => (
                      <Badge key={c.id} variant='outline'>
                        {c.categoryName}
                      </Badge>
                    ))
                  ) : (
                    <span className='text-xs italic text-muted-foreground'>{t('common.na')}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* KHU VỰC 3: THÔNG SỐ KỸ THUẬT & MÔ TẢ */}
          <div className='border rounded-lg p-4 space-y-4 bg-card'>
            <h3 className='font-semibold text-sm border-b pb-2 text-muted-foreground'>
              {t('book.form.section4')}
            </h3>
            <div className='grid grid-cols-3 gap-4'>
              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>{t('book.form.format')}</Label>
                <Input value={book.format || t('common.na')} readOnly className='bg-muted/50' />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>{t('book.form.language')}</Label>
                <Input value={book.language || t('common.na')} readOnly className='bg-muted/50' />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>{t('book.form.pageCount')}</Label>
                <Input value={book.pageCount || t('common.na')} readOnly className='bg-muted/50' />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>
                  {t('book.form.publicationYear')}
                </Label>
                <Input
                  value={book.publicationYear || t('common.na')}
                  readOnly
                  className='bg-muted/50'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>{t('book.form.dimensions')}</Label>
                <Input value={book.dimensions || t('common.na')} readOnly className='bg-muted/50' />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>{t('book.form.weight')}</Label>
                <Input value={book.weight || t('common.na')} readOnly className='bg-muted/50' />
              </div>
              <div className='space-y-1.5 col-span-3'>
                <Label className='text-xs text-muted-foreground'>
                  {t('book.form.description')}
                </Label>
                <Textarea
                  value={book.description || t('book.form.noDescription')}
                  readOnly
                  rows={4}
                  className='bg-muted/50 resize-none'
                />
              </div>
            </div>
          </div>

          {/* KHU VỰC 4: LOG HỆ THỐNG */}
          <div className='border rounded-lg p-4 space-y-4 bg-card bg-muted/20'>
            <h3 className='font-semibold text-sm border-b pb-2 text-muted-foreground'>
              {t('book.form.systemLog')}
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>{t('book.form.createdAt')}</Label>
                <Input
                  value={formatDate(book.createdAt)}
                  readOnly
                  className='bg-muted/50 text-xs font-mono'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>{t('book.form.updatedAt')}</Label>
                <Input
                  value={formatDate(book.updatedAt)}
                  readOnly
                  className='bg-muted/50 text-xs font-mono'
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
