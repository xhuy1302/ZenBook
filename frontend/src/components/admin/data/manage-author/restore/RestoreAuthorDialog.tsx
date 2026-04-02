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
import { restoreAuthorApi } from '@/services/author/author.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RotateCcwSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

// ĐÂY CHÍNH LÀ DÒNG QUYẾT ĐỊNH
export function RestoreAuthorDialog({ authorId, name }: { authorId: string; name: string }) {
  const { t } = useTranslation('author')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => restoreAuthorApi(authorId),
    onSuccess: () => {
      toast.success(t('message.success.restore', 'Khôi phục thành công!'))
      queryClient.invalidateQueries({ queryKey: ['author-trash'] })
      queryClient.invalidateQueries({ queryKey: ['authors'] })
    },
    onError: () => {
      toast.error(t('message.error.restore', 'Khôi phục thất bại!'))
    }
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size='sm' variant='secondary'>
          <RotateCcwSquare size={18} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialogTitle.restore', 'Khôi phục tác giả')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('message.warning.restoreConfirm', { name })}
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
