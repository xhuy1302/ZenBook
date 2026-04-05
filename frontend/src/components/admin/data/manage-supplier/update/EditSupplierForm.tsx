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
import { SupplierStatus } from '@/defines/supplier.enum'
import type { SupplierResponse } from '@/services/supplier/supplier.type'
import { updateSupplierApi } from '@/services/supplier/supplier.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { editSupplierSchema, type EditSupplierFormValues } from '../schema/supplier.schema'
import type { AxiosError } from 'axios'

interface EditSupplierFormProps {
  supplier: SupplierResponse
  onSuccess: () => void
}

export function EditSupplierForm({ supplier, onSuccess }: EditSupplierFormProps) {
  const { t } = useTranslation('supplier')
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors }
  } = useForm<EditSupplierFormValues>({
    resolver: zodResolver(editSupplierSchema),
    defaultValues: {
      name: supplier.name,
      contactName: supplier.contactName ?? '',
      taxCode: supplier.taxCode ?? '',
      email: supplier.email ?? '',
      phone: supplier.phone ?? '',
      address: supplier.address ?? '',
      website: supplier.website ?? '',
      description: supplier.description ?? '',
      status: supplier.status
    }
  })

  const mutation = useMutation({
    mutationFn: (values: EditSupplierFormValues) => updateSupplierApi(supplier.id, values),
    onSuccess: () => {
      toast.success(t('message.success.update'))
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
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
                  {Object.values(SupplierStatus)
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
