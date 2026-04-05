'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { createSupplierApi } from '@/services/supplier/supplier.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { AxiosError } from 'axios'
import {
  createSupplierSchema,
  type CreateSupplierFormValues
} from '@/components/admin/data/manage-supplier/schema/supplier.schema'

interface CreateSupplierFormProps {
  onSuccess: () => void
}

export function CreateSupplierForm({ onSuccess }: CreateSupplierFormProps) {
  const { t } = useTranslation('supplier')
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<CreateSupplierFormValues>({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      name: '',
      contactName: '',
      taxCode: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      description: ''
    }
  })

  const mutation = useMutation({
    mutationFn: (values: CreateSupplierFormValues) => createSupplierApi(values),
    onSuccess: () => {
      toast.success(t('message.success.create', 'Thêm nhà cung cấp thành công!'))
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      onSuccess()
    },
    onError: (error: AxiosError<{ code?: number; message?: string }>) => {
      const errorCode = error.response?.data?.code
      if (errorCode === 8002) {
        setError('email', { type: 'server', message: t('message.error.email_existed') })
      } else if (errorCode === 8003) {
        setError('taxCode', { type: 'server', message: t('message.error.taxCode_existed') })
      } else {
        toast.error(t('message.error.create', 'Thêm thất bại!'))
      }
    }
  })

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      className='flex flex-col h-full max-h-[80vh]'
    >
      {/* PHẦN NỘI DUNG CÓ THỂ CUỘN */}
      <div className='flex-1 overflow-y-auto px-1 pr-2 space-y-5 scrollbar-thin scrollbar-thumb-slate-200'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 pt-2'>
          <div className='space-y-2 md:col-span-2'>
            <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
              {t('fields.name.label')} <span className='text-red-500'>*</span>
            </Label>
            <Input
              {...register('name')}
              placeholder='VD: NXB Kim Đồng'
              className='h-11 focus-visible:ring-primary'
              autoComplete='off'
            />
            {errors.name && (
              <p className='text-destructive text-xs italic font-medium'>{errors.name.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
              {t('fields.taxCode.label')}
            </Label>
            <Input {...register('taxCode')} placeholder='VD: 0100123456' className='h-11' />
            {errors.taxCode && (
              <p className='text-destructive text-xs italic font-medium'>
                {errors.taxCode.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
              {t('fields.contactName.label')}
            </Label>
            <Input {...register('contactName')} placeholder='VD: Nguyễn Văn A' className='h-11' />
          </div>

          <div className='space-y-2'>
            <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
              {t('fields.phone.label')}
            </Label>
            <Input {...register('phone')} placeholder='VD: 0987654321' className='h-11' />
          </div>

          <div className='space-y-2'>
            <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
              {t('fields.email.label')}
            </Label>
            <Input {...register('email')} placeholder='VD: contact@nxb.com' className='h-11' />
            {errors.email && (
              <p className='text-destructive text-xs italic font-medium'>{errors.email.message}</p>
            )}
          </div>

          <div className='space-y-2 md:col-span-2'>
            <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
              {t('fields.address.label')}
            </Label>
            <Input
              {...register('address')}
              placeholder='Nhập địa chỉ nhà cung cấp'
              className='h-11'
            />
          </div>

          <div className='space-y-2 md:col-span-2'>
            <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
              {t('fields.website.label')}
            </Label>
            <Input {...register('website')} placeholder='https://...' className='h-11' />
          </div>

          <div className='space-y-2 md:col-span-2 pb-2'>
            <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
              {t('fields.description.label')}
            </Label>
            <Textarea
              {...register('description')}
              className='min-h-[100px] resize-none pt-3 px-4 shadow-sm'
              placeholder='Nhập thông tin ghi chú thêm...'
            />
          </div>
        </div>
      </div>

      {/* FOOTER: CỐ ĐỊNH Ở DƯỚI */}
      <div className='flex justify-end pt-6 mt-2 border-t gap-3 items-center bg-white dark:bg-slate-950/50'>
        <Button
          type='button'
          variant='ghost'
          onClick={onSuccess}
          disabled={mutation.isPending}
          className='px-6'
        >
          {t('actions.cancel')}
        </Button>
        <Button
          type='submit'
          disabled={mutation.isPending}
          className='px-8 shadow-md min-w-[140px] h-11 bg-primary hover:bg-primary/90 text-primary-foreground'
        >
          {mutation.isPending ? (
            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
          ) : (
            <>{t('actions.create')}</>
          )}
        </Button>
      </div>
    </form>
  )
}
