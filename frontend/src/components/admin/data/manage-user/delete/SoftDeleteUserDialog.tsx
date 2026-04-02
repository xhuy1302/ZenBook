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
import type { User } from '@/pages/admin/manage-user/columns'
import { deleteSoftUserApi } from '@/services/user/user.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface DeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

export function DeleteUserDialog({ open, onOpenChange, user }: DeleteUserDialogProps) {
  const { t } = useTranslation('user')

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteSoftUserApi(user.id),
    onSuccess: () => {
      toast.success(t('message.success.delete'))
      onOpenChange(false)

      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user-trash'] })
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
            {t('message.success.deleteConfirm', { email: user.email })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{i18n.t('common:common.cancel')}</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant='destructive'
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              <Trash2 className=' h-4 w-4' />
              {t('actions.confirm')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
