import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { User } from '@/pages/admin/manage-user/columns'
import { useTranslation } from 'react-i18next'
import { UserRoleBadges } from '@/components/admin/data/manage-user/UserRoleBadges'
import { UserStatusBadge } from '@/components/admin/data/manage-user/UserStatusBadges'
import type { UserRole } from '@/defines/user.enum'
import { Calendar, Clock, Mail, Phone, UserCircle } from 'lucide-react'
import { useState } from 'react'

interface ViewUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

export function ViewUserDialog({ open, onOpenChange, user }: ViewUserDialogProps) {
  const { t } = useTranslation('user')
  const [imageError, setImageError] = useState(false)

  const defaultAvatar = 'https://ui.shadcn.com/avatars/02.png'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Nới rộng Dialog lên 850px để đủ chỗ chia 2 cột */}
      <DialogContent className='sm:max-w-[850px] p-0 overflow-hidden bg-background'>
        <DialogHeader className='px-6 pt-6 pb-4 border-b border-border/50'>
          <DialogTitle className='text-xl font-semibold'>{t('dialogTitle.view')}</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col md:flex-row max-h-[80vh] overflow-y-auto'>
          {/* CỘT TRÁI: Avatar, Tên, Email, Trạng thái (Chiếm 1/3 chiều rộng) */}
          <div className='w-full md:w-1/3 bg-muted/30 p-8 flex flex-col items-center border-r border-border/50'>
            <div className='relative mb-4'>
              <img
                src={imageError ? defaultAvatar : (user.avatar ?? defaultAvatar)}
                alt='Avatar'
                className='h-32 w-32 rounded-full object-cover border-4 border-background shadow-lg'
                onError={() => setImageError(true)}
              />
            </div>

            <div className='text-center space-y-2 w-full'>
              <h2 className='text-xl font-bold tracking-tight text-foreground truncate px-2'>
                {user.fullName || user.username}
              </h2>
              <p className='text-sm text-muted-foreground flex items-center justify-center gap-1.5 truncate'>
                <Mail className='w-3.5 h-3.5' />
                {user.email}
              </p>
            </div>

            <Separator className='my-6' />

            {/* Badges Section */}
            <div className='flex flex-col items-center gap-4 w-full'>
              <div className='space-y-1.5 text-center w-full'>
                <Label className='text-xs text-muted-foreground uppercase tracking-wider'>
                  {t('fields.status.label')}
                </Label>
                <div className='flex justify-center'>
                  <UserStatusBadge status={user.status} />
                </div>
              </div>

              <div className='space-y-1.5 text-center w-full'>
                <Label className='text-xs text-muted-foreground uppercase tracking-wider'>
                  {t('fields.role.label')}
                </Label>
                <div className='flex justify-center flex-wrap gap-1'>
                  <UserRoleBadges roles={user.roles as UserRole[]} />
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Thông tin chi tiết (Chiếm 2/3 chiều rộng) */}
          <div className='w-full md:w-2/3 p-8 space-y-8 bg-background'>
            {/* Box: Thông tin cá nhân */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2 border-b pb-2'>
                <UserCircle className='w-5 h-5 text-primary' />
                <h3 className='text-sm font-bold text-foreground uppercase tracking-wider'>
                  {t('create.sections.personal')}
                </h3>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2'>
                <InfoCardField label={t('fields.username.label')} value={user.username} />
                <InfoCardField
                  label={t('fields.phone.label')}
                  value={user.phone}
                  icon={<Phone className='w-4 h-4 text-muted-foreground' />}
                />
              </div>
            </div>

            {/* Box: Thông tin hệ thống */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2 border-b pb-2'>
                <Clock className='w-5 h-5 text-primary' />
                <h3 className='text-sm font-bold text-foreground uppercase tracking-wider'>
                  THÔNG TIN HỆ THỐNG
                </h3>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2'>
                <InfoCardField
                  label={t('fields.createdAt')}
                  value={user.createdAt}
                  icon={<Calendar className='w-4 h-4 text-muted-foreground' />}
                />
                <InfoCardField
                  label={t('fields.updatedAt')}
                  value={user.updatedAt}
                  icon={<Clock className='w-4 h-4 text-muted-foreground' />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER: Nút đóng */}
        <div className='px-6 py-4 bg-muted/20 border-t border-border/50 flex justify-end gap-3'>
          <Button variant='default' onClick={() => onOpenChange(false)} className='w-28'>
            {t('actions.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Component hiển thị trường dữ liệu (Có hỗ trợ Icon)
function InfoCardField({
  label,
  value,
  icon
}: {
  label: string
  value?: string | null
  icon?: React.ReactNode
}) {
  return (
    <div className='space-y-1.5 p-3 rounded-lg bg-muted/10 border border-border/30 hover:bg-muted/30 transition-colors'>
      <div className='flex items-center gap-1.5'>
        {icon}
        <Label className='text-xs text-muted-foreground font-medium'>{label}</Label>
      </div>
      <p className='text-sm font-semibold text-foreground pl-0 md:pl-0'>{value || '—'}</p>
    </div>
  )
}
