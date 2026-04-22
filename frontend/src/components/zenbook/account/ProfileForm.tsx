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

import AvatarUpload from './AvatarUpload'
import { updateCustomerProfileApi } from '@/services/customer/customer.api'
import type { UserProfile, CustomerProfileUpdateRequest } from '@/services/customer/customer.type'

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
  const { t } = useTranslation('account')
  const queryClient = useQueryClient()

  // 👉 TRẠNG THÁI QUẢN LÝ CHẾ ĐỘ CHỈ XEM / SỬA
  const [isEditing, setIsEditing] = useState(false)

  const parsedDate = parseDateParts(user?.dateOfBirth)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      fullName: user?.fullName || undefined,
      nickname: user?.username || undefined,
      gender: user?.gender || undefined,
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
    onSuccess: (data, variables) => {
      toast.success(t('profile.updateSuccess', 'Cập nhật thành công!'))
      queryClient.invalidateQueries({ queryKey: ['profile'] })

      // Khóa lại form sau khi lưu thành công
      setIsEditing(false)

      // Cập nhật Header
      window.dispatchEvent(
        new CustomEvent('onProfileUpdated', {
          detail: { fullName: variables.fullName, username: variables.username }
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

  // Hàm xử lý khi bấm Hủy
  const handleCancel = () => {
    setIsEditing(false)
    reset() // Trả lại data cũ nếu đang nhập dở
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
      <div className='pb-4 border-b border-border flex justify-between items-center'>
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

      {/* Tên */}
      <div className='space-y-1.5'>
        <Label htmlFor='fullName'>{t('profile.fullName')}</Label>
        <Input
          id='fullName'
          disabled={!isEditing}
          placeholder={t('profile.fullNamePlaceholder')}
          className='focus-visible:ring-brand-green/40 disabled:bg-gray-50 disabled:text-gray-600 disabled:opacity-100'
          {...register('fullName')}
        />
        {errors.fullName && (
          <p className='text-xs text-destructive'>{t(errors.fullName.message as string)}</p>
        )}
      </div>

      {/* Biệt danh */}
      <div className='space-y-1.5'>
        <Label htmlFor='nickname'>{t('profile.nickname')}</Label>
        <Input
          id='nickname'
          disabled={!isEditing}
          placeholder={t('profile.nicknamePlaceholder')}
          className='focus-visible:ring-brand-green/40 disabled:bg-gray-50 disabled:text-gray-600 disabled:opacity-100'
          {...register('nickname')}
        />
      </div>

      {/* Ngày sinh */}
      {/* Ngày sinh */}
      <div className='space-y-1.5'>
        <Label>{t('profile.dateOfBirth')}</Label>
        {!isEditing ? (
          // ✅ Hiển thị text tĩnh — không phụ thuộc Select
          <p className='h-10 flex items-center px-3 rounded-md bg-gray-50 text-gray-600 text-sm border border-input'>
            {parsedDate.day && parsedDate.month && parsedDate.year
              ? `${parsedDate.day}/${parsedDate.month}/${parsedDate.year}`
              : '—'}
          </p>
        ) : (
          // ✅ Select chỉ render khi đang sửa — tránh vấn đề disabled + async value
          <div className='grid grid-cols-3 gap-2'>
            <Controller
              name='day'
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
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
                  <SelectTrigger>
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
                  <SelectTrigger>
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
        )}
      </div>
      {/* Giới tính */}
      <div className='space-y-2'>
        <Label>{t('profile.gender')}</Label>
        {!isEditing ? (
          <p className='h-10 flex items-center px-3 rounded-md bg-gray-50 text-gray-600 text-sm border border-input'>
            {user?.gender ? t(`gender.${user.gender}`) : '—'}
          </p>
        ) : (
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
                    <RadioGroupItem
                      value={opt.value}
                      id={`gender-${opt.value}`}
                      className='border-brand-green text-brand-green data-[state=checked]:border-brand-green data-[state=checked]:bg-brand-green'
                    />
                    <Label htmlFor={`gender-${opt.value}`} className='cursor-pointer font-normal'>
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        )}
      </div>

      {/* Quốc tịch */}
      <div className='space-y-1.5'>
        <Label>{t('profile.nationality')}</Label>
        {!isEditing ? (
          // ✅ Hiển thị text tĩnh
          <p className='h-10 flex items-center px-3 rounded-md bg-gray-50 text-gray-600 text-sm border border-input'>
            {user?.nationality
              ? t(`nationality.${user.nationality.toLowerCase().replace(/\s+/g, '_')}`)
              : '—'}
          </p>
        ) : (
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
        )}
      </div>

      {/* 👉 VÙNG HIỂN THỊ NÚT SỬA HOẶC NÚT HỦY/LƯU */}
      <div className='flex items-center gap-3 pt-4 border-t border-border'>
        {!isEditing ? (
          <Button
            type='button'
            onClick={(e) => {
              e.preventDefault()
              setIsEditing(true)
            }}
            className='bg-brand-green hover:bg-brand-green-dark text-primary-foreground px-8 h-10 rounded-lg'
          >
            Sửa thông tin
          </Button>
        ) : (
          <>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              className='px-8 h-10 rounded-lg'
            >
              Hủy
            </Button>
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
          </>
        )}
      </div>
    </form>
  )
}
