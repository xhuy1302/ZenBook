'use client'

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
import { PublisherStatus } from '@/defines/publisher.enum'
import type { PublisherResponse } from '@/services/publisher/publisher.type'
import { updatePublisherApi } from '@/services/publisher/publisher.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { editPublisherSchema, type EditPublisherFormValues } from '../schema/publisher.schema'
import type { AxiosError } from 'axios'

interface EditPublisherFormProps {
  publisher: PublisherResponse
  onSuccess: () => void
}

export function EditPublisherForm({ publisher, onSuccess }: EditPublisherFormProps) {
  const { t } = useTranslation('publisher')
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors }
  } = useForm<EditPublisherFormValues>({
    resolver: zodResolver(editPublisherSchema),
    defaultValues: {
      name: publisher.name,
      contactName: publisher.contactName ?? '',
      taxCode: publisher.taxCode ?? '',
      email: publisher.email ?? '',
      phone: publisher.phone ?? '',
      address: publisher.address ?? '',
      website: publisher.website ?? '',
      description: publisher.description ?? '',
      status: publisher.status
    }
  })

  const mutation = useMutation({
    mutationFn: (values: EditPublisherFormValues) => updatePublisherApi(publisher.id, values),
    onSuccess: () => {
      toast.success(t('message.success.update'))
      queryClient.invalidateQueries({ queryKey: ['publishers'] })
      onSuccess()
    },
    onError: (error: AxiosError<{ code?: number; message?: string }>) => {
      const errorCode = error.response?.data?.code
      if (errorCode === 8002)
        setError('email', { type: 'server', message: t('message.error.email_existed') })
      else if (errorCode === 8003)
        setError('taxCode', { type: 'server', message: t('message.error.taxCode_existed') })
      else toast.error(t('message.error.update'))
    }
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label className='font-semibold'>
            {t('fields.name.label')} <span className='text-red-500'>*</span>
          </Label>
          <Input {...register('name')} />
          {errors.name && <p className='text-destructive text-xs'>{errors.name.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label>{t('fields.taxCode.label')}</Label>
          <Input {...register('taxCode')} />
          {errors.taxCode && <p className='text-destructive text-xs'>{errors.taxCode.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label>{t('fields.contactName.label')}</Label>
          <Input {...register('contactName')} />
        </div>

        <div className='space-y-2'>
          <Label>{t('fields.phone.label')}</Label>
          <Input {...register('phone')} />
        </div>

        <div className='space-y-2'>
          <Label>{t('fields.email.label')}</Label>
          <Input {...register('email')} />
          {errors.email && <p className='text-destructive text-xs'>{errors.email.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label>{t('fields.website.label')}</Label>
          <Input {...register('website')} />
        </div>

        <div className='space-y-2'>
          <Label className='font-semibold'>{t('fields.status.label')}</Label>
          <Controller
            control={control}
            name='status'
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PublisherStatus)
                    .filter((s) => s !== 'DELETED')
                    .map((status) => (
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
          <Label>{t('fields.address.label')}</Label>
          <Input {...register('address')} />
        </div>

        <div className='space-y-2 md:col-span-2'>
          <Label>{t('fields.description.label')}</Label>
          <Textarea {...register('description')} rows={3} />
        </div>
      </div>

      <div className='flex justify-end gap-3 pt-4 border-t'>
        <Button type='button' variant='ghost' onClick={onSuccess} disabled={mutation.isPending}>
          {t('actions.cancel')}
        </Button>
        <Button type='submit' disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}{' '}
          {t('actions.edit')}
        </Button>
      </div>
    </form>
  )
}
