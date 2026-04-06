import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { AuthorResponse } from '@/services/author/author.type'
import { useTranslation } from 'react-i18next'
import { AuthorStatusBadge } from '@/components/admin/data/manage-author/AuthorStatusBadges'
import { Calendar, Clock, BookOpen, Globe, User } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'

interface ViewAuthorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  author: AuthorResponse
}

export function ViewAuthorDialog({ open, onOpenChange, author }: ViewAuthorDialogProps) {
  const { t } = useTranslation('author')
  const [imageError, setImageError] = useState(false)

  const defaultAvatar = 'https://ui.shadcn.com/avatars/02.png'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[900px] p-0 overflow-hidden bg-background shadow-2xl border-none'>
        <DialogHeader className='px-6 pt-6 pb-4 border-b border-border/50 bg-muted/20'>
          <DialogTitle className='text-xl font-bold flex items-center gap-2'>
            <User className='w-5 h-5 text-primary' />
            {t('dialogTitle.view', 'Chi tiết tác giả')}
          </DialogTitle>
        </DialogHeader>

        <div className='flex flex-col md:flex-row max-h-[85vh] overflow-y-auto'>
          {/* CỘT TRÁI: Avatar & Thông tin cơ bản */}
          <div className='w-full md:w-[300px] bg-muted/30 p-8 flex flex-col items-center border-r border-border/50'>
            <div className='relative mb-6'>
              <img
                src={imageError ? defaultAvatar : (author.avatar ?? defaultAvatar)}
                alt={author.name}
                className='h-40 w-40 rounded-full object-cover border-4 border-background shadow-2xl transition-transform hover:scale-105 duration-300'
                onError={() => setImageError(true)}
              />
            </div>

            <div className='text-center space-y-3 w-full'>
              <h2 className='text-2xl font-bold tracking-tight text-foreground'>{author.name}</h2>
              <div className='flex justify-center'>
                <AuthorStatusBadge status={author.status} />
              </div>
            </div>

            <Separator className='my-8' />

            {/* Thống kê nhanh */}
            <div className='grid grid-cols-1 gap-4 w-full'>
              <div className='flex items-center justify-between p-3 rounded-xl bg-background shadow-sm border border-border/50'>
                <div className='flex items-center gap-2'>
                  <BookOpen className='w-4 h-4 text-primary' />
                  <span className='text-xs font-medium text-muted-foreground uppercase'>
                    {t('table.columns.bookCount', 'Số sách')}
                  </span>
                </div>
                <span className='text-lg font-bold text-primary'>{author.bookCount || 0}</span>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Chi tiết nội dung */}
          <div className='flex-1 p-8 space-y-8 bg-background'>
            {/* Box: Thông tin cá nhân */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2 border-b border-primary/20 pb-2'>
                <Calendar className='w-5 h-5 text-primary' />
                <h3 className='text-sm font-bold text-foreground uppercase tracking-widest'>
                  Thông tin cá nhân
                </h3>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <InfoCardField
                  label={t('table.columns.dateOfBirth', 'Ngày sinh')}
                  value={author.dateOfBirth ? author.dateOfBirth.split(' ')[0] : '—'}
                  icon={<Calendar className='w-4 h-4 text-blue-500' />}
                />
                <InfoCardField
                  label={t('table.columns.nationality', 'Quốc tịch')}
                  value={author.nationality}
                  icon={<Globe className='w-4 h-4 text-green-500' />}
                />
              </div>
            </div>

            {/* Box: Tiểu sử */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2 border-b border-primary/20 pb-2'>
                <BookOpen className='w-5 h-5 text-primary' />
                <h3 className='text-sm font-bold text-foreground uppercase tracking-widest'>
                  {t('table.columns.biography', 'Tiểu sử')}
                </h3>
              </div>
              <div className='p-5 rounded-2xl bg-muted/20 border border-border/40'>
                <p className='text-sm text-foreground/80 whitespace-pre-wrap leading-7 italic font-medium'>
                  {author.biography ||
                    t(
                      'table.columns.noBiography',
                      'Hiện tại chưa có thông tin tiểu sử cho tác giả này.'
                    )}
                </p>
              </div>
            </div>

            {/* Box: Nhật ký hệ thống */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2 border-b border-primary/20 pb-2'>
                <Clock className='w-5 h-5 text-primary' />
                <h3 className='text-sm font-bold text-foreground uppercase tracking-widest'>
                  Nhật ký hệ thống
                </h3>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <InfoCardField
                  label={t('table.columns.createdAt', 'Thời điểm tạo')}
                  value={
                    author.createdAt ? format(new Date(author.createdAt), 'dd/MM/yyyy HH:mm') : '—'
                  }
                  className='bg-orange-50/50 border-orange-100'
                />
                <InfoCardField
                  label={t('table.columns.updatedAt', 'Cập nhật cuối')}
                  value={
                    author.updatedAt ? format(new Date(author.updatedAt), 'dd/MM/yyyy HH:mm') : '—'
                  }
                  className='bg-blue-50/50 border-blue-100'
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className='px-6 py-4 bg-muted/20 border-t border-border/50 flex justify-end'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='w-32 border-primary/20 hover:bg-primary hover:text-white transition-all'
          >
            {t('actions.close', 'Đóng lại')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoCardField({
  label,
  value,
  icon,
  className
}: {
  label: string
  value?: string | null
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`space-y-1.5 p-4 rounded-xl border border-border/40 hover:shadow-md transition-all duration-200 bg-background ${className}`}
    >
      <div className='flex items-center gap-2'>
        {icon}
        <Label className='text-[10px] text-muted-foreground uppercase font-bold tracking-tighter'>
          {label}
        </Label>
      </div>
      <p className='text-sm font-bold text-foreground truncate pl-1'>{value || '—'}</p>
    </div>
  )
}
