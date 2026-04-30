'use client'

import { useState } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'

import AvatarUpload from './AvatarUpload'
import { updateCustomerProfileApi } from '@/services/customer/customer.api'
import type { UserProfile, CustomerProfileUpdateRequest } from '@/services/customer/customer.type'

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
  if (!iso || typeof iso !== 'string') return { day: undefined, month: undefined, year: undefined }
  const dateOnly = iso.split('T')[0]
  const [y, m, d] = dateOnly.split('-')
  return { day: String(Number(d)), month: String(Number(m)), year: y }
}

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

interface ProfileFormProps {
  user?: UserProfile
  isLoading: boolean
}

export default function ProfileForm({ user, isLoading }: ProfileFormProps) {
  // ✅ 1. Bỏ <any>, dùng chuẩn i18n
  const { t } = useTranslation('account')
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const parsedDate = parseDateParts(user?.dateOfBirth)

  // ✅ 2. Tạo helper "tt" để bypass strict key check mà không dùng any cho hook
  const tt = (key: string) => t(key as never)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      fullName: user?.fullname || undefined,
      nickname: user?.username || undefined,
      gender: (user?.gender?.toLowerCase() as 'male' | 'female' | 'other') || undefined,
      day: parsedDate.day,
      month: parsedDate.month,
      year: parsedDate.year,
      nationality: user?.nationality || undefined
    }
  })

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
    onSuccess: (_data, variables) => {
      toast.success(t('profile.updateSuccess', 'Cập nhật thành công!'))
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setIsEditing(false)
      window.dispatchEvent(
        new CustomEvent('onProfileUpdated', {
          detail: { fullName: variables.fullname, username: variables.username }
        })
      )
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['profile'], ctx.previous)
      toast.error(t('profile.updateError', 'Có lỗi xảy ra!'))
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
      username: data.nickname,
      gender: data.gender,
      dateOfBirth,
      nationality: data.nationality
    } as CustomerProfileUpdateRequest)
  }

  const handleCancel = () => {
    setIsEditing(false)
    reset()
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex flex-col items-center gap-4 pb-6 border-b border-slate-100'>
          <Skeleton className='w-[88px] h-[88px] rounded-full' />
          <Skeleton className='h-4 w-32' />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-11 w-full rounded-xl' />
          </div>
        ))}
        <Skeleton className='h-11 w-40 rounded-xl' />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 animate-in fade-in duration-300'>
      <div className='pb-4 border-b border-slate-100 flex justify-between items-center'>
        <h3 className='text-[16px] font-bold text-slate-900'>{tt('profile.personalInfo')}</h3>
      </div>

      <div className='flex flex-col items-center gap-3 py-4'>
        <AvatarUpload
          avatarUrl={user?.avatar}
          fullName={user?.fullname || user?.username}
          size={96}
        />
        <p className='text-[12.5px] text-slate-500 font-medium'>{tt('avatar.hint')}</p>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='fullName' className='text-[13px] font-bold text-slate-800'>
          {tt('profile.fullName')}
        </Label>
        <Input
          id='fullName'
          disabled={!isEditing}
          placeholder={tt('profile.fullNamePlaceholder')}
          className='h-11 rounded-xl text-[13px] focus-visible:ring-brand-green/40 border-slate-200 disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100 font-medium'
          {...register('fullName')}
        />
        {errors.fullName && (
          <p className='text-[12px] font-bold text-rose-500 pl-1 mt-1'>
            {/* Sửa lại chỗ này để hiện đúng error message từ i18n */}
            {tt(errors.fullName.message || '')}
          </p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='nickname' className='text-[13px] font-bold text-slate-800'>
          {tt('profile.nickname')}
        </Label>
        <Input
          id='nickname'
          disabled={!isEditing}
          placeholder={tt('profile.nicknamePlaceholder')}
          className='h-11 rounded-xl text-[13px] focus-visible:ring-brand-green/40 border-slate-200 disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100 font-medium'
          {...register('nickname')}
        />
      </div>

      <div className='space-y-2'>
        <Label className='text-[13px] font-bold text-slate-800'>{tt('profile.dateOfBirth')}</Label>
        {!isEditing ? (
          <p className='h-11 flex items-center px-4 rounded-xl bg-slate-50 text-slate-600 text-[13px] border border-slate-200 font-medium'>
            {parsedDate.day && parsedDate.month && parsedDate.year
              ? `${parsedDate.day}/${parsedDate.month}/${parsedDate.year}`
              : '—'}
          </p>
        ) : (
          <div className='grid grid-cols-3 gap-3'>
            <Controller
              name='day'
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className='h-11 rounded-xl text-[13px] border-slate-200 focus:ring-brand-green/40 font-medium'>
                    <SelectValue placeholder={tt('profile.day')} />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className='h-48'>
                      {DAYS.map((d) => (
                        <SelectItem key={d} value={String(d)} className='text-[13px]'>
                          {d}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              )}
            />
            <Controller
              name='month'
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className='h-11 rounded-xl text-[13px] border-slate-200 focus:ring-brand-green/40 font-medium'>
                    <SelectValue placeholder={tt('profile.month')} />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className='h-48'>
                      {MONTHS.map((m) => (
                        <SelectItem key={m} value={String(m)} className='text-[13px]'>
                          {tt(`months.${m}`)}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              )}
            />
            <Controller
              name='year'
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className='h-11 rounded-xl text-[13px] border-slate-200 focus:ring-brand-green/40 font-medium'>
                    <SelectValue placeholder={tt('profile.year')} />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className='h-48'>
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={String(y)} className='text-[13px]'>
                          {y}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}
      </div>

      <div className='space-y-3'>
        <Label className='text-[13px] font-bold text-slate-800'>{tt('profile.gender')}</Label>
        {!isEditing ? (
          <p className='h-11 flex items-center px-4 rounded-xl bg-slate-50 text-slate-600 text-[13px] border border-slate-200 font-medium'>
            {user?.gender ? tt(`gender.${user.gender.toLowerCase()}`) : '—'}
          </p>
        ) : (
          <Controller
            name='gender'
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className='flex items-center gap-8 py-2'
              >
                {[
                  { value: 'male', label: tt('gender.male') },
                  { value: 'female', label: tt('gender.female') },
                  { value: 'other', label: tt('gender.other') }
                ].map((opt) => (
                  <div key={opt.value} className='flex items-center gap-2.5'>
                    <RadioGroupItem
                      value={opt.value}
                      id={`gender-${opt.value}`}
                      className='border-slate-300 text-brand-green w-5 h-5 data-[state=checked]:border-brand-green'
                    />
                    <Label
                      htmlFor={`gender-${opt.value}`}
                      className='cursor-pointer text-[13px] font-medium text-slate-700'
                    >
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        )}
      </div>

      <div className='space-y-2'>
        <Label className='text-[13px] font-bold text-slate-800'>{tt('profile.nationality')}</Label>
        {!isEditing ? (
          <p className='h-11 flex items-center px-4 rounded-xl bg-slate-50 text-slate-600 text-[13px] border border-slate-200 font-medium'>
            {user?.nationality
              ? tt(`nationality.${user.nationality.toLowerCase().replace(/\s+/g, '_')}`)
              : '—'}
          </p>
        ) : (
          <Controller
            name='nationality'
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className='h-11 rounded-xl text-[13px] border-slate-200 focus:ring-brand-green/40 font-medium'>
                  <SelectValue placeholder={tt('profile.nationalityPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className='h-48'>
                    {NATIONALITIES.map((n) => (
                      <SelectItem key={n} value={n} className='text-[13px]'>
                        {tt(`nationality.${n.toLowerCase().replace(/\s+/g, '_')}`)}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            )}
          />
        )}
      </div>

      <div className='flex items-center gap-3 pt-6 border-t border-slate-100 mt-8'>
        {!isEditing ? (
          <Button
            type='button'
            onClick={(e) => {
              e.preventDefault()
              setIsEditing(true)
            }}
            className='bg-brand-green hover:bg-brand-green-dark text-white px-8 h-11 rounded-xl font-bold shadow-md shadow-brand-green/20'
          >
            Sửa thông tin
          </Button>
        ) : (
          <>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              className='px-8 h-11 rounded-xl font-bold text-[13px] border-slate-200'
            >
              Hủy
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting || !isDirty}
              className='bg-brand-green hover:bg-brand-green-dark text-white px-8 h-11 rounded-xl font-bold shadow-md shadow-brand-green/20'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' /> {tt('common.saving')}
                </>
              ) : (
                tt('common.saveChanges')
              )}
            </Button>
          </>
        )}
      </div>
    </form>
  )
}
