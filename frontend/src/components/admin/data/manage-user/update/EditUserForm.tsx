'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { AxiosError } from 'axios'
import { UserRole, UserStatus } from '@/defines/user.enum'
import type { User } from '@/pages/admin/manage-user/columns'
import { updateUserApi, uploadAvatarApi } from '@/services/user/user.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Loader2, Camera } from 'lucide-react'
import {
  editUserSchema,
  type EditUserFormValues
} from '@/components/admin/data/manage-user/schema/user.schema'
import { cn } from '@/lib/utils'

interface EditUserFormProps {
  user: User
  onSuccess: () => void
}

export function EditUserForm({ user, onSuccess }: EditUserFormProps) {
  const { t } = useTranslation('user')
  const [isUploading, setIsUploading] = useState(false)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    setError,
    formState: { errors }
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: user.username,
      fullName: user.fullName ?? '',
      phone: user.phone ?? '',
      avatar: user.avatar ?? '',
      status: user.status,
      roles: user.roles?.filter((r): r is UserRole =>
        Object.values(UserRole).includes(r as UserRole)
      )
    }
  })

  const currentAvatar = watch('avatar')

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const response = await uploadAvatarApi(user.id, file)
      const avatarUrl = response.data.data
      setValue('avatar', avatarUrl)
      toast.success(t('message.success.upload_avatar') || 'Cập nhật ảnh thành công!')
    } catch {
      toast.error(t('message.error.upload_avatar') || 'Upload thất bại!')
    } finally {
      setIsUploading(false)
    }
  }

  const mutation = useMutation({
    mutationFn: (values: EditUserFormValues) => updateUserApi(user.id, values),
    onSuccess: () => {
      toast.success(t('message.success.update'))
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onSuccess()
    },
    onError: (error: AxiosError<{ code?: number | string; message?: string }>) => {
      const errorCode = Number(error.response?.data?.code)
      if (errorCode === 1010) {
        setError('username', { type: 'server', message: t('message.error.username_existed') })
      } else {
        toast.error(t('message.error.update'))
      }
    }
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className='space-y-8'>
      {/* SECTION: AVATAR DISPLAY & UPLOAD */}
      <div className='flex flex-col items-center justify-center space-y-4'>
        <div className='relative group'>
          <div
            className={cn(
              'w-40 h-40 rounded-full border-4 border-background shadow-2xl overflow-hidden relative transition-all duration-300 group-hover:ring-4 group-hover:ring-primary/20',
              isUploading && 'opacity-50'
            )}
          >
            <img
              src={currentAvatar || 'https://ui.shadcn.com/avatars/02.png'}
              alt='Avatar Preview'
              className='w-full h-full object-cover'
            />
            {isUploading && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/20'>
                <Loader2 className='w-10 h-10 text-white animate-spin' />
              </div>
            )}
          </div>

          {/* Nút bấm nhanh trên ảnh */}
          <button
            type='button'
            onClick={() => document.getElementById('avatar-input')?.click()}
            className='absolute bottom-1 right-1 p-2.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50'
            disabled={isUploading}
          >
            <Camera className='w-5 h-5' />
          </button>
        </div>

        <div className='text-center'>
          <input
            id='avatar-input'
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleUploadAvatar}
            disabled={isUploading}
          />
          <p className='text-[11px] text-muted-foreground uppercase tracking-widest font-bold'>
            {isUploading ? 'Đang tải lên...' : 'Định dạng: JPG, PNG, GIF (Max 5MB)'}
          </p>
        </div>
        <input type='hidden' {...register('avatar')} />
      </div>

      {/* SECTION: USER DATA FIELDS */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5'>
        <div className='space-y-2'>
          <Label className='font-semibold'>{t('fields.username.label')}</Label>
          <Input {...register('username')} className='h-10' />
          {errors.username && (
            <p className='text-destructive text-xs italic'>{errors.username.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label className='font-semibold'>{t('fields.fullName.label')}</Label>
          <Input {...register('fullName')} className='h-10' />
        </div>

        <div className='space-y-2'>
          <Label className='font-semibold'>{t('fields.phone.label')}</Label>
          <Input {...register('phone')} className='h-10' />
          {errors.phone && (
            <p className='text-destructive text-xs italic'>{errors.phone.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label className='font-semibold'>{t('fields.status.label')}</Label>
          <Controller
            control={control}
            name='status'
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className='h-10'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(UserStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`fields.status.options.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className='space-y-2 md:col-span-2'>
          <Label className='font-semibold'>{t('fields.role.label')}</Label>
          <Controller
            control={control}
            name='roles'
            render={({ field }) => (
              <Select
                value={field.value?.[0]}
                onValueChange={(value) => field.onChange([value as UserRole])}
              >
                <SelectTrigger className='h-10'>
                  <SelectValue placeholder={t('fields.role.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(UserRole).map((role) => (
                    <SelectItem key={role} value={role}>
                      {t(`fields.role.options.${role}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.roles && (
            <p className='text-destructive text-xs italic'>{errors.roles.message}</p>
          )}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className='flex justify-end pt-6 border-t gap-3'>
        <Button
          type='button'
          variant='ghost'
          onClick={onSuccess}
          disabled={mutation.isPending || isUploading}
          className='px-6'
        >
          {t('actions.cancel')}
        </Button>
        <Button
          type='submit'
          disabled={mutation.isPending || isUploading}
          className='px-8 bg-primary hover:bg-primary/90 shadow-md'
        >
          {mutation.isPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
          {t('actions.edit')}
        </Button>
      </div>
    </form>
  )
}
