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
import { restoreNewsApi } from '@/services/news/news.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RotateCcwSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function RestoreNewsDialog({ newsId, newsTitle }: { newsId: string; newsTitle: string }) {
  const { t } = useTranslation('news')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => restoreNewsApi(newsId),
    onSuccess: (res) => {
      const successMessage = (res as { message?: string })?.message
      toast.success(
        successMessage || t('message.success.restore', 'Khôi phục bài viết thành công!')
      )
      queryClient.invalidateQueries({ queryKey: ['news-trash'] })
      queryClient.invalidateQueries({ queryKey: ['news'] })
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t('message.error.restore', 'Khôi phục thất bại!')
      toast.error(errorMessage)
    }
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size='sm' variant='secondary' className='hover:text-green-600'>
          <RotateCcwSquare size={18} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialogTitle.restore', 'Khôi phục bài viết?')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              'message.warning.restoreConfirm',
              `Bạn có muốn khôi phục bài viết "${newsTitle}" về danh sách hoạt động không?`
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('actions.cancel', 'Hủy')}</AlertDialogCancel>
          <AlertDialogAction
            className='bg-green-600 text-white hover:bg-green-700'
            onClick={() => mutation.mutate()}
          >
            {t('actions.restore', 'Khôi phục')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
