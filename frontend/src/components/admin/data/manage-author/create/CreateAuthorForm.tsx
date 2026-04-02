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
import { createAuthorApi, uploadAuthorAvatarApi } from '@/services/author/author.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Loader2, Upload } from 'lucide-react'
import axios, { AxiosError } from 'axios'
import {
  editAuthorSchema,
  type EditAuthorFormValues
} from '@/components/admin/data/manage-author/schema/author.schema'

interface CreateAuthorFormProps {
  onSuccess: () => void
}

export function CreateAuthorForm({ onSuccess }: CreateAuthorFormProps) {
  const { t } = useTranslation('author')
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm<EditAuthorFormValues>({
    resolver: zodResolver(editAuthorSchema),
    defaultValues: {
      name: '',
      nationality: '', // ✅ Thêm mặc định
      dateOfBirth: '', // ✅ Thêm mặc định (dạng YYYY-MM-DD từ input date)
      biography: '',
      avatar: '',
      status: AuthorStatus.ACTIVE
    }
  })

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

      // 1️⃣ Bước 1: Tạo Author JSON
      // ✅ Thay 'as any' bằng cách chỉ định rõ các trường gửi đi
      const newAuthor = await createAuthorApi({
        name: values.name,
        nationality: values.nationality,
        dateOfBirth: formattedDOB ?? '', // Đảm bảo không gửi null nếu backend bắt buộc string
        status: values.status,
        biography: values.biography || '',
        avatar: ''
      } as Parameters<typeof createAuthorApi>[0]) // Sử dụng Parameters để ép kiểu an toàn từ chính hàm API

      // 2️⃣ Bước 2: Upload ảnh nếu có
      // Dùng 'unknown' sau đó kiểm tra 'instanceof File' là cách chuẩn nhất để tránh lỗi 'any'
      const avatarFile = values.avatar as unknown
      if (newAuthor?.id && avatarFile instanceof File) {
        await uploadAuthorAvatarApi(newAuthor.id, avatarFile)
      }

      return newAuthor
    },
    onSuccess: () => {
      toast.success(t('message.success.create', 'Thêm tác giả thành công!'))
      queryClient.invalidateQueries({ queryKey: ['authors'] })
      if (previewAvatar) {
        URL.revokeObjectURL(previewAvatar)
        setPreviewAvatar(null)
      }
      onSuccess()
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<{ message: string }>
        const serverMessage = serverError.response?.data?.message
        if (serverMessage === 'AUTHOR_EXISTED') {
          toast.error(t('message.error.existed', 'Tên tác giả này đã tồn tại!'))
        } else {
          toast.error(serverMessage || t('message.error.create', 'Thêm tác giả thất bại!'))
        }
      } else {
        toast.error(t('message.error.generic', 'Đã có lỗi xảy ra!'))
      }
      // eslint-disable-next-line no-console
      console.error('Lỗi chi tiết:', error)
    }
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className='space-y-6'>
      {/* SECTION: AVATAR */}
      <div className='flex flex-col items-center justify-center space-y-4 py-4 border-b bg-muted/30 rounded-t-lg'>
        <div className='relative group'>
          <img
            src={previewAvatar || 'https://ui.shadcn.com/avatars/02.png'}
            className='w-24 h-24 rounded-full object-cover border-4 border-background shadow-sm'
            alt='Preview'
          />
        </div>
        <div className='flex flex-col items-center gap-2'>
          <input
            id='create-avatar'
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleSelectAvatar}
          />
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => document.getElementById('create-avatar')?.click()}
          >
            <Upload className='w-4 h-4 mr-2' />
            {t('actions.upload_avatar', 'Chọn ảnh đại diện')}
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Tên tác giả */}
        <div className='space-y-2 md:col-span-2'>
          <Label>{t('table.columns.name', 'Tên tác giả')}</Label>
          <Input {...register('name')} placeholder='VD: Nguyễn Nhật Ánh' autoComplete='off' />
          {errors.name && <p className='text-destructive text-sm'>{errors.name.message}</p>}
        </div>

        {/* ✅ Trường Quốc tịch */}
        <div className='space-y-2'>
          <Label>{t('table.columns.nationality', 'Quốc tịch')}</Label>
          <Input {...register('nationality')} placeholder='VD: Việt Nam' />
          {errors.nationality && (
            <p className='text-destructive text-sm'>{errors.nationality.message}</p>
          )}
        </div>

        {/* ✅ Trường Ngày sinh */}
        <div className='space-y-2'>
          <Label>{t('table.columns.dateOfBirth', 'Ngày sinh')}</Label>
          <Input type='date' {...register('dateOfBirth')} />
          {errors.dateOfBirth && (
            <p className='text-destructive text-sm'>{errors.dateOfBirth.message}</p>
          )}
        </div>

        {/* Trạng thái */}
        <div className='space-y-2'>
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

        {/* Tiểu sử */}
        <div className='space-y-2 md:col-span-2'>
          <Label>{t('table.columns.biography', 'Tiểu sử')}</Label>
          <Textarea
            {...register('biography')}
            className='min-h-[100px]'
            placeholder='Nhập tóm tắt tiểu sử...'
          />
        </div>
      </div>

      <div className='flex justify-end pt-4 border-t gap-3'>
        <Button type='button' variant='ghost' onClick={onSuccess}>
          {t('actions.cancel', 'Hủy')}
        </Button>
        <Button type='submit' disabled={mutation.isPending} className='bg-red-600 hover:bg-red-700'>
          {mutation.isPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
          {t('actions.create', 'Thêm mới')}
        </Button>
      </div>
    </form>
  )
}
