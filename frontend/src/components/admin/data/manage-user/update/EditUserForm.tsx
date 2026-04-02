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
import { updateUserApi, uploadAvatarApi } from '@/services/user/user.api' // Đảm bảo đã export uploadAvatarApi
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Loader2, Upload } from 'lucide-react'
import {
  editUserSchema,
  type EditUserFormValues
} from '@/components/admin/data/manage-user/schema/user.schema'

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

  // Theo dõi giá trị avatar để hiển thị ảnh preview ngay lập tức
  const currentAvatar = watch('avatar')

  // Hàm xử lý upload ảnh lên S3
  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      // Gọi API Patch /api/v1/users/{userId}/avatar đã viết ở Backend
      const response = await uploadAvatarApi(user.id, file)

      // Backend trả về ApiResponse<String> chứa URL
      const avatarUrl = response.data.data

      // Cập nhật giá trị vào form field 'avatar'
      setValue('avatar', avatarUrl)
      toast.success(t('message.success.upload_avatar') || 'Upload avatar success!')
    } catch {
      toast.error(t('message.error.upload_avatar') || 'Upload failed!')
    } finally {
      setIsUploading(false)
    }
  }

  const mutation = useMutation({
    mutationFn: (values: EditUserFormValues) =>
      updateUserApi(user.id, {
        username: values.username,
        fullName: values.fullName,
        phone: values.phone,
        avatar: values.avatar, // Link ảnh mới (nếu có) sẽ được gửi ở đây
        status: values.status,
        roles: values.roles
      }),
    onSuccess: () => {
      toast.success(t('message.success.update'))
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onSuccess()
    },
    onError: (error: AxiosError<{ code?: number | string; message?: string }>) => {
      // Ép kiểu an toàn về Number để bao quát cả 2 trường hợp Backend trả về 1010 hoặc "1010"
      const errorCode = Number(error.response?.data?.code)

      if (errorCode == 1010) {
        // 1010 là mã USERNAME_EXISTED bên Backend
        setError('username', {
          type: 'server',
          message: t('message.error.username_existed')
        })
        toast.error(t('message.error.username_existed'))
      } else {
        toast.error(t('message.error.update'))
      }
    }
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className='space-y-6'>
      {/* SECTION: UPLOAD AVATAR */}
      <div className='flex flex-col items-center justify-center space-y-4 py-4 border-b bg-muted/30 rounded-t-lg'>
        <div className='relative group'>
          <img
            src={currentAvatar || 'https://ui.shadcn.com/avatars/02.png'}
            alt='Avatar Preview'
            className='w-28 h-28 rounded-full object-cover border-4 border-background shadow-sm'
          />
          {isUploading && (
            <div className='absolute inset-0 bg-black/40 rounded-full flex items-center justify-center'>
              <Loader2 className='w-8 h-8 text-white animate-spin' />
            </div>
          )}
        </div>

        <div className='flex flex-col items-center gap-2'>
          <Input
            id='avatar-input'
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleUploadAvatar}
            disabled={isUploading}
          />
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={isUploading}
            onClick={() => document.getElementById('avatar-input')?.click()}
          >
            <Upload className='w-4 h-4 mr-2' />
            {isUploading
              ? t('actions.uploading') || 'Uploading...'
              : t('actions.change_avatar') || 'Change Avatar'}
          </Button>
          <p className='text-[10px] text-muted-foreground uppercase tracking-wider font-medium'>
            JPG, PNG or GIF. Max 5MB.
          </p>
        </div>
        {/* Hidden input để hook-form nhận giá trị string avatar */}
        <input type='hidden' {...register('avatar')} />
      </div>

      {/* SECTION: USER INFO */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label>{t('fields.username.label')}</Label>
          <Input {...register('username')} placeholder='Username' />
          {errors.username && <p className='text-destructive text-sm'>{errors.username.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label>{t('fields.fullName.label')}</Label>
          <Input {...register('fullName')} placeholder='Full Name' />
        </div>

        <div className='space-y-2'>
          <Label>{t('fields.phone.label')}</Label>
          <Input {...register('phone')} placeholder='Phone Number' />
          {errors.phone && <p className='text-destructive text-sm'>{errors.phone.message}</p>}
        </div>

        {/* Status Select */}
        <div className='space-y-2'>
          <Label>{t('fields.status.label')}</Label>
          <Controller
            control={control}
            name='status'
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
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

        {/* Roles Select */}
        <div className='space-y-2'>
          <Label>{t('fields.role.label')}</Label>
          <Controller
            control={control}
            name='roles'
            render={({ field }) => (
              <Select
                value={field.value?.[0]}
                onValueChange={(value) => field.onChange([value as UserRole])}
              >
                <SelectTrigger>
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
          {errors.roles && <p className='text-destructive text-sm'>{errors.roles.message}</p>}
        </div>
      </div>

      <div className='flex justify-end pt-4 border-t gap-3'>
        <Button
          type='button'
          variant='ghost'
          onClick={onSuccess}
          disabled={mutation.isPending || isUploading}
        >
          {t('actions.cancel') || 'Cancel'}
        </Button>
        <Button type='submit' disabled={mutation.isPending || isUploading}>
          {mutation.isPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
          {t('actions.edit')}
        </Button>
      </div>
    </form>
  )
}
