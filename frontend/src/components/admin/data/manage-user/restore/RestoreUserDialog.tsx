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
import { restoreUserApi } from '@/services/user/user.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RotateCcwSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function RestoreUserDialog({ userId, email }: { userId: string; email: string }) {
  const { t } = useTranslation('user')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => restoreUserApi(userId),
    onSuccess: () => {
      toast.success(t('message.success.restore'))
      // Cập nhật lại cả thùng rác VÀ danh sách người dùng chính
      queryClient.invalidateQueries({ queryKey: ['user-trash'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: () => {
      toast.error(t('message.error.restore'))
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
          <AlertDialogTitle>{t('dialogTitle.restore')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('message.warning.restoreConfirm', { email })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            className='bg-green-600 text-white hover:bg-green-700'
            onClick={() => mutation.mutate()}
          >
            {t('actions.restore')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
