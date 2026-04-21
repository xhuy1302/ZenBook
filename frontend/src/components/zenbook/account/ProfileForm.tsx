// ─────────────────────────────────────────────────────────────────────────────
// components/account/ProfileForm.tsx
// Left column: avatar + personal info form (Tiki-style)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import AvatarUpload from './AvatarUpload'
import { updateCustomerProfileApi } from '@/services/customer/customer.api'
import type { UserProfile } from '@/services/customer/customer.type'

// ── Date helpers ──────────────────────────────────────────────────────────────

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 100 }, (_, i) => currentYear - i)

const NATIONALITIES = [
  'Vietnam',
  'United States',
  'United Kingdom',
  'France',
  'Germany',
  'Japan',
  'South Korea',
  'China',
  'Australia',
  'Canada',
  'Singapore',
  'Other'
] as const

function parseDateParts(iso?: string) {
  if (!iso) return { day: '', month: '', year: '' }
  const [y, m, d] = iso.split('-')
  return { day: String(Number(d)), month: String(Number(m)), year: y }
}

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  fullName: z.string().min(2, 'validation.fullNameMin').optional().or(z.literal('')),
  nickname: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  day: z.string().optional(),
  month: z.string().optional(),
  year: z.string().optional(),
  nationality: z.string().optional()
})

type FormValues = z.infer<typeof schema>

// ── Props ─────────────────────────────────────────────────────────────────────

interface ProfileFormProps {
  user?: UserProfile
  isLoading: boolean
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProfileForm({ user, isLoading }: ProfileFormProps) {
  const { t } = useTranslation('account')
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!user) return
    const { day, month, year } = parseDateParts(user.dateOfBirth)
    reset({
      fullName: user.fullName ?? '',
      nickname: user.username ?? '',
      gender: user.gender,
      day,
      month,
      year,
      nationality: ''
    })
  }, [user, reset])

  const mutation = useMutation({
    mutationFn: updateCustomerProfileApi,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['profile'] })
      const previous = queryClient.getQueryData<UserProfile>(['profile'])
      queryClient.setQueryData<UserProfile>(['profile'], (old) =>
        old ? { ...old, ...newData } : old
      )
      return { previous }
    },
    onSuccess: () => {
      toast.success(t('profile.updateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['profile'], ctx.previous)
      toast.error(t('profile.updateError'))
    }
  })

  const onSubmit = (data: FormValues) => {
    let dateOfBirth: string | undefined
    if (data.day && data.month && data.year) {
      const d = data.day.padStart(2, '0')
      const m = data.month.padStart(2, '0')
      dateOfBirth = `${data.year}-${m}-${d}`
    }

    mutation.mutate({
      fullName: data.fullName,
      nickname: data.nickname,
      gender: data.gender,
      dateOfBirth,
      nationality: data.nationality
    })
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex flex-col items-center gap-4 pb-6 border-b border-border'>
          <Skeleton className='w-20 h-20 rounded-full' />
          <Skeleton className='h-4 w-32' />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-10 w-full' />
          </div>
        ))}
        <Skeleton className='h-10 w-40' />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='pb-4 border-b border-border'>
        <h3 className='text-base font-semibold text-foreground'>{t('profile.personalInfo')}</h3>
      </div>

      <div className='flex flex-col items-center gap-3 py-2'>
        <AvatarUpload
          avatarUrl={user?.avatarUrl}
          fullName={user?.fullName || user?.username}
          size={88}
        />
        <p className='text-xs text-muted-foreground'>{t('avatar.hint')}</p>
      </div>

      <div className='space-y-1.5'>
        <Label htmlFor='fullName'>{t('profile.fullName')}</Label>
        <Input
          id='fullName'
          placeholder={t('profile.fullNamePlaceholder')}
          className='focus-visible:ring-brand-green/40'
          {...register('fullName')}
        />
        {errors.fullName && (
          <p className='text-xs text-destructive'>{t(errors.fullName.message as string)}</p>
        )}
      </div>

      <div className='space-y-1.5'>
        <Label htmlFor='nickname'>{t('profile.nickname')}</Label>
        <Input
          id='nickname'
          placeholder={t('profile.nicknamePlaceholder')}
          className='focus-visible:ring-brand-green/40'
          {...register('nickname')}
        />
      </div>

      <div className='space-y-1.5'>
        <Label>{t('profile.dateOfBirth')}</Label>
        <div className='grid grid-cols-3 gap-2'>
          <Controller
            name='day'
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className='focus:ring-brand-green/40'>
                  <SelectValue placeholder={t('profile.day')} />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <Controller
            name='month'
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className='focus:ring-brand-green/40'>
                  <SelectValue placeholder={t('profile.month')} />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {t(`months.${m}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <Controller
            name='year'
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className='focus:ring-brand-green/40'>
                  <SelectValue placeholder={t('profile.year')} />
                </SelectTrigger>
                <SelectContent className='max-h-56'>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label>{t('profile.gender')}</Label>
        <Controller
          name='gender'
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className='flex items-center gap-6'
            >
              {[
                { value: 'male', label: t('gender.male') },
                { value: 'female', label: t('gender.female') },
                { value: 'other', label: t('gender.other') }
              ].map((opt) => (
                <div key={opt.value} className='flex items-center gap-2'>
                  <RadioGroupItem value={opt.value} id={`gender-${opt.value}`} />
                  <Label htmlFor={`gender-${opt.value}`} className='cursor-pointer font-normal'>
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        />
      </div>

      <div className='space-y-1.5'>
        <Label>{t('profile.nationality')}</Label>
        <Controller
          name='nationality'
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className='focus:ring-brand-green/40'>
                <SelectValue placeholder={t('profile.nationalityPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {NATIONALITIES.map((n) => (
                  <SelectItem key={n} value={n}>
                    {t(`nationality.${n.toLowerCase().replace(/\s+/g, '_')}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <Button
        type='submit'
        disabled={isSubmitting || !isDirty}
        className='bg-brand-green hover:bg-brand-green-dark text-primary-foreground px-8 h-10 rounded-lg'
      >
        {isSubmitting ? (
          <>
            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            {t('common.saving')}
          </>
        ) : (
          t('common.saveChanges')
        )}
      </Button>
    </form>
  )
}
