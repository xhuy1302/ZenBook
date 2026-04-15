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
import { restoreTagApi } from '@/services/tag/tag.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RotateCcwSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function RestoreTagDialog({ tagId, tagName }: { tagId: string; tagName: string }) {
  const { t } = useTranslation('tag')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => restoreTagApi(tagId),
    onSuccess: (res) => {
      // res.message lấy từ Backend trả về
      const successMessage = (res as { message?: string })?.message
      toast.success(successMessage || t('message.success.restore', 'Khôi phục nhãn thành công!'))
      // Invalidate query để cập nhật UI
      queryClient.invalidateQueries({ queryKey: ['tags-trash'] })
      queryClient.invalidateQueries({ queryKey: ['tags'] })
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
          <AlertDialogTitle>{t('dialogTitle.restore', 'Khôi phục nhãn?')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              'message.warning.restoreConfirm',
              `Bạn có muốn khôi phục nhãn "${tagName}" về danh sách hoạt động không?`
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
