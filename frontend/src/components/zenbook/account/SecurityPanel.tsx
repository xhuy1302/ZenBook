import PinSetupModal from './modals/PinSetupModal'
import TwoFactorSetupModal from './modals/TwoFactorSetupModal'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  Phone,
  Mail,
  Lock,
  ShieldCheck,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react'
import { FaFacebook } from 'react-icons/fa'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { updateCustomerPhoneApi, changeCustomerPasswordApi } from '@/services/customer/customer.api'
import type { UserProfile } from '@/services/customer/customer.type'
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_LOWERCASE_REGEX,
  PASSWORD_UPPERCASE_REGEX,
  PASSWORD_NUMBER_REGEX,
  PASSWORD_SPECIAL_REGEX
} from '@/defines/auth-constants'

// ── Schemas ───────────────────────────────────────────────────────────────────

const phoneSchema = z.object({
  phone: z.string().regex(/^(0|\+84)[0-9]{9}$/, 'validation.phoneInvalid')
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'validation.currentPasswordRequired'),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, 'validation.passwordMinLength')
      .refine((v) => PASSWORD_UPPERCASE_REGEX.test(v), 'validation.passwordUppercase')
      .refine((v) => PASSWORD_LOWERCASE_REGEX.test(v), 'validation.passwordLowercase')
      .refine((v) => PASSWORD_NUMBER_REGEX.test(v), 'validation.passwordNumber')
      .refine((v) => PASSWORD_SPECIAL_REGEX.test(v), 'validation.passwordSpecial'),
    confirmPassword: z.string().min(1, 'validation.confirmPasswordRequired')
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'validation.passwordsMismatch',
    path: ['confirmPassword']
  })

type PhoneFormValues = z.infer<typeof phoneSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

// ── Shared row component ──────────────────────────────────────────────────────

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value?: string
  placeholder?: string
  actionLabel?: string
  onAction?: () => void
  disabled?: boolean
  danger?: boolean
}

function InfoRow({
  icon,
  label,
  value,
  placeholder,
  actionLabel,
  onAction,
  disabled = false,
  danger = false
}: InfoRowProps) {
  return (
    <div className='flex items-center justify-between gap-4 py-4 border-b border-border last:border-0'>
      <div className='flex items-center gap-3 min-w-0'>
        <div className='w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0'>
          {icon}
        </div>
        <div className='min-w-0'>
          <p className='text-xs text-muted-foreground font-medium'>{label}</p>
          <p
            className={`text-sm font-medium mt-0.5 truncate ${
              value ? 'text-foreground' : 'text-muted-foreground/60 italic'
            } ${disabled ? 'cursor-not-allowed' : ''}`}
          >
            {value || placeholder}
          </p>
        </div>
      </div>

      {actionLabel && (
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={onAction}
          className={`shrink-0 h-8 px-4 text-xs font-medium rounded-lg transition-all ${
            danger
              ? 'border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground'
              : 'border-border hover:border-brand-green/50 hover:text-brand-green'
          }`}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

// ── Phone update modal ────────────────────────────────────────────────────────

function PhoneModal({
  open,
  onOpenChange,
  currentPhone
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  currentPhone?: string
}) {
  const queryClient = useQueryClient()
  const { t } = useTranslation('account')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: currentPhone ?? '' }
  })

  const mutation = useMutation({
    mutationFn: updateCustomerPhoneApi,
    onSuccess: () => {
      toast.success(t('security.phoneUpdateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      onOpenChange(false)
    },
    onError: () => toast.error(t('security.phoneUpdateError'))
  })

  const onSubmit = (data: PhoneFormValues) => mutation.mutate(data)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>{t('security.updatePhoneTitle')}</DialogTitle>
          <DialogDescription>{t('security.updatePhoneDesc')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-1'>
          <div className='space-y-1.5'>
            <Label>{t('security.phoneNumber')}</Label>
            <Input
              placeholder={t('security.phonePlaceholder')}
              className='focus-visible:ring-brand-green/40'
              {...register('phone')}
            />
            {errors.phone && (
              <p className='text-xs text-destructive'>{t(errors.phone.message as string)}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='bg-brand-green hover:bg-brand-green-dark text-primary-foreground'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-3.5 h-3.5 mr-1.5 animate-spin' />
                  {t('common.saving')}
                </>
              ) : (
                t('common.confirm')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Password change modal ─────────────────────────────────────────────────────

function PasswordStrengthBar({ value }: { value: string }) {
  const rules = [
    { test: (v: string) => v.length >= PASSWORD_MIN_LENGTH },
    { test: (v: string) => PASSWORD_UPPERCASE_REGEX.test(v) },
    { test: (v: string) => PASSWORD_LOWERCASE_REGEX.test(v) },
    { test: (v: string) => PASSWORD_NUMBER_REGEX.test(v) },
    { test: (v: string) => PASSWORD_SPECIAL_REGEX.test(v) }
  ]
  const score = rules.filter((r) => r.test(value)).length
  const colors = [
    '',
    'bg-red-400',
    'bg-orange-400',
    'bg-amber-400',
    'bg-blue-400',
    'bg-brand-green'
  ]
  return (
    <div className='flex gap-1 mt-1'>
      {rules.map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
            i < score ? colors[score] : 'bg-muted'
          }`}
        />
      ))}
    </div>
  )
}

function PasswordInput({
  id,
  placeholder,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string; placeholder?: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className='relative'>
      <Input
        {...props}
        id={id}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        className='pr-10 focus-visible:ring-brand-green/40'
      />
      <button
        type='button'
        onClick={() => setShow((s) => !s)}
        className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
        tabIndex={-1}
      >
        {show ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
      </button>
    </div>
  )
}

function ChangePasswordModal({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { t } = useTranslation('account')
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) })

  const newPassword = watch('newPassword', '')

  const mutation = useMutation({
    mutationFn: changeCustomerPasswordApi,
    onSuccess: () => {
      toast.success(t('security.passwordChangeSuccess'))
      reset()
      onOpenChange(false)
    },
    onError: () => toast.error(t('security.passwordChangeError'))
  })

  const onSubmit = (data: PasswordFormValues) =>
    mutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('security.changePasswordTitle')}</DialogTitle>
          <DialogDescription>{t('security.changePasswordDesc')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-1'>
          <div className='space-y-1.5'>
            <Label htmlFor='currentPassword'>{t('security.currentPassword')}</Label>
            <PasswordInput id='currentPassword' {...register('currentPassword')} />
            {errors.currentPassword && (
              <p className='text-xs text-destructive'>
                {t(errors.currentPassword.message as string)}
              </p>
            )}
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='newPassword'>{t('security.newPassword')}</Label>
            <PasswordInput id='newPassword' {...register('newPassword')} />
            {newPassword && <PasswordStrengthBar value={newPassword} />}
            {errors.newPassword && (
              <p className='text-xs text-destructive'>{t(errors.newPassword.message as string)}</p>
            )}
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='confirmPassword'>{t('security.confirmNewPassword')}</Label>
            <PasswordInput id='confirmPassword' {...register('confirmPassword')} />
            {errors.confirmPassword && (
              <p className='text-xs text-destructive'>
                {t(errors.confirmPassword.message as string)}
              </p>
            )}
          </div>
          <DialogFooter className='pt-1'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='bg-brand-green hover:bg-brand-green-dark text-primary-foreground'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-3.5 h-3.5 mr-1.5 animate-spin' />
                  {t('common.saving')}
                </>
              ) : (
                t('common.confirm')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface SecurityPanelProps {
  user?: UserProfile
  isLoading: boolean
}

export default function SecurityPanel({ user, isLoading }: SecurityPanelProps) {
  const { t } = useTranslation('account')
  const [phoneOpen, setPhoneOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [pinOpen, setPinOpen] = useState(false)
  const [twoFactorOpen, setTwoFactorOpen] = useState(false)
  if (isLoading) {
    return (
      <div className='space-y-6'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='space-y-3 pb-4 border-b border-border last:border-0'>
            <Skeleton className='h-4 w-32' />
            {[1, 2].map((j) => (
              <div key={j} className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='w-8 h-8 rounded-lg' />
                  <div className='space-y-1'>
                    <Skeleton className='h-3 w-20' />
                    <Skeleton className='h-4 w-36' />
                  </div>
                </div>
                <Skeleton className='h-8 w-20 rounded-lg' />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-1'>
      <div className='pb-2'>
        <h3 className='text-base font-semibold text-foreground mb-1'>
          {t('security.phoneEmailSection')}
        </h3>
        <InfoRow
          icon={<Phone className='w-4 h-4 text-muted-foreground' />}
          label={t('security.phone')}
          value={user?.phone}
          placeholder={t('security.phoneMissing')}
          actionLabel={t('common.update')}
          onAction={() => setPhoneOpen(true)}
        />
        <InfoRow
          icon={<Mail className='w-4 h-4 text-muted-foreground' />}
          label={t('security.email')}
          value={user?.email}
          placeholder={t('security.emailMissing')}
          disabled
        />
      </div>

      <div className='py-2'>
        <h3 className='text-base font-semibold text-foreground mb-1'>
          {t('security.securitySection')}
        </h3>
        <InfoRow
          icon={<Lock className='w-4 h-4 text-muted-foreground' />}
          label={t('security.changePassword')}
          value='••••••••'
          actionLabel={t('common.update')}
          onAction={() => setPasswordOpen(true)}
        />
        <InfoRow
          icon={<KeyRound className='w-4 h-4 text-muted-foreground' />}
          label={t('security.pinCode', 'Mã PIN')}
          placeholder={t('security.notSet', 'Chưa thiết lập')}
          actionLabel={t('common.setup', 'Thiết lập')}
          onAction={() => setPinOpen(true)} // Đổi từ toast thành set state
        />
        <InfoRow
          icon={<ShieldCheck className='w-4 h-4 text-muted-foreground' />}
          label={t('security.twoFactor', 'Xác thực 2 lớp (2FA)')}
          placeholder={t('security.disabled', 'Chưa bật')}
          actionLabel={t('common.enable', 'Bật')}
          onAction={() => setTwoFactorOpen(true)} // Đổi từ toast thành set state
        />
      </div>

      <div className='py-2'>
        <h3 className='text-base font-semibold text-foreground mb-1'>
          {t('security.socialLinks')}
        </h3>
        <InfoRow
          icon={<FaFacebook className='w-4 h-4 text-blue-600' />}
          label='Facebook'
          placeholder={t('security.notLinked')}
          actionLabel={t('common.link')}
          onAction={() => toast.info(t('common.featureInDevelopment'))}
        />
        <InfoRow
          icon={
            <svg className='w-4 h-4' viewBox='0 0 24 24'>
              <path
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                fill='#4285F4'
              />
              <path
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                fill='#34A853'
              />
              <path
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                fill='#FBBC05'
              />
              <path
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                fill='#EA4335'
              />
            </svg>
          }
          label='Google'
          placeholder={t('security.notLinked')}
          actionLabel={t('common.link')}
          onAction={() => toast.info(t('common.featureInDevelopment'))}
        />
      </div>

      <div className='pt-4 mt-2 border-t border-border'>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className='flex items-center gap-2 text-sm text-destructive/80 hover:text-destructive transition-colors group'>
              <Trash2 className='w-4 h-4' />
              <span>{t('security.deleteAccountRequest')}</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('security.deleteAccountTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('security.deleteAccountDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                className='bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                onClick={() => toast.info(t('security.deleteAccountRequestSent'))}
              >
                {t('security.confirmRequest')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <PhoneModal open={phoneOpen} onOpenChange={setPhoneOpen} currentPhone={user?.phone} />
      <ChangePasswordModal open={passwordOpen} onOpenChange={setPasswordOpen} />
      <PinSetupModal open={pinOpen} onOpenChange={setPinOpen} />
      <TwoFactorSetupModal
        open={twoFactorOpen}
        onOpenChange={setTwoFactorOpen}
        userEmail={user?.email}
      />
    </div>
  )
}
