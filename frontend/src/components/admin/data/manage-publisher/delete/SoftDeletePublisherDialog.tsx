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
import type { PublisherResponse } from '@/services/publisher/publisher.type'
import { deleteSoftPublisherApi } from '@/services/publisher/publisher.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface DeletePublisherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  publisher: PublisherResponse
}

export function DeletePublisherDialog({
  open,
  onOpenChange,
  publisher
}: DeletePublisherDialogProps) {
  const { t } = useTranslation('publisher')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteSoftPublisherApi(publisher.id),
    onSuccess: () => {
      toast.success(t('message.success.delete'))
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ['publishers'] })
      queryClient.invalidateQueries({ queryKey: ['publisher-trash'] })
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<{ message?: string }>
      toast.error(err.response?.data?.message || t('message.error.delete'))
    }
  })

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialogTitle.delete')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('message.success.deleteConfirm', { name: publisher.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant='destructive'
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              <Trash2 className='mr-2 h-4 w-4' /> {t('actions.confirm')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
