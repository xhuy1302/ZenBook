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
import { hardDeleteNewsApi } from '@/services/news/news.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function DeletePermanentNewsDialog({
  newsId,
  newsTitle
}: {
  newsId: string
  newsTitle: string
}) {
  const { t } = useTranslation('news')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => hardDeleteNewsApi(newsId),
    onSuccess: () => {
      toast.success(t('message.success.permanentDelete', 'Đã xóa vĩnh viễn bài viết!'))
      queryClient.invalidateQueries({ queryKey: ['news-trash'] })
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            t('message.error.delete', 'Xóa thất bại!')
      toast.error(message)
    }
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size='sm' variant='destructive'>
          <Trash2 size={18} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialogTitle.permanentDelete', 'Xóa vĩnh viễn?')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('message.warning.permanentDeleteConfirm', {
              defaultValue: `Bạn có chắc chắn muốn xóa vĩnh viễn bài viết "${newsTitle}"? Hành động này không thể hoàn tác.`,
              name: newsTitle
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('actions.cancel', 'Hủy')}</AlertDialogCancel>
          <AlertDialogAction
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            onClick={() => mutation.mutate()}
          >
            {t('actions.deleteForever', 'Xóa vĩnh viễn')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
