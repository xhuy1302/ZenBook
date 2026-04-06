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
import { restoreCategoryApi } from '@/services/category/category.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RotateCcwSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'

interface RestoreCategoryDialogProps {
  categoryId: string
  categoryName: string
}

export function RestoreCategoryDialog({ categoryId, categoryName }: RestoreCategoryDialogProps) {
  const { t } = useTranslation('category')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => restoreCategoryApi(categoryId),
    onSuccess: () => {
      toast.success(t('message.success.restore'))
      queryClient.invalidateQueries({ queryKey: ['category-trash'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (error: unknown) => {
      let errorMessage = t('message.error.restore')

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
        <Button size='sm' variant='secondary' title={t('actions.restore')}>
          <RotateCcwSquare size={18} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialogTitle.restore', 'Khôi phục danh mục')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('message.warning.restoreConfirm', { name: categoryName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('actions.cancel', 'Hủy')}</AlertDialogCancel>
          <AlertDialogAction
            className='bg-green-600 text-white hover:bg-green-700 border-none'
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {t('actions.restore', 'Khôi phục')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
