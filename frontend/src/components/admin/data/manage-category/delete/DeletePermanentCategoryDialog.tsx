'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { deleteHardCategoryApi } from '@/services/category/category.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Loader2 } from 'lucide-react' // Thêm Loader2 để hiển thị trạng thái loading
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'

interface DeletePermanentProps {
  categoryId: string
  categoryName: string
}

export function DeletePermanentCategoryDialog({ categoryId, categoryName }: DeletePermanentProps) {
  const { t } = useTranslation('category')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteHardCategoryApi(categoryId),
    onSuccess: () => {
      toast.success(t('message.success.permanentDelete'))
      queryClient.invalidateQueries({ queryKey: ['category-trash'] })
    },
    onError: (error: unknown) => {
      let errorMessage = t('message.error.delete')

      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<{ message: string }>
        errorMessage = serverError.response?.data?.message || errorMessage
      }

      toast.error(errorMessage)
    }
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size='sm' variant='destructive' title={t('actions.deleteForever')}>
          <Trash2 size={18} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-destructive font-bold'>
            {t('dialogTitle.permanentDelete')}
          </AlertDialogTitle>

          {/* FIX: Thêm asChild và bọc bằng div để tránh lỗi <p> lồng trong <p> */}
          <AlertDialogDescription asChild>
            <div className='space-y-2'>
              <p>{t('message.warning.permanentDeleteConfirm', { name: categoryName })}</p>
              <p className='font-bold '>{t('message.warning.cannotUndo')}</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            {t('actions.cancel', 'Hủy')}
          </AlertDialogCancel>
          <AlertDialogAction
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            onClick={(e) => {
              e.preventDefault() // Ngăn đóng Dialog ngay lập tức để chờ xử lý API
              mutation.mutate()
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <span className='flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                {t('actions.processing', 'Đang xóa...')}
              </span>
            ) : (
              t('actions.deleteForever', 'Xác nhận xóa')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
