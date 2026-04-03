'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import i18n from '@/i18n/i18n'
import type { CategoryResponse } from '@/services/category/category.type'
import { deleteSoftCategoryApi } from '@/services/category/category.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { Trash2, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface SoftDeleteCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: CategoryResponse
}

export function SoftDeleteCategoryDialog({
  open,
  onOpenChange,
  category
}: SoftDeleteCategoryDialogProps) {
  const { t } = useTranslation('category')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteSoftCategoryApi(category.id),
    onSuccess: () => {
      toast.success(t('message.success.delete', 'Đã chuyển danh mục vào thùng rác!'))
      onOpenChange(false)

      // Làm mới danh sách chính và thùng rác để cập nhật UI
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['category-trash'] })
    },
    onError: (error: unknown) => {
      let errorMessage = t('message.error.delete', 'Xóa danh mục thất bại!')

      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<{ message?: string }>
        // Nếu Backend trả về mã lỗi cụ thể (như CATEGORY_HAS_CHILDREN)
        errorMessage = serverError.response?.data?.message || errorMessage
      }

      toast.error(errorMessage)
    }
  })

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-destructive flex items-center gap-2'>
            <Trash2 className='h-5 w-5' />
            {t('dialogTitle.delete', 'Xác nhận xóa danh mục')}
          </AlertDialogTitle>

          {/* FIX: Thêm asChild và bọc bằng div để tránh lỗi <p> lồng trong <p> */}
          <AlertDialogDescription asChild>
            <div className='space-y-2 text-sm text-muted-foreground'>
              <p className='text-foreground font-medium'>
                {t('message.success.deleteConfirm', { name: category.categoryName })}
              </p>
              <p className='text-xs italic'>
                {t(
                  'message.warning.softDeleteNote',
                  '* Danh mục này sẽ được chuyển vào thùng rác và có thể khôi phục trong vòng 30 ngày.'
                )}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className='mt-4'>
          <AlertDialogCancel disabled={mutation.isPending}>
            {i18n.t('common:common.cancel', 'Hủy')}
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button
              variant='destructive'
              disabled={mutation.isPending}
              onClick={(e) => {
                e.preventDefault() // Ngăn đóng Dialog để chờ kết quả API
                mutation.mutate()
              }}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  {t('actions.processing', 'Đang xử lý...')}
                </>
              ) : (
                <>
                  <Trash2 className='h-4 w-4 mr-2' />
                  {t('actions.confirm', 'Xác nhận xóa')}
                </>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
