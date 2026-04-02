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
import { deleteHardAuthorApi } from '@/services/author/author.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function DeletePermanentAuthorDialog({
  authorId,
  name
}: {
  authorId: string
  name: string
}) {
  const { t } = useTranslation('author')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteHardAuthorApi(authorId),
    onSuccess: () => {
      toast.success(t('message.success.permanentDelete'))
      queryClient.invalidateQueries({ queryKey: ['author-trash'] })
    },
    onError: () => {
      toast.error(t('message.error.delete'))
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
          <AlertDialogTitle>{t('dialogTitle.permanentDelete')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('message.warning.permanentDeleteConfirm', { name })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            onClick={() => mutation.mutate()}
          >
            {t('actions.deleteForever')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
