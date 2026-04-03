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
import type { AuthorResponse } from '@/services/author/author.type'
import { updateAuthorApi, uploadAuthorAvatarApi } from '@/services/author/author.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Loader2, Camera } from 'lucide-react'
import axios from 'axios'
import { cn } from '@/lib/utils'
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
  const [isUploading, setIsUploading] = useState(false)
  const queryClient = useQueryClient()

  const formatDateForInput = (dateStr: string | null | undefined) => {
    if (!dateStr) return ''
    const datePart = dateStr.split(' ')[0]
    if (!datePart.includes('-')) return ''
    const [d, m, y] = datePart.split('-')
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
    setValue('avatar', file as unknown as string, { shouldDirty: true })
  }

  const mutation = useMutation({
    mutationFn: async (values: EditAuthorFormValues) => {
      let formattedDOB = null
      if (values.dateOfBirth) {
        const [y, m, d] = values.dateOfBirth.split('-')
        formattedDOB = `${d}-${m}-${y} 00:00:00`
      }

      const updateData: Parameters<typeof updateAuthorApi>[1] = {
        name: values.name,
        nationality: values.nationality,
        dateOfBirth: formattedDOB,
        biography: values.biography || '',
        avatar: typeof values.avatar === 'string' ? values.avatar : author.avatar,
        status: values.status
      }

      await updateAuthorApi(author.id, updateData)

      if (values.avatar instanceof File) {
        setIsUploading(true)
        await uploadAuthorAvatarApi(author.id, values.avatar)
        setIsUploading(false)
      }
      return true
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['authors'] })
      toast.success(t('message.success.update'))
      if (previewAvatar) URL.revokeObjectURL(previewAvatar)
      onSuccess()
    },
    onError: (error: unknown) => {
      setIsUploading(false)
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.message
        toast.error(
          serverMessage === 'AUTHOR_EXISTED'
            ? t('message.error.existed')
            : t('message.error.update')
        )
      }
    }
  })

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className='space-y-8'>
      {/* HEADER SECTION: AVATAR */}
      <div className='flex flex-col items-center justify-center space-y-4 py-6 border-b bg-slate-50/50 dark:bg-muted/10 rounded-t-xl'>
        <div className='relative group'>
          <div
            className={cn(
              'w-36 h-36 rounded-full border-4 border-background shadow-xl overflow-hidden relative transition-all duration-300 group-hover:ring-4 group-hover:ring-primary/10',
              (mutation.isPending || isUploading) && 'opacity-50'
            )}
          >
            <img
              src={
                previewAvatar ||
                (typeof currentAvatar === 'string' ? currentAvatar : '') ||
                'https://ui.shadcn.com/avatars/02.png'
              }
              alt='Author'
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
            onClick={() => document.getElementById('edit-author-avatar')?.click()}
            className='absolute bottom-1 right-1 p-2.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform'
          >
            <Camera className='w-5 h-5' />
          </button>
          <input
            id='edit-author-avatar'
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleSelectAvatar}
          />
        </div>
        <p className='text-[11px] text-muted-foreground uppercase tracking-widest font-bold'>
          {author.name}
        </p>
      </div>

      {/* FORM FIELDS */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 px-1'>
        <div className='space-y-2 md:col-span-2'>
          <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
            {t('table.columns.name')}
          </Label>
          <Input {...register('name')} className='h-11 focus-visible:ring-primary' />
          {errors.name && <p className='text-destructive text-xs italic'>{errors.name.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
            {t('table.columns.nationality')}
          </Label>
          <Input {...register('nationality')} className='h-11' />
        </div>

        <div className='space-y-2'>
          <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
            {t('table.columns.dateOfBirth')}
          </Label>
          <Input type='date' {...register('dateOfBirth')} className='h-11' />
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
                  {Object.values(AuthorStatus).map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`filters.status.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className='space-y-2 md:col-span-2'>
          <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
            {t('table.columns.biography')}
          </Label>
          <Textarea {...register('biography')} className='min-h-[120px] resize-none pt-3' />
        </div>
      </div>

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
