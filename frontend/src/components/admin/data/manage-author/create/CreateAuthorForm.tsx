'use client'

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
import { Loader2, Camera, X } from 'lucide-react'
import axios from 'axios'
import { cn } from '@/lib/utils'
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
  const [isUploading, setIsUploading] = useState(false)
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
      nationality: '',
      dateOfBirth: '',
      biography: '',
      avatar: '',
      status: AuthorStatus.ACTIVE
    }
  })

  const handleSelectAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (previewAvatar) URL.revokeObjectURL(previewAvatar)

    const objectUrl = URL.createObjectURL(file)
    setPreviewAvatar(objectUrl)
    setValue('avatar', file as unknown as string)
  }

  const removeAvatar = () => {
    if (previewAvatar) {
      URL.revokeObjectURL(previewAvatar)
      setPreviewAvatar(null)
      setValue('avatar', '')
    }
  }

  const mutation = useMutation({
    mutationFn: async (values: EditAuthorFormValues) => {
      let formattedDOB = null
      if (values.dateOfBirth) {
        const [y, m, d] = values.dateOfBirth.split('-')
        formattedDOB = `${d}-${m}-${y} 00:00:00`
      }

      const newAuthor = await createAuthorApi({
        name: values.name,
        nationality: values.nationality,
        dateOfBirth: formattedDOB ?? '',
        status: values.status,
        biography: values.biography || '',
        avatar: ''
      } as Parameters<typeof createAuthorApi>[0])

      const avatarFile = values.avatar as unknown
      if (newAuthor?.id && avatarFile instanceof File) {
        setIsUploading(true)
        await uploadAuthorAvatarApi(newAuthor.id, avatarFile)
        setIsUploading(false)
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
      setIsUploading(false)
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.message
        if (serverMessage === 'AUTHOR_EXISTED') {
          toast.error(t('message.error.existed', 'Tên tác giả này đã tồn tại!'))
        } else {
          toast.error(serverMessage || t('message.error.create', 'Thêm tác giả thất bại!'))
        }
      } else {
        toast.error(t('message.error.generic', 'Đã có lỗi xảy ra!'))
      }
    }
  })

  return (
    // Bọc toàn bộ form trong container có chiều cao cố định
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      className='flex flex-col h-full max-h-[85vh]'
    >
      {/* PHẦN NỘI DUNG CÓ THỂ CUỘN */}
      <div className='flex-1 overflow-y-auto px-1 pr-2 space-y-8 scrollbar-thin scrollbar-thumb-slate-200'>
        {/* HEADER SECTION: AVATAR */}
        <div className='flex flex-col items-center justify-center space-y-4 py-8 border-b bg-slate-50/50 dark:bg-muted/10 rounded-xl'>
          <div className='relative group'>
            <div
              className={cn(
                'w-36 h-36 rounded-full border-4 border-background shadow-xl overflow-hidden relative transition-all duration-300 group-hover:ring-4 group-hover:ring-primary/10',
                (mutation.isPending || isUploading) && 'opacity-50'
              )}
            >
              <img
                src={previewAvatar || 'https://ui.shadcn.com/avatars/02.png'}
                alt='Author Preview'
                className='w-full h-full object-cover'
              />
              {(mutation.isPending || isUploading) && (
                <div className='absolute inset-0 flex items-center justify-center bg-black/10'>
                  <Loader2 className='w-8 h-8 text-white animate-spin' />
                </div>
              )}
            </div>

            <button
              type='button'
              onClick={() => document.getElementById('create-author-avatar')?.click()}
              className='absolute bottom-1 right-1 p-2.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform'
              disabled={mutation.isPending || isUploading}
            >
              <Camera className='w-5 h-5' />
            </button>

            {previewAvatar && !mutation.isPending && !isUploading && (
              <button
                type='button'
                onClick={removeAvatar}
                className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 hover:scale-110 transition-all'
              >
                <X className='w-3 h-3' />
              </button>
            )}

            <input
              id='create-author-avatar'
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleSelectAvatar}
              disabled={mutation.isPending || isUploading}
            />
          </div>

          <p className='text-[11px] text-muted-foreground uppercase tracking-widest font-bold'>
            Thông tin tác giả mới
          </p>
        </div>

        {/* CÁC TRƯỜNG NHẬP LIỆU */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 px-1'>
          <div className='space-y-2 md:col-span-2'>
            <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
              {t('table.columns.name')}
            </Label>
            <Input
              {...register('name')}
              placeholder='VD: Nguyễn Nhật Ánh'
              className='h-11 focus-visible:ring-primary'
              autoComplete='off'
            />
            {errors.name && (
              <p className='text-destructive text-xs italic font-medium'>{errors.name.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
              {t('table.columns.nationality')}
            </Label>
            <Input {...register('nationality')} placeholder='VD: Việt Nam' className='h-11' />
          </div>

          <div className='space-y-2'>
            <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
              {t('table.columns.dateOfBirth')}
            </Label>
            <Input type='date' {...register('dateOfBirth')} className='h-11 cursor-pointer' />
          </div>

          <div className='space-y-2 md:col-span-2'>
            <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
              {t('table.columns.status')}
            </Label>
            <Controller
              control={control}
              name='status'
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className='h-11'>
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

          <div className='space-y-2 md:col-span-2 pb-4'>
            <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
              {t('table.columns.biography')}
            </Label>
            <Textarea
              {...register('biography')}
              className='min-h-[120px] resize-none pt-3 px-4 shadow-sm'
              placeholder='Nhập tóm tắt tiểu sử...'
            />
          </div>
        </div>
      </div>

      {/* FOOTER: CỐ ĐỊNH Ở DƯỚI */}
      <div className='flex justify-end pt-6 mt-4 border-t gap-3 items-center bg-white dark:bg-slate-950/50'>
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
          className='px-8 shadow-md min-w-[140px] h-11 bg-red-600 hover:bg-red-700 text-white'
        >
          {mutation.isPending || isUploading ? (
            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
          ) : (
            <>{t('actions.create')}</>
          )}
        </Button>
      </div>
    </form>
  )
}
