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
  updateCategoryApi,
  getAllCategoriesApi,
  uploadCategoryThumbApi
} from '@/services/category/category.api'
import type { CategoryResponse } from '@/services/category/category.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Loader2, Camera, ImageIcon, X } from 'lucide-react'
import axios from 'axios'
import { cn } from '@/lib/utils'
import {
  categorySchema,
  type CategoryFormValues
} from '@/components/admin/data/manage-category/schema/category.schema'

interface EditCategoryFormProps {
  initialData: CategoryResponse
  onSuccess: () => void
}

export function EditCategoryForm({ initialData, onSuccess }: EditCategoryFormProps) {
  const { t } = useTranslation('category')
  const [previewThumb, setPreviewThumb] = useState<string | null>(initialData.thumbnailUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const queryClient = useQueryClient()

  // Lấy danh sách danh mục để chọn danh mục cha
  const { data: categories } = useQuery({
    queryKey: ['categories-list'],
    queryFn: getAllCategoriesApi
  })

  // Loại bỏ chính nó khỏi danh sách danh mục cha tiềm năng để tránh vòng lặp vô tận
  const availableParents = categories?.filter((cat) => cat.id !== initialData.id)

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryName: initialData.categoryName || '',
      slug: initialData.slug || '',
      categoryDesc: initialData.categoryDesc || '',
      parentId: initialData.parentId || null,
      displayOrder: initialData.displayOrder || 0,
      isFeatured: initialData.isFeatured || false,
      status: initialData.status || CategoryStatus.ACTIVE,
      thumbnailUrl: initialData.thumbnailUrl || ''
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

    // Giải phóng bộ nhớ của URL cũ
    if (previewThumb?.startsWith('blob:')) URL.revokeObjectURL(previewThumb)

    const objectUrl = URL.createObjectURL(file)
    setPreviewThumb(objectUrl)
    setValue('thumbnailUrl', file as unknown as string, { shouldDirty: true })
  }

  const removeThumb = () => {
    if (previewThumb) {
      if (previewThumb.startsWith('blob:')) URL.revokeObjectURL(previewThumb)
      setPreviewThumb(null)
      setValue('thumbnailUrl', '', { shouldDirty: true })
    }
  }

  const mutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      // 1. Cập nhật thông tin text
      const updatedCategory = await updateCategoryApi(initialData.id, {
        categoryName: values.categoryName,
        slug: values.slug ?? null,
        categoryDesc: values.categoryDesc || null,
        parentId: values.parentId === 'none' || !values.parentId ? null : values.parentId,
        displayOrder: Number(values.displayOrder ?? 0),
        isFeatured: Boolean(values.isFeatured),
        status: values.status,
        thumbnailUrl: values.thumbnailUrl instanceof File ? null : (values.thumbnailUrl as string)
      })

      // 2. Nếu người dùng chọn file mới thì upload file
      if (values.thumbnailUrl instanceof File) {
        setIsUploading(true)
        await uploadCategoryThumbApi(initialData.id, values.thumbnailUrl)
        setIsUploading(false)
      }
      return updatedCategory
    },
    onSuccess: () => {
      toast.success(t('message.success.update', 'Cập nhật danh mục thành công!'))
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories-list'] })
      onSuccess()
    },
    onError: (error: unknown) => {
      setIsUploading(false)
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || t('message.error.update'))
      } else {
        toast.error(t('message.error.generic'))
      }
    }
  })

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v as CategoryFormValues))}
      className='space-y-8 p-1'
    >
      {/* HEADER SECTION: THUMBNAIL */}
      <div className='flex flex-col items-center justify-center space-y-4 py-8 border-b bg-slate-50/50 dark:bg-muted/10 rounded-t-xl'>
        <div className='relative group'>
          <div
            className={cn(
              'w-52 h-36 rounded-3xl border-4 border-background shadow-xl overflow-hidden relative transition-all duration-300 group-hover:ring-4 group-hover:ring-primary/10',
              (mutation.isPending || isUploading) && 'opacity-50'
            )}
          >
            {previewThumb ? (
              <img src={previewThumb} alt='Category' className='w-full h-full object-cover' />
            ) : (
              <div className='w-full h-full bg-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400'>
                <ImageIcon className='w-10 h-10' />
                <span className='text-[10px] font-bold uppercase tracking-tighter'>No Image</span>
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
            onClick={() => document.getElementById('edit-cat-thumb-input')?.click()}
            className='absolute -bottom-2 -right-2 p-2.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform'
            disabled={mutation.isPending || isUploading}
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
            id='edit-cat-thumb-input'
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleSelectThumb}
          />
        </div>
        <div className='text-center'>
          <p className='text-[11px] text-muted-foreground uppercase tracking-widest font-bold'>
            {initialData.categoryName}
          </p>
        </div>
      </div>

      {/* FORM FIELDS */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 px-1'>
        {/* Tên danh mục */}
        <div className='space-y-2 md:col-span-2'>
          <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
            {t('table.columns.name')}
          </Label>
          <Input
            {...register('categoryName')}
            className={cn(
              'h-11',
              errors.categoryName && 'border-destructive focus-visible:ring-destructive'
            )}
          />
          {errors.categoryName && (
            <p className='text-destructive text-xs italic font-medium'>
              {errors.categoryName.message}
            </p>
          )}
        </div>

        {/* Danh mục cha */}
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
                  {availableParents?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* THỨ TỰ - ĐÃ THÊM BẮT LỖI */}
        <div className='space-y-2'>
          <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
            {t('table.columns.order')}
          </Label>
          <Input
            type='number'
            min='0'
            {...register('displayOrder', { valueAsNumber: true })}
            className={cn(
              'h-11',
              errors.displayOrder && 'border-destructive focus-visible:ring-destructive'
            )}
          />
          {errors.displayOrder && (
            <p className='text-destructive text-[11px] font-medium italic'>
              {errors.displayOrder.message}
            </p>
          )}
        </div>

        {/* Trạng thái */}
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
                  {Object.values(CategoryStatus).map((s) => (
                    <SelectItem key={s} value={s}>
                      <div className='flex items-center gap-2'>
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full',
                            s === CategoryStatus.ACTIVE ? 'bg-green-500' : 'bg-slate-400'
                          )}
                        />
                        {t(`filters.status.${s}`)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Mô tả */}
        <div className='space-y-2 md:col-span-2'>
          <Label className='font-bold text-slate-500 uppercase text-[12px] tracking-wide'>
            {t('table.columns.desc')}
          </Label>
          <Textarea
            {...register('categoryDesc')}
            className='min-h-[120px] resize-none pt-3 shadow-sm'
          />
        </div>
      </div>

      {/* FOOTER ACTIONS */}
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
