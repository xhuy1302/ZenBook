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
import type { NewsResponse } from '@/services/news/news.type'
import { softDeleteNewsApi } from '@/services/news/news.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface DeleteNewsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  news: NewsResponse
}

export function DeleteNewsDialog({ open, onOpenChange, news }: DeleteNewsDialogProps) {
  const { t } = useTranslation('news')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => softDeleteNewsApi(news.id),
    onSuccess: () => {
      toast.success(t('message.success.delete', 'Đã chuyển bài viết vào thùng rác!'))
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ['news'] })
      queryClient.invalidateQueries({ queryKey: ['news-trash'] })
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<{ message?: string }>
      toast.error(err.response?.data?.message || t('message.error.delete', 'Xóa thất bại!'))
    }
  })

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialogTitle.delete', 'Chuyển vào thùng rác?')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('message.warning.deleteConfirm', {
              defaultValue: `Bạn có chắc chắn muốn chuyển bài viết "${news.title}" vào thùng rác không?`,
              name: news.title
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{i18n.t('common:common.cancel', 'Hủy')}</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant='destructive'
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              {t('actions.confirm', 'Xác nhận')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
