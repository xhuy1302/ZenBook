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
import { deleteHardPublisherApi } from '@/services/publisher/publisher.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function DeletePermanentPublisherDialog({ id, name }: { id: string; name: string }) {
  const { t } = useTranslation('publisher')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteHardPublisherApi(id),
    onSuccess: () => {
      toast.success(t('message.success.permanentDelete'))
      queryClient.invalidateQueries({ queryKey: ['publisher-trash'] })
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<{ code?: number; message?: string }>
      if (err.response?.data?.code === 8004) {
        toast.error(t('message.error.deleteLink'))
      } else {
        toast.error(t('message.error.permanentDelete'))
      }
    }
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size='sm' variant='destructive' title={t('actions.deleteForever')}>
          <Trash2 size={16} />
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
            className='bg-destructive hover:bg-destructive/90'
            onClick={() => mutation.mutate()}
          >
            {t('actions.deleteForever')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
