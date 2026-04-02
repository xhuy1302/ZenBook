import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import { AuthorStatus } from '@/defines/author.enum'
import type { AuthorResponse } from '@/services/author/author.type'
import { updateAuthorApi, uploadAuthorAvatarApi } from '@/services/author/author.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Loader2, Upload } from 'lucide-react'
import axios from 'axios'

import {
  editAuthorSchema,
  type EditAuthorFormValues
} from '@/components/admin/data/manage-author/schema/author.schema'

interface EditAuthorFormProps {
  author: AuthorResponse
  onSuccess: () => void
}

export function EditAuthorForm({ author, onSuccess }: EditAuthorFormProps) {
  const { t } = useTranslation('author')
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // ✅ Sửa kiểu dữ liệu từ (dateStr?: string) thành (dateStr: string | null | undefined)
  const formatDateForInput = (dateStr: string | null | undefined) => {
    // Kiểm tra nếu không có giá trị hoặc giá trị là null/chuỗi rỗng
    if (!dateStr) return ''

    const datePart = dateStr.split(' ')[0] // Lấy phần dd-MM-yyyy
    if (!datePart.includes('-')) return '' // Kiểm tra phòng hờ định dạng lạ

    const [d, m, y] = datePart.split('-')

    // Trả về định dạng yyyy-MM-dd mà input type="date" yêu cầu
    return `${y}-${m}-${d}`
  }

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors }
  } = useForm<EditAuthorFormValues>({
    resolver: zodResolver(editAuthorSchema),
    defaultValues: {
      name: author.name,
      nationality: author.nationality || '',
      dateOfBirth: formatDateForInput(author.dateOfBirth),
      biography: author.biography ?? '',
      avatar: author.avatar ?? '',
      status: author.status
    }
  })

  const currentAvatar = watch('avatar')

  const handleSelectAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    setPreviewAvatar(objectUrl)
    setValue('avatar', file as unknown as string)
  }

  const mutation = useMutation({
    mutationFn: async (values: EditAuthorFormValues) => {
      let formattedDOB = null
      if (values.dateOfBirth) {
        const [y, m, d] = values.dateOfBirth.split('-')
        formattedDOB = `${d}-${m}-${y} 00:00:00`
      }

      const avatarPayload = typeof values.avatar === 'string' ? values.avatar : author.avatar

      // ✅ 1. Sửa lỗi 'any' bằng cách ép kiểu chuẩn theo Parameters của API
      const updateData: Parameters<typeof updateAuthorApi>[1] = {
        name: values.name,
        nationality: values.nationality,
        dateOfBirth: formattedDOB,
        biography: values.biography || '',
        avatar: avatarPayload,
        status: values.status
      }

      await updateAuthorApi(author.id, updateData)

      // 2. Upload ảnh
      const avatarValue = values.avatar as unknown
      if (avatarValue instanceof File) {
        await uploadAuthorAvatarApi(author.id, avatarValue)
      }

      return true
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['authors'] })
      toast.success(t('message.success.update', 'Cập nhật thành công'))
      if (previewAvatar) URL.revokeObjectURL(previewAvatar)
      onSuccess()
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const serverData = error.response?.data as { message?: string }
        const serverMessage = serverData?.message
        if (serverMessage === 'AUTHOR_EXISTED') {
          toast.error(t('message.error.existed', 'Tên tác giả này đã tồn tại!'))
        } else {
          toast.error(serverMessage || t('message.error.update', 'Cập nhật thất bại'))
        }
      }
      // eslint-disable-next-line no-console
      console.error('Update error:', error)
    }
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className='space-y-6'>
      <div className='flex flex-col items-center justify-center space-y-4 py-4 border-b bg-muted/30 rounded-t-lg'>
        <div className='relative group'>
          <img
            src={
              previewAvatar ||
              (typeof currentAvatar === 'string' ? currentAvatar : '') ||
              'https://ui.shadcn.com/avatars/02.png'
            }
            alt='Avatar Preview'
            className='w-28 h-28 rounded-full object-cover border-4 border-background shadow-sm'
          />
          {mutation.isPending && (
            <div className='absolute inset-0 bg-black/40 rounded-full flex items-center justify-center'>
              <Loader2 className='w-8 h-8 text-white animate-spin' />
            </div>
          )}
        </div>

        <div className='flex flex-col items-center gap-2'>
          <input
            id='edit-avatar-input'
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleSelectAvatar}
          />
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={mutation.isPending}
            onClick={() => document.getElementById('edit-avatar-input')?.click()}
          >
            <Upload className='w-4 h-4 mr-2' />
            {t('actions.change_avatar', 'Đổi ảnh đại diện')}
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2 md:col-span-2'>
          <Label>{t('table.columns.name', 'Tên tác giả')}</Label>
          <Input {...register('name')} placeholder='Nhập tên tác giả...' />
          {errors.name && <p className='text-destructive text-sm'>{errors.name.message}</p>}
        </div>

        {/* ✅ Đã xóa trường Email ở đây */}

        <div className='space-y-2'>
          <Label>{t('table.columns.nationality', 'Quốc tịch')}</Label>
          <Input {...register('nationality')} placeholder='VD: Việt Nam' />
          {errors.nationality && (
            <p className='text-destructive text-sm'>{errors.nationality.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label>{t('table.columns.dateOfBirth', 'Ngày sinh')}</Label>
          <Input type='date' {...register('dateOfBirth')} />
          {errors.dateOfBirth && (
            <p className='text-destructive text-sm'>{errors.dateOfBirth.message}</p>
          )}
        </div>

        <div className='space-y-2 md:col-span-2'>
          <Label>{t('table.columns.status', 'Trạng thái')}</Label>
          <Controller
            control={control}
            name='status'
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(AuthorStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`filters.status.${status}`, status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className='space-y-2 md:col-span-2'>
          <Label>{t('table.columns.biography', 'Tiểu sử')}</Label>
          <Textarea
            {...register('biography')}
            placeholder='Nhập tiểu sử của tác giả...'
            className='min-h-[100px] resize-y'
          />
        </div>
      </div>

      <div className='flex justify-end pt-4 border-t gap-3'>
        <Button type='button' variant='ghost' onClick={onSuccess} disabled={mutation.isPending}>
          {t('actions.cancel', 'Hủy')}
        </Button>
        <Button type='submit' disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
          {t('actions.edit', 'Lưu thay đổi')}
        </Button>
      </div>
    </form>
  )
}
