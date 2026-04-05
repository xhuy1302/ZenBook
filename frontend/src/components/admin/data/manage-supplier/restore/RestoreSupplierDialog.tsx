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
import { restoreSupplierApi } from '@/services/supplier/supplier.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RotateCcwSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function RestoreSupplierDialog({ id, name }: { id: string; name: string }) {
  const { t } = useTranslation('supplier')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => restoreSupplierApi(id),
    onSuccess: () => {
      toast.success(t('message.success.restore'))
      queryClient.invalidateQueries({ queryKey: ['supplier-trash'] })
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
    onError: () => toast.error(t('message.error.restore'))
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size='sm' variant='secondary' title={t('actions.restore')}>
          <RotateCcwSquare size={16} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialogTitle.restore')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('message.warning.restoreConfirm', { name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            className='bg-green-600 hover:bg-green-700'
            onClick={() => mutation.mutate()}
          >
            {t('actions.restore')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
