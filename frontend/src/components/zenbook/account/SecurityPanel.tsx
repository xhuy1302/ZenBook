import PinSetupModal from './modals/PinSetupModal'
import TwoFactorSetupModal from './modals/TwoFactorSetupModal'
import PhoneModal from './modals/PhoneModal'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
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
import { changeCustomerPasswordApi } from '@/services/customer/customer.api'
import type { UserProfile } from '@/services/customer/customer.type'
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_LOWERCASE_REGEX,
  PASSWORD_UPPERCASE_REGEX,
  PASSWORD_NUMBER_REGEX,
  PASSWORD_SPECIAL_REGEX
} from '@/defines/auth-constants'

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

type PasswordFormValues = z.infer<typeof passwordSchema>

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
    <div className='flex items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-0'>
      <div className='flex items-center gap-3.5 min-w-0'>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${danger ? 'bg-rose-50/50 border-rose-100' : 'bg-slate-50 border-slate-100/50'}`}
        >
          {icon}
        </div>
        <div className='min-w-0'>
          <p className='text-[11.5px] text-slate-500 font-bold tracking-wide uppercase mb-0.5'>
            {label}
          </p>
          <p
            className={`text-[13px] font-bold truncate ${value ? 'text-slate-900' : 'text-slate-400 italic font-medium'} ${disabled ? 'cursor-not-allowed' : ''}`}
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
          disabled={disabled}
          className={`shrink-0 h-9 px-5 text-[13px] font-bold rounded-xl transition-all ${danger ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-slate-200 hover:border-brand-green/50 hover:text-brand-green hover:bg-brand-green/5'}`}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

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
    'bg-rose-400',
    'bg-orange-400',
    'bg-amber-400',
    'bg-blue-400',
    'bg-brand-green'
  ]
  return (
    <div className='flex gap-1 mt-1.5'>
      {rules.map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score] : 'bg-slate-100'}`}
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
        className='pr-10 h-11 rounded-xl text-[13px] border-slate-200 focus-visible:ring-brand-green/40 font-medium'
      />
      <button
        type='button'
        onClick={() => setShow((s) => !s)}
        className='absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors'
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
    mutation.mutate({ currentPassword: data.currentPassword, newPassword: data.newPassword })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md rounded-[24px] z-[9999] p-7 border-slate-100 shadow-2xl'>
        <DialogHeader className='mb-4'>
          <div className='w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center mb-3 mx-auto'>
            <KeyRound className='w-6 h-6 text-brand-green' />
          </div>
          <DialogTitle className='text-[16px] font-bold text-center text-slate-900'>
            {t('security.changePasswordTitle')}
          </DialogTitle>
          <DialogDescription className='text-[13px] text-center font-medium'>
            {t('security.changePasswordDesc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='currentPassword' className='text-[13px] font-bold text-slate-800'>
              {t('security.currentPassword')}
            </Label>
            <PasswordInput id='currentPassword' {...register('currentPassword')} />
            {errors.currentPassword && (
              <p className='text-[12px] font-bold text-rose-500 pl-1 mt-1'>
                {t(errors.currentPassword.message as string)}
              </p>
            )}
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='newPassword' className='text-[13px] font-bold text-slate-800'>
              {t('security.newPassword')}
            </Label>
            <PasswordInput id='newPassword' {...register('newPassword')} />
            {newPassword && <PasswordStrengthBar value={newPassword} />}
            {errors.newPassword && (
              <p className='text-[12px] font-bold text-rose-500 pl-1 mt-1'>
                {t(errors.newPassword.message as string)}
              </p>
            )}
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='confirmPassword' className='text-[13px] font-bold text-slate-800'>
              {t('security.confirmNewPassword')}
            </Label>
            <PasswordInput id='confirmPassword' {...register('confirmPassword')} />
            {errors.confirmPassword && (
              <p className='text-[12px] font-bold text-rose-500 pl-1 mt-1'>
                {t(errors.confirmPassword.message as string)}
              </p>
            )}
          </div>
          <DialogFooter className='pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className='rounded-xl h-11 px-6 text-[13px] font-bold w-full sm:w-auto border-slate-200'
            >
              {t('common.cancel')}
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='bg-brand-green hover:bg-brand-green-dark text-white rounded-xl h-11 px-8 text-[13px] font-bold shadow-md shadow-brand-green/20 w-full sm:w-auto'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' /> {t('common.saving')}
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

export default function SecurityPanel({
  user,
  isLoading
}: {
  user?: UserProfile
  isLoading: boolean
}) {
  const { t } = useTranslation('account')
  const [phoneOpen, setPhoneOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [pinOpen, setPinOpen] = useState(false)
  const [twoFactorOpen, setTwoFactorOpen] = useState(false)

  if (isLoading) {
    return (
      <div className='space-y-8'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='space-y-4 pb-6 border-b border-slate-100'>
            <Skeleton className='h-5 w-40 rounded-md' />
            {[1, 2].map((j) => (
              <div key={j} className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <Skeleton className='w-10 h-10 rounded-xl' />
                  <div className='space-y-2'>
                    <Skeleton className='h-3 w-20 rounded-sm' />
                    <Skeleton className='h-4 w-36 rounded-md' />
                  </div>
                </div>
                <Skeleton className='h-9 w-24 rounded-xl' />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-4 animate-in fade-in duration-300'>
      {/* Box SĐT Email */}
      <div className='bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm'>
        <h3 className='text-[16px] font-bold text-slate-900 mb-3 flex items-center gap-2'>
          {t('security.phoneEmailSection')}
        </h3>
        <InfoRow
          icon={<Phone className='w-5 h-5 text-slate-500' />}
          label={t('security.phone')}
          value={user?.phone}
          placeholder={t('security.phoneMissing')}
          actionLabel={t('common.update')}
          onAction={() => setPhoneOpen(true)}
        />
        <InfoRow
          icon={<Mail className='w-5 h-5 text-slate-500' />}
          label={t('security.email')}
          value={user?.email}
          placeholder={t('security.emailMissing')}
          disabled
        />
      </div>

      {/* Box Bảo mật */}
      <div className='bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm'>
        <h3 className='text-[16px] font-bold text-slate-900 mb-3'>
          {t('security.securitySection')}
        </h3>
        <InfoRow
          icon={<Lock className='w-5 h-5 text-slate-500' />}
          label={t('security.changePassword')}
          value='••••••••'
          actionLabel={t('common.update')}
          onAction={() => setPasswordOpen(true)}
        />
        <InfoRow
          icon={<KeyRound className='w-5 h-5 text-slate-500' />}
          label={t('security.pinCode', 'Mã PIN')}
          placeholder={t('security.notSet', 'Chưa thiết lập')}
          actionLabel={t('common.setup', 'Thiết lập')}
          onAction={() => setPinOpen(true)}
        />
        <InfoRow
          icon={<ShieldCheck className='w-5 h-5 text-slate-500' />}
          label={t('security.twoFactor', 'Xác thực 2 lớp (2FA)')}
          placeholder={t('security.disabled', 'Chưa bật')}
          actionLabel={t('common.enable', 'Bật')}
          onAction={() => setTwoFactorOpen(true)}
        />
      </div>

      {/* Box Liên kết MXH */}
      <div className='bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm'>
        <h3 className='text-[16px] font-bold text-slate-900 mb-3'>{t('security.socialLinks')}</h3>
        <InfoRow
          icon={<FaFacebook className='w-5 h-5 text-blue-600' />}
          label='Facebook'
          placeholder={t('security.notLinked')}
          actionLabel={t('common.link')}
          onAction={() => toast.info(t('common.featureInDevelopment'))}
        />
        <InfoRow
          icon={
            <svg className='w-5 h-5' viewBox='0 0 24 24'>
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

      {/* Delete Account */}
      <div className='flex justify-end pt-4'>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className='flex items-center gap-2 text-[13px] font-bold text-rose-500/80 hover:text-rose-600 transition-colors group bg-white hover:bg-rose-50 px-5 py-2.5 rounded-xl border border-slate-200 hover:border-rose-200 shadow-sm'>
              <Trash2 className='w-4 h-4' /> <span>{t('security.deleteAccountRequest')}</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className='rounded-[24px] z-[100]'>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-rose-600 text-[16px] font-bold'>
                {t('security.deleteAccountTitle')}
              </AlertDialogTitle>
              <AlertDialogDescription className='text-[13px] font-medium leading-relaxed'>
                {t('security.deleteAccountDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className='mt-4'>
              <AlertDialogCancel className='rounded-xl h-11 px-6 text-[13px] font-bold border-slate-200'>
                {t('common.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                className='bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 px-6 text-[13px] font-bold shadow-md'
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
