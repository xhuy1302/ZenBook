'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AxiosError } from 'axios'
import type { TagResponse } from '@/services/tag/tag.type'
import { updateTagApi } from '@/services/tag/tag.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { tagSchema, type TagFormValues } from '@/components/admin/data/manage-tag/schema/tag.schema'

interface EditTagFormProps {
  tag: TagResponse
  onSuccess: () => void
}

export function EditTagForm({ tag, onSuccess }: EditTagFormProps) {
  const { t } = useTranslation('tag')
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    setError,
    watch, // 👉 Thêm watch
    setValue, // 👉 Thêm setValue
    formState: { errors }
  } = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: tag.name,
      description: tag.description ?? '',
      color: tag.color ?? '#f3f4f6'
    }
  })

  const currentColor = watch('color') ?? '#f3f4f6'

  const mutation = useMutation({
    mutationFn: (values: TagFormValues) => updateTagApi(tag.id, values),
    onSuccess: (res) => {
      // Hiển thị message từ Backend trả về
      toast.success((res as { message?: string })?.message || t('message.success.update'))
      queryClient.invalidateQueries({ queryKey: ['tags'] })
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
        toast.error(error.response?.data?.message || t('message.error.update'))
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
            <Input
              type='color'
              value={currentColor}
              onChange={(e) => setValue('color', e.target.value, { shouldValidate: true })}
              className='w-14 h-10 p-1 cursor-pointer'
            />
            <Input
              type='text'
              {...register('color')}
              className='flex-1 uppercase font-mono h-10'
              placeholder='#EF4444'
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
          {t('actions.edit')}
        </Button>
      </div>
    </form>
  )
}
