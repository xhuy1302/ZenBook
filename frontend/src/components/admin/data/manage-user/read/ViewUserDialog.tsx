import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { User } from '@/pages/admin/manage-user/columns'
import { useTranslation } from 'react-i18next'
import { UserRoleBadges } from '@/components/admin/data/manage-user/UserRoleBadges'
import { UserStatusBadge } from '@/components/admin/data/manage-user/UserStatusBadges'
import type { UserRole } from '@/defines/user.enum'
import { MemberTier } from '@/defines/enum.membership'
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  UserCircle,
  Award,
  Coins,
  Wallet,
  ShieldCheck
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ViewUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

export function ViewUserDialog({ open, onOpenChange, user }: ViewUserDialogProps) {
  const { t } = useTranslation('user')
  const [imageError, setImageError] = useState(false)
  const defaultAvatar = 'https://ui.shadcn.com/avatars/02.png'

  const tier = user.membership?.tier || MemberTier.MEMBER

  // Định nghĩa bảng màu theo Tier để dùng cho Avatar và Background
  const tierThemes: Record<MemberTier, { ring: string; bg: string; text: string; icon: string }> = {
    [MemberTier.MEMBER]: {
      ring: 'ring-slate-200',
      bg: 'from-slate-50 to-slate-100',
      text: 'text-slate-600',
      icon: 'text-slate-500'
    },
    [MemberTier.SILVER]: {
      ring: 'ring-zinc-300',
      bg: 'from-zinc-50 to-zinc-100',
      text: 'text-zinc-600',
      icon: 'text-zinc-500'
    },
    [MemberTier.GOLD]: {
      ring: 'ring-amber-400',
      bg: 'from-amber-50 to-orange-50',
      text: 'text-amber-700',
      icon: 'text-amber-500'
    },
    [MemberTier.PLATINUM]: {
      ring: 'ring-emerald-400',
      bg: 'from-emerald-50 to-teal-50',
      text: 'text-emerald-700',
      icon: 'text-emerald-500'
    },
    [MemberTier.DIAMOND]: {
      ring: 'ring-sky-400',
      bg: 'from-sky-50 to-indigo-50',
      text: 'text-sky-700',
      icon: 'text-sky-500'
    }
  }

  const currentTheme = tierThemes[tier]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[850px] p-0 overflow-hidden border-none shadow-2xl'>
        {/* Header với dải màu nhẹ */}
        <DialogHeader className={cn('px-6 pt-6 pb-4 border-b bg-gradient-to-r', currentTheme.bg)}>
          <DialogTitle className='flex items-center gap-2 text-xl font-bold'>
            <ShieldCheck className={cn('w-6 h-6', currentTheme.icon)} />
            {t('dialogTitle.view')}
          </DialogTitle>
        </DialogHeader>

        <div className='flex flex-col md:flex-row max-h-[80vh] overflow-y-auto'>
          {/* CỘT TRÁI: Profile tóm tắt */}
          <div className='w-full md:w-1/3 bg-muted/20 p-8 flex flex-col items-center border-r border-border/40 shrink-0'>
            <div className='relative mb-6'>
              {/* Vòng sáng quanh avatar thay đổi theo Tier */}
              <div
                className={cn(
                  'absolute -inset-2 rounded-full blur-sm opacity-40 animate-pulse',
                  currentTheme.ring.replace('ring-', 'bg-')
                )}
              />
              <img
                src={imageError ? defaultAvatar : (user.avatar ?? defaultAvatar)}
                alt='Avatar'
                className={cn(
                  'relative h-32 w-32 rounded-full object-cover border-4 border-background shadow-xl ring-4',
                  currentTheme.ring
                )}
                onError={() => setImageError(true)}
              />
            </div>

            <div className='text-center space-y-2 w-full'>
              <h2 className='text-2xl font-black tracking-tight text-foreground break-words px-2'>
                {user.fullName || user.username}
              </h2>
              <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border shadow-sm text-xs text-muted-foreground'>
                <Mail className='w-3 h-3 text-primary' />
                {user.email}
              </div>
            </div>

            <Separator className='my-8' />

            <div className='flex flex-col gap-6 w-full px-4'>
              <BadgeSection label={t('fields.status.label')}>
                <UserStatusBadge status={user.status} />
              </BadgeSection>

              <BadgeSection label={t('fields.role.label')}>
                <UserRoleBadges roles={user.roles as UserRole[]} />
              </BadgeSection>
            </div>
          </div>

          {/* CỘT PHẢI: Thông tin chi tiết */}
          <div className='w-full md:w-2/3 p-8 space-y-10 bg-background'>
            {/* Mục 1: Thông tin cá nhân */}
            <section className='space-y-4'>
              <SectionHeader
                icon={<UserCircle className='text-blue-500' />}
                title={t('create.sections.personal')}
              />
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <InfoCard label={t('fields.username.label')} value={user.username} />
                <InfoCard
                  label={t('fields.phone.label')}
                  value={user.phone}
                  icon={<Phone className='w-4 h-4 text-blue-400' />}
                />
              </div>
            </section>

            {/* Mục 2: Thông tin thành viên (ĐƯỢC TÔ MÀU) */}
            <section className='space-y-4 p-5 rounded-2xl border border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden'>
              <div className='absolute top-0 right-0 p-4 opacity-10'>
                <Award className='w-24 h-24 rotate-12' />
              </div>

              <SectionHeader
                icon={<Award className={cn('w-5 h-5', currentTheme.icon)} />}
                title='ĐẶC QUYỀN THÀNH VIÊN'
              />
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10'>
                <InfoCard
                  label='Cấp bậc'
                  value={tier}
                  highlight
                  className={currentTheme.text}
                  icon={<Award className={cn('w-4 h-4', currentTheme.icon)} />}
                />
                <InfoCard
                  label='Điểm Zen'
                  value={user.membership?.availablePoints?.toLocaleString()}
                  icon={<Coins className='w-4 h-4 text-orange-400' />}
                />
                <InfoCard
                  label='Đã chi tiêu'
                  value={new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(user.membership?.totalSpending || 0)}
                  icon={<Wallet className='w-4 h-4 text-emerald-400' />}
                />
              </div>
            </section>

            {/* Mục 3: Thông tin hệ thống */}
            <section className='space-y-4'>
              <SectionHeader icon={<Clock className='text-purple-500' />} title='DẤU THỜI GIAN' />
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <InfoCard
                  label={t('fields.createdAt')}
                  value={user.createdAt}
                  icon={<Calendar className='w-4 h-4 text-muted-foreground' />}
                />
                <InfoCard
                  label={t('fields.updatedAt')}
                  value={user.updatedAt}
                  icon={<Clock className='w-4 h-4 text-muted-foreground' />}
                />
              </div>
            </section>
          </div>
        </div>

        <div className='px-6 py-4 bg-muted/30 border-t flex justify-end'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='px-8 font-bold hover:bg-primary hover:text-primary-foreground transition-all'
          >
            {t('actions.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// --- SUB-COMPONENTS CHO GỌN CODE ---

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className='flex items-center gap-2 pb-1'>
      {icon}
      <h3 className='text-xs font-black text-muted-foreground uppercase tracking-[0.15em]'>
        {title}
      </h3>
    </div>
  )
}

function BadgeSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='space-y-2 text-center md:text-left'>
      <Label className='text-[10px] text-muted-foreground uppercase font-bold tracking-widest'>
        {label}
      </Label>
      <div className='flex justify-center md:justify-start flex-wrap gap-1.5'>{children}</div>
    </div>
  )
}

function InfoCard({
  label,
  value,
  icon,
  className,
  highlight
}: {
  label: string
  value?: string | number | null
  icon?: React.ReactNode
  className?: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'group p-4 rounded-xl border transition-all duration-300',
        highlight
          ? 'bg-background shadow-sm border-primary/20'
          : 'bg-muted/5 border-transparent hover:border-border hover:bg-muted/10'
      )}
    >
      <div className='flex items-center gap-2 mb-1'>
        {icon}
        <span className='text-[10px] font-bold text-muted-foreground/80 uppercase tracking-tight'>
          {label}
        </span>
      </div>
      <p className={cn('text-sm font-bold text-foreground truncate', className)}>{value || '—'}</p>
    </div>
  )
}
