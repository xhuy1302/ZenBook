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
import { CategoryStatus } from '@/defines/category.enum'
import {
  createCategoryApi,
  getAllCategoriesApi,
  uploadCategoryThumbApi
} from '@/services/category/category.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Controller, useForm, type SubmitHandler, type Resolver } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Loader2, Camera, ImageIcon, X } from 'lucide-react'
import axios, { AxiosError } from 'axios'
import { cn } from '@/lib/utils'
import { z } from 'zod'
import { categorySchema } from '@/components/admin/data/manage-category/schema/category.schema'

interface CreateCategoryFormProps {
  onSuccess: () => void
}

export function CreateCategoryForm({ onSuccess }: CreateCategoryFormProps) {
  const { t } = useTranslation('category')
  const [previewThumb, setPreviewThumb] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const queryClient = useQueryClient()

  const { data: categories } = useQuery({
    queryKey: ['categories-list'],
    queryFn: getAllCategoriesApi
  })

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema) as Resolver<z.infer<typeof categorySchema>>,
    defaultValues: {
      categoryName: '',
      slug: '',
      categoryDesc: null,
      parentId: null,
      displayOrder: 0,
      isFeatured: false,
      status: CategoryStatus.ACTIVE,
      thumbnailUrl: ''
    }
  })

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = form

  const handleSelectThumb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (previewThumb) URL.revokeObjectURL(previewThumb)
    const objectUrl = URL.createObjectURL(file)
    setPreviewThumb(objectUrl)
    setValue('thumbnailUrl', file as unknown as string, { shouldDirty: true })
  }

  const removeThumb = () => {
    if (previewThumb) {
      URL.revokeObjectURL(previewThumb)
      setPreviewThumb(null)
      setValue('thumbnailUrl', '')
    }
  }

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof categorySchema>) => {
      const newCategory = await createCategoryApi({
        categoryName: values.categoryName,
        slug: values.slug || undefined,
        categoryDesc: values.categoryDesc || undefined,
        parentId: values.parentId === 'none' || !values.parentId ? null : values.parentId,
        displayOrder: Number(values.displayOrder ?? 0),
        isFeatured: Boolean(values.isFeatured),
        thumbnailUrl: ''
      })

      if (newCategory?.id && values.thumbnailUrl instanceof File) {
        setIsUploading(true)
        await uploadCategoryThumbApi(newCategory.id, values.thumbnailUrl)
        setIsUploading(false)
      }
      return newCategory
    },
    onSuccess: () => {
      toast.success(t('message.success.create', 'Thêm danh mục thành công!'))
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories-list'] })
      if (previewThumb) URL.revokeObjectURL(previewThumb)
      onSuccess()
    },
    onError: (error: unknown) => {
      setIsUploading(false)
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<{ message: string }>
        toast.error(serverError.response?.data?.message || t('message.error.create'))
      } else {
        toast.error(t('message.error.generic'))
      }
    }
  })

  const onSubmit: SubmitHandler<z.infer<typeof categorySchema>> = (data) => {
    mutation.mutate(data)
  }

  return (
    // Sử dụng h-full và flex-col để kiểm soát không gian form
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col h-full max-h-[85vh]'>
      {/* VÙNG NỘI DUNG CÓ THỂ CUỘN (SCROLLABLE AREA) */}
      <div className='flex-1 overflow-y-auto px-1 pr-3 space-y-8 scrollbar-thin scrollbar-thumb-slate-200'>
        {/* HEADER SECTION: THUMBNAIL */}
        <div className='flex flex-col items-center justify-center space-y-4 py-8 border-b bg-slate-50/50 dark:bg-muted/10 rounded-xl'>
          <div className='relative group'>
            <div
              className={cn(
                'w-48 h-32 rounded-3xl border-4 border-background shadow-xl overflow-hidden relative transition-all duration-300 group-hover:ring-4 group-hover:ring-primary/10',
                (mutation.isPending || isUploading) && 'opacity-50'
              )}
            >
              {previewThumb ? (
                <img src={previewThumb} className='w-full h-full object-cover' alt='Preview' />
              ) : (
                <div className='w-full h-full bg-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400'>
                  <ImageIcon className='w-10 h-10' />
                  <span className='text-[10px] font-bold uppercase'>Chưa có ảnh</span>
                </div>
              )}
              {(mutation.isPending || isUploading) && (
                <div className='absolute inset-0 flex items-center justify-center bg-black/10'>
                  <Loader2 className='w-8 h-8 text-white animate-spin' />
                </div>
              )}
            </div>

            <button
              type='button'
              onClick={() => document.getElementById('create-category-thumb')?.click()}
              className='absolute -bottom-2 -right-2 p-2.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform'
            >
              <Camera className='w-5 h-5' />
            </button>

            {previewThumb && !mutation.isPending && !isUploading && (
              <button
                type='button'
                onClick={removeThumb}
                className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors'
              >
                <X className='w-4 h-4' />
              </button>
            )}

            <input
              id='create-category-thumb'
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleSelectThumb}
            />
          </div>
          <p className='text-[11px] text-muted-foreground uppercase tracking-widest font-bold'>
            Ảnh bìa danh mục mới
          </p>
        </div>

        {/* FORM FIELDS GRID */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5'>
          <div className='space-y-2 md:col-span-2'>
            <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
              {t('table.columns.name')}
            </Label>
            <Input
              {...register('categoryName')}
              placeholder='VD: Sách Kinh Tế...'
              className='h-11 focus-visible:ring-primary'
            />
            {errors.categoryName && (
              <p className='text-destructive text-xs italic'>{errors.categoryName.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
              {t('table.columns.parentId')}
            </Label>
            <Controller
              control={control}
              name='parentId'
              render={({ field }) => (
                <Select
                  value={field.value || 'none'}
                  onValueChange={(val) => field.onChange(val === 'none' ? null : val)}
                >
                  <SelectTrigger className='h-11'>
                    <SelectValue placeholder={t('filters.parent.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>{t('filters.parent.none')}</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className='space-y-2'>
            <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
              {t('table.columns.order')}
            </Label>
            <Input
              type='number'
              min='0'
              className='h-11'
              {...register('displayOrder', { valueAsNumber: true })}
            />
            {errors.displayOrder && (
              <p className='text-destructive text-xs italic'>{errors.displayOrder.message}</p>
            )}
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
                    {Object.values(CategoryStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {t(`filters.status.${status}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className='space-y-2 md:col-span-2'>
            <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
              {t('table.columns.desc')}
            </Label>
            <Textarea
              {...register('categoryDesc')}
              className='min-h-[120px] resize-none pt-3 shadow-sm'
              placeholder={t('table.columns.descPlaceholder')}
            />
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS - LUÔN CỐ ĐỊNH Ở DƯỚI */}
      <div className='flex justify-end pt-6 mt-4 border-t gap-3 items-center bg-white dark:bg-slate-950/50'>
        <Button type='button' variant='ghost' onClick={onSuccess} className='px-6'>
          {t('actions.cancel')}
        </Button>
        <Button
          type='submit'
          disabled={mutation.isPending || isUploading}
          className='bg-red-600 hover:bg-red-700 text-white min-w-[140px] h-11 shadow-md'
        >
          {mutation.isPending || isUploading ? (
            <Loader2 className='w-4 h-4 animate-spin' />
          ) : (
            t('actions.create')
          )}
        </Button>
      </div>
    </form>
  )
}
