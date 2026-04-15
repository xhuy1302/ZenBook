'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AxiosError } from 'axios'
import { createTagApi } from '@/services/tag/tag.api'
import type { TagResponse } from '@/services/tag/tag.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { tagSchema, type TagFormValues } from '@/components/admin/data/manage-tag/schema/tag.schema'

interface CreateTagFormProps {
  onSuccess: () => void
}

export function CreateTagForm({ onSuccess }: CreateTagFormProps) {
  const { t } = useTranslation('tag')
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch, // 👉 Thêm watch
    setValue, // 👉 Thêm setValue
    formState: { errors }
  } = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3b82f6'
    }
  })

  // 👉 "Theo dõi" biến color để đồng bộ ô Color Picker
  const currentColor = watch('color') ?? '#3b82f6'

  const mutation = useMutation<
    TagResponse,
    AxiosError<{ code?: number | string; message?: string }>,
    TagFormValues
  >({
    mutationFn: (values: TagFormValues) => createTagApi(values),
    onSuccess: () => {
      // Lấy message từ Backend hoặc dùng default
      toast.success(t('message.success.create'))
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      reset()
      onSuccess()
    },
    onError: (error: AxiosError<{ code?: number | string; message?: string }>) => {
      const errorCode = Number(error.response?.data?.code)
      if (errorCode === 9101) {
        setError('name', {
          type: 'server',
          message: t('message.error.name_existed')
        })
      } else {
        toast.error(error.response?.data?.message || t('message.error.create'))
      }
    }
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className='space-y-6'>
      <div className='space-y-5'>
        <div className='space-y-2'>
          <Label className='font-semibold'>
            {t('form.name_label')} <span className='text-red-500'>*</span>
          </Label>
          <Input {...register('name')} className='h-10' placeholder={t('form.name_placeholder')} />
          {errors.name && <p className='text-destructive text-xs italic'>{errors.name.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label className='font-semibold'>{t('form.desc_label')}</Label>
          <Input
            {...register('description')}
            className='h-10'
            placeholder={t('form.desc_placeholder')}
          />
        </div>

        <div className='space-y-2'>
          <Label className='font-semibold'>{t('form.color_label')}</Label>
          <div className='flex gap-3'>
            {/* Ô Color Picker: Dùng value & onChange thủ công để tránh xung đột register */}
            <Input
              type='color'
              value={currentColor}
              onChange={(e) => setValue('color', e.target.value, { shouldValidate: true })}
              className='w-14 h-10 p-1 cursor-pointer'
            />
            {/* Ô Text: Giữ register để gõ mã HEX */}
            <Input
              type='text'
              {...register('color')}
              className='flex-1 uppercase font-mono h-10'
              placeholder='#3B82F6'
            />
          </div>
          {errors.color && (
            <p className='text-destructive text-xs italic'>{errors.color.message}</p>
          )}
        </div>
      </div>

      <div className='flex justify-end pt-6 border-t gap-3'>
        <Button type='button' variant='ghost' onClick={onSuccess} disabled={mutation.isPending}>
          {t('actions.cancel')}
        </Button>
        <Button
          type='submit'
          disabled={mutation.isPending}
          className='px-8 bg-primary hover:bg-primary/90'
        >
          {mutation.isPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
          {t('actions.create')}
        </Button>
      </div>
    </form>
  )
}
